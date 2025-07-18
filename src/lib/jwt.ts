import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Verify JWT token and extract user information
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  
  if (!authorization) {
    return null;
  }

  // Check for Bearer token format
  const bearerToken = authorization.split(' ');
  if (bearerToken.length !== 2 || bearerToken[0] !== 'Bearer') {
    return null;
  }

  return bearerToken[1];
}

/**
 * Middleware function to authenticate requests
 */
export function authenticateRequest(request: NextRequest): JWTPayload | null {
  const token = extractTokenFromHeader(request);
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}
