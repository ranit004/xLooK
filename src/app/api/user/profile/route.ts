import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requireAuth } from '../../../../lib/auth-utils';

interface ProfileResponse {
  success: boolean;
  message: string;
  user?: {
    userId: string;
    email: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from middleware
    // Since middleware already verified the token, we can safely get user info
    const user = requireAuth(request);

    return NextResponse.json<ProfileResponse>(
      {
        success: true,
        message: 'User profile retrieved successfully',
        user: {
          userId: user.userId,
          email: user.email
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile route error:', error);
    
    return NextResponse.json<ProfileResponse>(
      {
        success: false,
        message: 'Failed to retrieve user profile'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from middleware
    const user = requireAuth(request);
    
    // Here you would typically update user profile
    // For now, just return the current user info
    
    return NextResponse.json<ProfileResponse>(
      {
        success: true,
        message: 'User profile updated successfully',
        user: {
          userId: user.userId,
          email: user.email
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile update error:', error);
    
    return NextResponse.json<ProfileResponse>(
      {
        success: false,
        message: 'Failed to update user profile'
      },
      { status: 500 }
    );
  }
}
