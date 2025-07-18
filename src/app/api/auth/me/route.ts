import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../../backend/src/models/User';
import connectToMongoDB from '../../../../../backend/src/db/mongoConnection';

interface MeResponse {
  success: boolean;
  message: string;
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

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json<MeResponse>(
        {
          success: false,
          message: 'Not authenticated'
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    let userPayload: JWTPayload;
    try {
      userPayload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json<MeResponse>(
        {
          success: false,
          message: 'Invalid token'
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToMongoDB();

    // Fetch fresh user data from database
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json<MeResponse>(
        {
          success: false,
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json<MeResponse>(
      {
        success: true,
        message: 'User authenticated',
        user: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Me route error:', error);
    
    return NextResponse.json<MeResponse>(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
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
