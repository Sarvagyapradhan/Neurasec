import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Try to get email from the request body first
    let email = body.email;
    
    // If no email in body, try session storage
    if (!email) {
      const session = request.cookies.get('session')?.value;
      email = session ? JSON.parse(session).verificationEmail : null;
    }
    
    // If still no email, return error
    if (!email) {
      return NextResponse.json(
        { detail: "Email is required for verification" },
        { status: 400 }
      );
    }
    
    // Send verification request to backend
    const response = await axios.post(`${API_URL}/api/auth/verify-registration/`, {
      email,
      otp: body.otp
    });
    
    // If verification is successful, clear the session storage
    if (response.data.access_token) {
      const session = request.cookies.get('session')?.value;
      if (session) {
        const sessionData = JSON.parse(session || '{}');
        delete sessionData.verificationEmail;
        request.cookies.set('session', JSON.stringify(sessionData));
      }
    }
    
    return NextResponse.json({
      ...response.data,
      success: !!response.data.access_token
    });
  } catch (error: any) {
    console.error("Verify registration API error:", error.response?.data || error.message);
    
    return NextResponse.json(
      { detail: error.response?.data?.detail || "Registration verification failed" },
      { status: error.response?.status || 500 }
    );
  }
} 