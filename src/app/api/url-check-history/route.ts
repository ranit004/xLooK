import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HistoryResponse {
  success: boolean;
  message: string;
  data?: any[];
  totalCount?: number;
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
      return NextResponse.json<HistoryResponse>(
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
      return NextResponse.json<HistoryResponse>(
        {
          success: false,
          message: 'Invalid token'
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortOrder = (searchParams.get('sortOrder') || 'desc').toLowerCase() as 'asc' | 'desc';

    // Fetch user's URL check history from SQLite database
    const [historyDataRaw, totalCount] = await Promise.all([
      prisma.urlCheckHistory.findMany({
        where: { userId: userPayload.userId },
        orderBy: { checkedAt: sortOrder },
        take: limit,
        skip: offset
      }),
      prisma.urlCheckHistory.count({
        where: { userId: userPayload.userId }
      })
    ]);

    // Parse scanResults JSON strings back into objects
    const historyData = historyDataRaw.map(item => ({
      ...item,
      scanResults: item.scanResults ? JSON.parse(item.scanResults) : null
    }));

    return NextResponse.json<HistoryResponse>(
      {
        success: true,
        message: 'URL check history retrieved successfully',
        data: historyData,
        totalCount
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('URL check history error:', error);
    
    return NextResponse.json<HistoryResponse>(
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
