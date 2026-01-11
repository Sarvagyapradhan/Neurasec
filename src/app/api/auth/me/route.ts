import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // First try to get token from Authorization header
    let token = null;
    const authHeader = request.headers.get("Authorization");
    
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("[me] Found token in Authorization header");
    }
    
    // If not found in header, try cookies
    if (!token) {
      token = request.cookies.get("auth_token")?.value;
      if (token) {
        console.log("[me] Found token in cookies");
      }
    }
    
    // If still no token, return unauthorized
    if (!token) {
      console.log("[me] No authentication token provided");
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }
    
    console.log("[me] Verifying user token");
    const decoded = await verifyToken(token);

    if (!decoded) {
      console.log("[me] Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = typeof decoded.userId === "string" ? parseInt(decoded.userId, 10) : decoded.userId;
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user id in token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId as number },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("[me] User authenticated successfully:", user.email);
    return NextResponse.json(user);
  } catch (error) {
    console.error("[me] Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
} 