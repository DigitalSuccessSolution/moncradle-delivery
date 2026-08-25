import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extract token from cookies
  const token = request.cookies.get('moncradel_rider_token')?.value;

  // The path the user is trying to access
  const path = request.nextUrl.pathname;

  // Public paths that do not require authentication
  const isPublicPath = path === '/login' || path === '/register' || path === '/forgot-password';

  if (isPublicPath && token) {
    // If the user is logged in and trying to access login/register, redirect them to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicPath && !token) {
    // If the user is NOT logged in and trying to access a protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Continue normally if authenticated
  return NextResponse.next();
}

// Specify the paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|logo.png|manifest.json).*)',
  ],
};
