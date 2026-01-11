import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EmailScanResult = {
  verdict: "Safe" | "Suspicious" | "Phishing";
  score: number; // 0 (safe) -> 1 (phishing)
  explanation: string;
  urlsFound: string[];
  urlScanSummaries: Array<{
    url: string;
    verdict?: string;
    score?: number;
    fromCache?: boolean;
  }>;
  signals: string[];
};

function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s<>()"]+/gi) ?? [];
  // De-dupe + basic normalization
  const unique = Array.from(new Set(matches.map(m => m.trim())));
  return unique.slice(0, 10); // keep it bounded
}

function scoreEmail(content: string, urls: string[], urlSummaries: EmailScanResult["urlScanSummaries"]) {
  const lower = content.toLowerCase();

  const signals: string[] = [];
  let risk = 0;

  const keywordRules: Array<{ k: string; w: number; label: string }> = [
    { k: "verify your account", w: 0.2, label: "Contains ‘verify your account’" },
    { k: "urgent", w: 0.08, label: "Contains ‘urgent’ language" },
    { k: "password", w: 0.08, label: "Mentions password" },
    { k: "reset", w: 0.06, label: "Mentions reset" },
    { k: "suspended", w: 0.12, label: "Mentions account suspension" },
    { k: "unusual activity", w: 0.12, label: "Mentions unusual activity" },
    { k: "click here", w: 0.08, label: "Contains ‘click here’" },
    { k: "confirm", w: 0.06, label: "Mentions confirming details" },
    { k: "invoice", w: 0.06, label: "Mentions invoice/payment" },
  ];

  for (const rule of keywordRules) {
    if (lower.includes(rule.k)) {
      risk += rule.w;
      signals.push(rule.label);
    }
  }

  if (urls.length > 0) {
    signals.push(`Contains ${urls.length} link(s)`);
    risk += Math.min(0.15, urls.length * 0.05);
  }

  // Incorporate URL scan risk (if any)
  for (const s of urlSummaries) {
    if (typeof s.score === "number") {
      risk += Math.min(0.4, s.score * 0.6);
    }
    if (s.verdict?.toLowerCase() === "malicious") {
      risk += 0.5;
      signals.push(`Linked URL flagged Malicious: ${s.url}`);
    }
    if (s.verdict?.toLowerCase() === "suspicious") {
      risk += 0.25;
      signals.push(`Linked URL flagged Suspicious: ${s.url}`);
    }
  }

  risk = Math.max(0, Math.min(1, risk));

  let verdict: EmailScanResult["verdict"] = "Safe";
  if (risk >= 0.7) verdict = "Phishing";
  else if (risk >= 0.3) verdict = "Suspicious";

  const explanation =
    verdict === "Safe"
      ? "No strong phishing indicators detected in the email content and links."
      : verdict === "Suspicious"
        ? "Some phishing indicators were detected. Review the email carefully before clicking links or sharing information."
        : "Strong phishing indicators detected. Avoid clicking links and do not share credentials or sensitive information.";

  return { verdict, score: risk, explanation, signals };
}

async function getAuthenticatedUserId(req: NextRequest): Promise<number | null> {
  const token =
    req.headers.get("Authorization")?.replace("Bearer ", "") ||
    req.cookies.get("auth_token")?.value ||
    null;
  if (!token) return null;
  try {
    const decoded = await verifyToken(token);
    const userId =
      typeof decoded.userId === "string" ? parseInt(decoded.userId, 10) : decoded.userId;
    return Number.isFinite(userId) ? (userId as number) : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const content = body?.content;

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const urlsFound = extractUrls(content);

  // Scan linked URLs using our own endpoint (so it benefits from VT + caching and persists URL scans too)
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const authHeader = req.headers.get("Authorization");

  const urlScanSummaries: EmailScanResult["urlScanSummaries"] = [];
  if (host && urlsFound.length > 0) {
    for (const url of urlsFound) {
      try {
        const resp = await fetch(`${proto}://${host}/api/scan-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({ url }),
        });
        const data = await resp.json().catch(() => null);
        urlScanSummaries.push({
          url,
          verdict: data?.verdict,
          score: data?.score,
          fromCache: data?.fromCache,
        });
      } catch {
        urlScanSummaries.push({ url });
      }
    }
  }

  const scored = scoreEmail(content, urlsFound, urlScanSummaries);
  const result: EmailScanResult = {
    verdict: scored.verdict,
    score: scored.score,
    explanation: scored.explanation,
    urlsFound,
    urlScanSummaries,
    signals: scored.signals,
  };

  // Persist email scan for authenticated users (best-effort)
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId) {
      const input = content.trim().slice(0, 10_000); // avoid storing extremely large bodies
      await prisma.scan.create({
        data: {
          userId,
          type: "email",
          input,
          result: JSON.stringify(result),
          score: result.score,
        },
      });
    }
  } catch {
    // ignore persistence errors
  }

  return NextResponse.json(result);
}

