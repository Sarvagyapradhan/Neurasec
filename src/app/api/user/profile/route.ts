import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
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

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      full_name: true,
      profile_picture: true,
      is_verified: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const full_name = (body as any).full_name;
  const profile_picture = (body as any).profile_picture;

  const data: { full_name?: string | null; profile_picture?: string | null } = {};

  if (full_name !== undefined) {
    if (full_name === null) data.full_name = null;
    else if (typeof full_name === "string") data.full_name = full_name.trim() || null;
    else return NextResponse.json({ error: "full_name must be a string" }, { status: 400 });
  }

  if (profile_picture !== undefined) {
    if (profile_picture === null) data.profile_picture = null;
    else if (typeof profile_picture === "string") data.profile_picture = profile_picture.trim() || null;
    else return NextResponse.json({ error: "profile_picture must be a string" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      full_name: true,
      profile_picture: true,
      is_verified: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  return NextResponse.json(updated);
}

