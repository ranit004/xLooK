import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import User from '../../../../../backend/src/models/User';
import connectToMongoDB from '../../../../../backend/src/db/mongoConnection';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    userId: string;
    email: string;
    name: string;
    createdAt: Date;
  };
}

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Email and password are required'
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToMongoDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Compare password with bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    
    if (!isPasswordValid) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Create JWT token with userId and email
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Create secure httpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };

    const serializedCookie = cookie.serialize('auth-token', token, cookieOptions);

    // Return success response with JWT token
    const response = NextResponse.json<LoginResponse>(
      {
        success: true,
        message: 'Login successful',
        user: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

    // Set secure httpOnly cookie using Set-Cookie header
    response.headers.set('Set-Cookie', serializedCookie);

    return response;

  } catch (error) {
    console.error('Login error:', error);

    // Generic error response
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
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
