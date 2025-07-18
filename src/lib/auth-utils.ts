import { NextRequest } from 'next/server';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Extract user information from middleware headers
 * Use this in API routes to get authenticated user data
 */
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  try {
    const userInfoHeader = request.headers.get('x-user-info');
    
    if (!userInfoHeader) {
      return null;
    }

    const userInfo = JSON.parse(userInfoHeader) as JWTPayload;
    return userInfo;
  } catch (error) {
    console.error('Error extracting user from request:', error);
    return null;
  }
}

/**
 * Extract user ID from middleware headers
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

/**
 * Extract user email from middleware headers
 */
export function getUserEmailFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-user-email');
}

/**
 * Check if request is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  return !!request.headers.get('x-user-id');
}

/**
 * Get user information or throw error if not authenticated
 */
export function requireAuth(request: NextRequest): JWTPayload {
  const user = getUserFromRequest(request);
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return user;
}
