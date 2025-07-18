import { NextRequest, NextResponse } from 'next/server';

/**
 * Extract JWT token from cookies
 */
function extractTokenFromCookie(request: NextRequest): string | null {
  const cookies = request.cookies;
  const token = cookies.get('auth-token')?.value || cookies.get('token')?.value;
  
  return token || null;
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define route categories
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ];
  
  const authRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
  ];
  
  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/logout',
    '/api/check-url',
    '/api/health'
  ];
  
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/account'
  ];
  
  const staticRoutes = [
    '/_next',
    '/favicon.ico',
    '/static',
    '/images',
    '/icons'
  ];
  
  // Skip middleware for static files and Next.js internals
  if (staticRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Skip middleware for public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Skip JWT verification in middleware due to Edge Runtime limitations
  // Authentication will be handled at the API route level
  const token = extractTokenFromCookie(request);
  const isAuthenticated = !!token; // Just check if token exists
  
  // Handle auth routes (login, signup)
  if (authRoutes.includes(pathname)) {
    if (isAuthenticated) {
      // User is logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // User is not logged in, allow access to auth pages
    return NextResponse.next();
  }
  
  // Handle public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // User is not logged in, redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // User is authenticated, just continue - verification will happen at API level
    const response = NextResponse.next();
    return response;
  }
  
  // Handle protected API routes
  if (pathname.startsWith('/api/') && !publicApiRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Authentication required'
        },
        { status: 401 }
      );
    }
    
    // Token exists, continue - verification will happen at API level
    const response = NextResponse.next();
    return response;
  }
  
  // Default: allow access to other routes
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
