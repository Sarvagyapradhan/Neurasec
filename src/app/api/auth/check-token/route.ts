import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

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
    
    console.log("[check-token] Forwarding token to backend /me endpoint for validation...");
    
    // Call the backend /me endpoint instead of local verifyToken
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
        const response = await axios.get(`${apiUrl}/api/auth/me/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // If backend returns user data, token is valid
        console.log("[check-token] Backend /me validation successful for:", response.data?.email);
        return NextResponse.json({
            valid: true,
            // Pass through user data received from backend
            user: response.data 
        });

    } catch (backendError: any) {
        // If backend returns an error (e.g., 401), the token is invalid
        console.error("[check-token] Backend /me validation failed:", backendError.response?.data || backendError.message);
        const reason = backendError.response?.data?.detail || "Backend validation failed";
        return NextResponse.json(
            { valid: false, reason: reason }, 
            { status: backendError.response?.status || 401 } // Use backend status or default to 401
        );
    }

  } catch (error: any) {
    // Catch errors in token extraction or unexpected issues
    console.error("[check-token] Unexpected Error:", error);
    return NextResponse.json(
        { valid: false, reason: "Server error during token check" }, 
        { status: 500 }
    );
  }
} 