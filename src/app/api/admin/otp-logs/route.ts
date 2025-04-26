import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    // Get the headers safely (headers() returns a promise in Next.js 15.3.1)
    const headersList = await Promise.resolve(headers());
    const authorization = headersList.get("authorization") || "";
    const adminKey = headersList.get("x-admin-key") || "";
    
    const requestHeaders: Record<string, string> = {};
    
    if (authorization) {
      requestHeaders.Authorization = authorization;
    }
    
    if (adminKey) {
      requestHeaders["X-ADMIN-KEY"] = adminKey;
    }
    
    if (!authorization && !adminKey) {
      return NextResponse.json(
        { detail: "Authentication required" },
        { status: 401 }
      );
    }
    
    const response = await axios.get(`${API_URL}/api/admin/otp-logs`, {
      headers: requestHeaders,
    });
    
    return NextResponse.json({ otps: response.data });
  } catch (error: any) {
    console.error("Admin OTP logs API error:", error.response?.data || error.message);
    
    return NextResponse.json(
      { detail: error.response?.data?.detail || "Failed to fetch OTP logs" },
      { status: error.response?.status || 500 }
    );
  }
} 