import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, getUserByEmail, getUserById } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { sendOTP } from '@/lib/email'; // We need to implement this
import { prisma } from '@/lib/prisma'; // Use singleton instance

// const prisma = new PrismaClient(); // Removed local instantiation


const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Frontend API /register received:', { ...body, password: '[REDACTED]', password_confirm: '[REDACTED]' });

    // Validate request body
    const validatedData = registerSchema.parse(body);
    
    if (validatedData.password !== validatedData.password_confirm) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: validatedData.email },
                { username: validatedData.username }
            ]
        }
    });

    if (existingUser) {
        return NextResponse.json({ error: "User with this email or username already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const newUser = await prisma.user.create({
        data: {
            email: validatedData.email,
            username: validatedData.username,
            password: hashedPassword,
            full_name: validatedData.full_name,
            is_verified: false // User needs to verify email
        }
    });

    // Generate and send OTP for verification
    try {
        await sendOTP(newUser.email, 'REGISTRATION');
        console.log(`OTP sent to ${newUser.email}`);
    } catch (emailError) {
        console.error("Failed to send OTP:", emailError);
        // Continue registration but warn? Or fail? 
        // Typically better to succeed creation but let user know email might be delayed
    }

    return NextResponse.json({ 
        message: "Registration successful. Please check your email to verify your account.",
        user_id: newUser.id 
    }, { status: 201 });

  } catch (error: any) {
    // Handle validation errors or other unexpected errors in this route
    if (error instanceof z.ZodError) {
        console.error("Validation error in /api/auth/register:", error.errors);
        return NextResponse.json(
            { error: 'Validation error', details: error.errors },
            { status: 400 }
        );
    }
    
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Failed to process registration request' },
      { status: 500 }
    );
  }
} 