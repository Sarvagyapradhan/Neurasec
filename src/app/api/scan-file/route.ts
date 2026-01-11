import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type FileScanResult = {
  verdict: "Safe" | "Suspicious" | "Malicious";
  score: number; // 0 (safe) -> 1 (malicious)
  explanation: string;
  sha256?: string;
  detectionDetails?: Array<{
    type: string;
    severity: "Low" | "Medium" | "High";
    description: string;
  }>;
};

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

function verdictFromVT(stats: any): { verdict: FileScanResult["verdict"]; score: number } {
  const malicious = stats?.malicious ?? 0;
  const suspicious = stats?.suspicious ?? 0;
  const harmless = stats?.harmless ?? 0;
  const undetected = stats?.undetected ?? 0;
  const total = malicious + suspicious + harmless + undetected;

  if (total <= 0) return { verdict: "Suspicious", score: 0.2 };

  const risk = Math.max(0, Math.min(1, (malicious + 0.5 * suspicious) / total));

  if (malicious >= 2 || risk >= 0.35) return { verdict: "Malicious", score: Math.max(risk, 0.7) };
  if (suspicious >= 1 || risk >= 0.15) return { verdict: "Suspicious", score: Math.max(risk, 0.25) };
  return { verdict: "Safe", score: risk };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const sha256 = crypto.createHash("sha256").update(buf).digest("hex");

  let result: FileScanResult = {
    verdict: "Suspicious",
    score: 0.2,
    explanation:
      "We could not find a prior public reputation report for this file hash. Treat it with caution.",
    sha256,
  };

  try {
    const vtResp = await fetch(`https://www.virustotal.com/api/v3/files/${sha256}`, {
      method: "GET",
      headers: {
        "x-apikey": apiKey,
        Accept: "application/json",
      },
    });

    if (vtResp.status === 404) {
      // No report (deterministic)
      result = {
        verdict: "Suspicious",
        score: 0.2,
        explanation:
          "No VirusTotal report found for this file hash yet. If this file is unexpected, avoid running it.",
        sha256,
        detectionDetails: [
          {
            type: "Reputation",
            severity: "Low",
            description: "No known report found for this SHA256.",
          },
        ],
      };
    } else if (!vtResp.ok) {
      const text = await vtResp.text().catch(() => "");
      result = {
        verdict: "Suspicious",
        score: 0.3,
        explanation: `File reputation lookup failed. (${vtResp.status})`,
        sha256,
        detectionDetails: [
          {
            type: "VirusTotal",
            severity: "Low",
            description: text || vtResp.statusText,
          },
        ],
      };
    } else {
      const data = await vtResp.json();
      const attrs = data?.data?.attributes;
      const stats = attrs?.last_analysis_stats;
      const computed = verdictFromVT(stats);

      const malicious = stats?.malicious ?? 0;
      const suspicious = stats?.suspicious ?? 0;
      const harmless = stats?.harmless ?? 0;
      const undetected = stats?.undetected ?? 0;
      const total = malicious + suspicious + harmless + undetected;

      result = {
        verdict: computed.verdict,
        score: computed.score,
        sha256,
        explanation:
          computed.verdict === "Safe"
            ? `Most engines consider this file clean (${harmless + undetected}/${total}).`
            : computed.verdict === "Suspicious"
              ? `Some engines flagged this file as suspicious (${suspicious}/${total}).`
              : `Multiple engines flagged this file as malicious (${malicious}/${total}).`,
        detectionDetails: [
          {
            type: "Detections",
            severity: computed.verdict === "Malicious" ? "High" : computed.verdict === "Suspicious" ? "Medium" : "Low",
            description: `Malicious: ${malicious}, Suspicious: ${suspicious}, Total engines: ${total}`,
          },
        ],
      };
    }
  } catch (e) {
    result = {
      verdict: "Suspicious",
      score: 0.3,
      explanation: "File reputation lookup failed due to a network or service error. Try again later.",
      sha256,
    };
  }

  // Persist file scan for authenticated users (best-effort)
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId) {
      await prisma.scan.create({
        data: {
          userId,
          type: "file",
          input: JSON.stringify({
            filename: file.name,
            size: file.size,
            type: file.type,
            sha256,
          }),
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

