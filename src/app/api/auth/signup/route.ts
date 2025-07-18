import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import User from '../../../../../backend/src/models/User';
import connectToMongoDB from '../../../../../backend/src/db/mongoConnection';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation requirements
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  user?: {
    userId: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SignupRequest = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: 'Name, email and password are required'
        },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: 'Name must be at least 2 characters long'
        },
        { status: 400 }
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: 'Name must be less than 50 characters long'
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
        },
        { status: 400 }
      );
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: `Password must be less than ${MAX_PASSWORD_LENGTH} characters long`
        },
        { status: 400 }
      );
    }

    // Additional password strength validation (optional)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToMongoDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: 'User with this email already exists'
        },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed by pre-save middleware)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      hashedPassword: password, // This will be hashed by the pre-save middleware
      createdAt: new Date()
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token for immediate login
    const payload = {
      userId: newUser._id.toString(),
      email: newUser.email
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Create secure httpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };

    const serializedCookie = cookie.serialize('auth-token', token, cookieOptions);

    // Return success response (exclude password hash)
    const response = NextResponse.json<SignupResponse>(
      {
        success: true,
        message: 'User created successfully',
        user: {
          userId: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
        }
      },
      { status: 201 }
    );

    // Set secure httpOnly cookie using Set-Cookie header
    response.headers.set('Set-Cookie', serializedCookie);

    return response;

  } catch (error) {
    console.error('Signup error:', error);

    // Handle MongoDB duplicate key error
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: 'User with this email already exists'
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json<SignupResponse>(
        {
          success: false,
          message: 'Invalid user data provided'
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json<SignupResponse>(
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
