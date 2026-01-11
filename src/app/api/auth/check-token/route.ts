import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  let token: string | undefined | null = null;
  
  try {
    // Get token from URL parameters first
    token = request.nextUrl.searchParams.get("token");
    if (token) console.log("[check-token] Found token in URL parameters");
    
    // If not in URL params, try Authorization header
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        console.log("[check-token] Found token in Authorization header");
      }
    }
    
    // If still not found, try cookies
    if (!token) {
      token = request.cookies.get("auth_token")?.value;
      if (token) console.log("[check-token] Found token in cookies");
    }
    
    // If still no token, return unauthorized
    if (!token) {
      console.log("[check-token] No authentication token provided");
      return NextResponse.json({ valid: false, reason: "No token provided" }, { status: 401 });
    }
    
    console.log("[check-token] Verifying token locally...");
    
    try {
        // Verify token locally
        const decoded = await verifyToken(token);
        
        // Fetch user from DB to ensure they still exist and get latest data
        const user = await getUserById(decoded.userId);
        
        if (!user) {
            console.error("[check-token] User not found for valid token ID:", decoded.userId);
            return NextResponse.json({ valid: false, reason: "User no longer exists" }, { status: 401 });
        }

        console.log("[check-token] Token verified for user:", user.email);
        
        return NextResponse.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });

    } catch (verifyError: any) {
        console.error("[check-token] Token verification failed:", verifyError.message);
        return NextResponse.json(
            { valid: false, reason: "Invalid or expired token" }, 
            { status: 401 }
        );
    }

  } catch (error: any) {
    console.error("[check-token] Unexpected Error:", error);
    return NextResponse.json(
        { valid: false, reason: "Server error during token check" }, 
        { status: 500 }
    );
  }
} 