import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import UrlCheckHistory from '../../../../backend/src/models/UrlCheckHistory';
import connectToMongoDB from '../../../../backend/src/db/mongoConnection';

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

    // Connect to database
    await connectToMongoDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Fetch user's URL check history
    const [historyData, totalCount] = await Promise.all([
      UrlCheckHistory.find({ userId: userPayload.userId })
        .sort(sort)
        .limit(limit)
        .skip(offset)
        .select('-__v')
        .lean(),
      UrlCheckHistory.countDocuments({ userId: userPayload.userId })
    ]);

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
