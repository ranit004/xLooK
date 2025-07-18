import { NextRequest, NextResponse } from 'next/server';
import * as cookie from 'cookie';

interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Create JSON response for logout
    const response = NextResponse.json<LogoutResponse>(
      {
        success: true,
        message: 'Logged out successfully'
      },
      { status: 200 }
    );

    // Clear the httpOnly auth cookie using cookie library
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 0, // Expire immediately
      path: '/'
    };

    const authCookie = cookie.serialize('auth-token', '', cookieOptions);
    const tokenCookie = cookie.serialize('token', '', cookieOptions);

    response.headers.set('Set-Cookie', authCookie);
    response.headers.append('Set-Cookie', tokenCookie);

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Return JSON error response
    const response = NextResponse.json<LogoutResponse>(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
    
    // Still clear cookies even on error
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 0,
      path: '/'
    };

    const authCookie = cookie.serialize('auth-token', '', cookieOptions);
    response.headers.set('Set-Cookie', authCookie);
    
    return response;
  }
}

// Handle GET requests for logout (common for logout links)
export async function GET(request: NextRequest) {
  try {
    // Get the origin from the request to build the redirect URL
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const loginUrl = new URL('/login', origin);
    
    // Create redirect response to login page
    const response = NextResponse.redirect(loginUrl, { status: 302 });

    // Clear the httpOnly auth cookie using cookie library
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 0, // Expire immediately
      path: '/'
    };

    const authCookie = cookie.serialize('auth-token', '', cookieOptions);
    const tokenCookie = cookie.serialize('token', '', cookieOptions);

    response.headers.set('Set-Cookie', authCookie);
    response.headers.append('Set-Cookie', tokenCookie);

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // If redirect fails, return JSON response
    const response = NextResponse.json<LogoutResponse>(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
    
    // Still clear cookies even on error
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  }
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}
