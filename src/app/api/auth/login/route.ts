import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to check if a user exists
async function checkUserExists(usernameOrEmail: string): Promise<boolean> {
  try {
    // Call the user-check API endpoint
    const response = await axios.get(`${API_URL}/api/users/check-exists?identifier=${usernameOrEmail}`);
    return response.data?.exists === true;
  } catch (error) {
    // If the API call fails, we can't determine if the user exists
    console.error('Error checking if user exists:', error);
    return false; // Default to false
  }
}

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

    // Send the request to the backend
    try {
      console.log(`Attempting backend authentication for ${username_or_email}`);
      
      const response = await axios.post(`${API_URL}/api/auth/login/`, {
        username_or_email,
        password,
      });

      // Return success with the access token
      return NextResponse.json({ 
        access_token: response.data.access_token,
        message: 'Login successful',
        token: response.data.access_token,
        user: response.data.user || { 
          id: 'temp-id',
          email: username_or_email,
          username: username_or_email.includes('@') ? username_or_email.split('@')[0] : username_or_email
        }
      });
      
    } catch (error) {
      console.error('Backend authentication error:', error);
      
      if (axios.isAxiosError(error)) {
        // Check if it's a connection error (like ECONNREFUSED)
        if (error.code === 'ECONNREFUSED' || !error.response) {
          console.warn('Connection to backend failed - using fallback authentication for development');
          
          // In development, provide a fallback success response for testing
          if (process.env.NODE_ENV !== 'production') {
            console.log('Development mode: returning mock successful auth response');
            return NextResponse.json({
              access_token: 'dev-fallback-token',
              token: 'dev-fallback-token',
              message: 'Login successful (dev fallback)',
              user: {
                id: '999',
                email: username_or_email,
                username: username_or_email.includes('@') ? username_or_email.split('@')[0] : username_or_email
              }
            });
          }
          
          return NextResponse.json(
            { 
              error: 'Cannot connect to authentication service',
              detail: 'The authentication service is currently unavailable. Please try again later.'
            }, 
            { status: 503 }
          );
        }
        
        // Map backend errors to user-friendly messages
        const status = error.response?.status || 500;
        
        if (status === 404) {
          return NextResponse.json(
            { 
              error: 'Username or email does not exist',
              detail: 'No user found with the provided credentials'
            }, 
            { status: 404 }
          );
        } else if (status === 401) {
          return NextResponse.json(
            { 
              error: 'Incorrect password',
              detail: 'The password provided is incorrect'
            }, 
            { status: 401 }
          );
        } else if (status === 403) {
          return NextResponse.json(
            { 
              error: 'Account not verified. Please check your email',
              detail: 'The account exists but has not been verified yet'
            }, 
            { status: 403 }
          );
        } else {
          // Other backend errors
          return NextResponse.json(
            { 
              error: 'Authentication failed. Please try again later.',
              detail: error.response?.data || 'Unknown backend error'
            }, 
            { status: status }
          );
        }
      }
      
      // Non-Axios errors
      return NextResponse.json(
        { 
          error: 'An unexpected error occurred',
          detail: error instanceof Error ? error.message : 'Unknown error'
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login route error:', error);
    
    // Handle any other errors in the route itself
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        detail: error instanceof Error ? error.message : 'Unknown error during login'
      }, 
      { status: 500 }
    );
  }
} 