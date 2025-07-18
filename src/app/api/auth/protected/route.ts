import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, JWTPayload } from '../../../../lib/auth-utils';
import User from '../../../../../backend/src/models/User';
import connectToMongoDB from '../../../../../backend/src/db/mongoConnection';

interface ProtectedResponse {
  success: boolean;
  message: string;
  user?: {
    userId: string;
    email: string;
    createdAt: Date;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware (already authenticated)
    const userPayload: JWTPayload | null = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json<ProtectedResponse>(
        {
          success: false,
          message: 'Unauthorized - User not authenticated'
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToMongoDB();

    // Fetch user details from database (optional - for fresh data)
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json<ProtectedResponse>(
        {
          success: false,
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    // Return protected data
    return NextResponse.json<ProtectedResponse>(
      {
        success: true,
        message: 'Access granted to protected route',
        user: {
          userId: user._id.toString(),
          email: user.email,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Protected route error:', error);
    
    return NextResponse.json<ProtectedResponse>(
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
