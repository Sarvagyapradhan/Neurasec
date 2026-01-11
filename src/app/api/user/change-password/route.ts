import { NextRequest, NextResponse } from "next/server";
import { verifyToken, comparePasswords, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (typeof currentPassword !== "string" || !currentPassword) {
    return NextResponse.json({ error: "currentPassword is required" }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "newPassword must be at least 8 characters" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const ok = await comparePasswords(currentPassword, user.password);
  if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true });
}

