import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "@/lib/auth";
import { prisma } from '@/lib/prisma'; // Use singleton instance

// const prisma = new PrismaClient(); // Removed local instantiation


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Verify request body:', body);
    
    const { email, otp } = body;
    
    if (!email || !otp) {
      return NextResponse.json(
        { detail: "Email and OTP are required" },
        { status: 400 }
      );
    }
    
    // Find the latest valid OTP for this user
    const validOTP = await prisma.oTP.findFirst({
        where: {
            email: email,
            code: otp,
            type: 'REGISTRATION',
            expiresAt: {
                gt: new Date()
            },
            usedAt: null
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (!validOTP) {
        console.log(`[Verify] Invalid or expired OTP for ${email}: ${otp}`);
        return NextResponse.json(
            { detail: "Invalid or expired OTP" },
            { status: 400 }
        );
    }

    // Mark OTP as used
    await prisma.oTP.update({
        where: { id: validOTP.id },
        data: { usedAt: new Date() }
    });

    // Verify user
    const user = await prisma.user.update({
        where: { email },
        data: { 
            is_verified: true,
            emailVerified: new Date()
        }
    });

    // Generate token
    const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.username
    });
    
    return NextResponse.json({
      access_token: token,
      message: "Registration verified successfully",
      success: true
    });

  } catch (error: any) {
    console.error("Verify registration API error:", error);
    
    return NextResponse.json(
      { detail: "Registration verification failed" },
      { status: 500 }
    );
  }
} 