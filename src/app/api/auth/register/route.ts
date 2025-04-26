import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    
    // Send request to Django backend
    console.log('Attempting backend registration...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/register/`, {
        email: validatedData.email,
        username: validatedData.username,
        password: validatedData.password,
        password_confirm: validatedData.password_confirm,
        full_name: validatedData.full_name
      }, {
          headers: {
              'Content-Type': 'application/json',
          }
      });
      
      console.log('Backend registration response status:', response.status);
      
      // Return the successful response
      return NextResponse.json(response.data, { status: response.status });

    } catch (backendError: any) {
      // Handle errors from the backend API call
      console.error('Backend registration error:', backendError.response?.data || backendError.message);
      return NextResponse.json(
        { error: backendError.response?.data?.detail || 'Registration failed' },
        { status: backendError.response?.status || 500 }
      );
    }

  } catch (error: any) {
    // Handle validation errors or other unexpected errors in this route
    if (error instanceof z.ZodError) {
        console.error("Validation error in /api/auth/register:", error.errors);
        return NextResponse.json(
            { error: 'Validation error', details: error.errors },
            { status: 400 }
        );
    }
    
    console.error('Overall Register API error:', error);
    return NextResponse.json(
      { error: 'Failed to process registration request' },
      { status: 500 }
    );
  }
} 