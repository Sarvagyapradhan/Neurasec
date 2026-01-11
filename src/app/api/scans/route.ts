import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice("Bearer ".length).trim();
  return null;
}

async function getAuthenticatedUserId(req: NextRequest): Promise<number | null> {
  const token = getBearerToken(req) ?? req.cookies.get("auth_token")?.value ?? null;
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

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? undefined;
  const limitParam = req.nextUrl.searchParams.get("limit");
  const cursorParam = req.nextUrl.searchParams.get("cursor");

  const takeRaw = limitParam ? parseInt(limitParam, 10) : 20;
  const take = Number.isFinite(takeRaw) ? Math.min(Math.max(takeRaw, 1), 100) : 20;

  const cursorIdRaw = cursorParam ? parseInt(cursorParam, 10) : null;
  const cursorId = cursorIdRaw && Number.isFinite(cursorIdRaw) ? cursorIdRaw : null;

  const scans = await prisma.scan.findMany({
    where: {
      userId,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursorId
      ? {
          cursor: { id: cursorId },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      type: true,
      input: true,
      result: true,
      score: true,
      createdAt: true,
    },
  });

  const nextCursor = scans.length === take ? scans[scans.length - 1]?.id ?? null : null;
  return NextResponse.json({ scans, nextCursor });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = (body as any).type;
  const input = (body as any).input;
  const score = (body as any).score;
  const result = (body as any).result;

  if (typeof type !== "string" || !type.trim()) {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }
  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return NextResponse.json({ error: "score must be a number" }, { status: 400 });
  }

  const resultString =
    typeof result === "string" ? result : JSON.stringify(result ?? {}, null, 0);

  const created = await prisma.scan.create({
    data: {
      userId,
      type,
      input,
      result: resultString,
      score,
    },
    select: {
      id: true,
      type: true,
      input: true,
      score: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ scan: created }, { status: 201 });
}

