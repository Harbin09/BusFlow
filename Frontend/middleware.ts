import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Protect Admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect Driver routes
  if (pathname.startsWith('/driver')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'DRIVER' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect Student routes
  if (pathname.startsWith('/student')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'STUDENT' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Redirect authenticated user away from login
  if (pathname === '/login' && token) {
    if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (userRole === 'DRIVER') return NextResponse.redirect(new URL('/driver/dashboard', request.url));
    if (userRole === 'STUDENT') return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/driver/:path*', '/student/:path*', '/login'],
};
