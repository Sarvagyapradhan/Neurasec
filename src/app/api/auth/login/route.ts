import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { comparePasswords, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma'; // Use singleton instance

// const prisma = new PrismaClient(); // Removed local instantiation


// This is a fixed local login route that works with either our local auth or the backend API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username_or_email, password } = body;

    // Validate the input
    if (!username_or_email || !password) {
      return NextResponse.json(
        { 
          error: 'Username/email and password are required',
          detail: 'Missing required login credentials'
        }, 
        { status: 400 }
      );
    }

    // Determine if input is email or username
    const isEmail = username_or_email.includes('@');
    
    // Find user
    const user = await prisma.user.findFirst({
        where: isEmail 
            ? { email: username_or_email }
            : { username: username_or_email }
    });

    if (!user) {
        console.log(`[Login] User not found: ${username_or_email}`);
        const responseBody = { 
              error: 'Username or email does not exist',
              detail: 'No user found with the provided credentials'
        };
        console.log('[Login] Returning 404:', responseBody);
        return NextResponse.json(responseBody, { status: 404 });
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, user.password);
    
    if (!isValidPassword) {
        console.log(`[Login] Invalid password for user: ${username_or_email}`);
        const responseBody = { 
              error: 'Incorrect password',
              detail: 'The password provided is incorrect'
        };
        console.log('[Login] Returning 401:', responseBody);
        return NextResponse.json(responseBody, { status: 401 });
    }

    // Check if verified (optional, depending on flow)
    // if (!user.is_verified) {
    //     return NextResponse.json({ error: "Account not verified" }, { status: 403 });
    // }

    // Generate Token locally
    const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.username
    });

    return NextResponse.json({ 
        access_token: token,
        message: 'Login successful',
        user: { 
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
    });

  } catch (error: any) {
    console.error('Login route error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
    }

    return NextResponse.json(
      { 
        error: 'Login failed',
        detail: errorMessage
      }, 
      { status: 500 }
    );
  }
} 