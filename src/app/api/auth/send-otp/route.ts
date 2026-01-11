import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email) {
      return NextResponse.json(
        { detail: "Email is required to resend OTP" },
        { status: 400 }
      );
    }
    
    // Send OTP using our local library
    try {
        await sendOTP(body.email, 'REGISTRATION'); // Assuming registration, could be dynamic
    } catch (e) {
        console.error("Local sendOTP failed:", e);
        throw new Error("Failed to send OTP email");
    }
    
    // Store email in session storage for verification (optional/legacy)
    const session = request.cookies.get('session')?.value;
    const sessionData = JSON.parse(session || '{}');
    sessionData.verificationEmail = body.email;
    
    const response = NextResponse.json({
      success: true,
      message: "OTP has been resent to your email"
    });
    
    response.cookies.set('session', JSON.stringify(sessionData));
    return response;

  } catch (error: any) {
    console.error("Error resending OTP:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
} 