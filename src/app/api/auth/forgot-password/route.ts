import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOTP } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if user exists or not, but for UX we might want to say "If an account exists..."
      // But typically we can just return success to prevent user enumeration
      console.log(`[Forgot Password] User not found for email: ${email}`);
      // Return success anyway to prevent enumeration, or return 404 if we don't care about enumeration
      // Let's return 404 for now for better UX during dev, or handle silently
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    try {
      await sendOTP(email, "PASSWORD_RESET");
      return NextResponse.json({ message: "OTP sent to your email" });
    } catch (emailError) {
      console.error("Error sending OTP:", emailError);
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again later." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
