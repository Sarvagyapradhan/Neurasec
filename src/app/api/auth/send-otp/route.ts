import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email) {
      return NextResponse.json(
        { detail: "Email is required to resend OTP" },
        { status: 400 }
      );
    }
    
    // Send request to backend to resend OTP
    const response = await axios.post(`${API_URL}/api/auth/send-otp/`, {
      email: body.email
    });
    
    // Store email in session storage for verification
    const session = request.cookies.get('session')?.value;
    const sessionData = JSON.parse(session || '{}');
    sessionData.verificationEmail = body.email;
    request.cookies.set('session', JSON.stringify(sessionData));
    
    return NextResponse.json({
      success: true,
      message: "OTP has been resent to your email"
    });
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    return NextResponse.json(
      { error: error.response?.data?.detail || "Failed to resend OTP" },
      { status: error.response?.status || 500 }
    );
  }
} 