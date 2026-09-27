import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, JWTPayload } from '../../../../lib/auth-utils';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    const userPayload: JWTPayload | null = getUserFromRequest(request);

    if (!userPayload) {
      return NextResponse.json<ProtectedResponse>(
        { success: false, message: 'Unauthorized - User not authenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
    });

    if (!user) {
      return NextResponse.json<ProtectedResponse>(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ProtectedResponse>(
      {
        success: true,
        message: 'Access granted to protected route',
        user: {
          userId: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Protected route error:', error);
    return NextResponse.json<ProtectedResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
