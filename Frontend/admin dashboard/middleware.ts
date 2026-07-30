import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('bus_flow_auth_token')?.value;
  const role = request.cookies.get('bus_flow_role')?.value;

  // Helper to verify if token is expired
  const isTokenExpired = (jwtToken: string) => {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= now;
    } catch {
      return true;
    }
  };

  const isAuthed = token && !isTokenExpired(token);

  // If trying to access protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthed) {
      // Clear invalid credentials and send to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('bus_flow_auth_token');
      response.cookies.delete('bus_flow_role');
      return response;
    }

    const isStudentPath = pathname.startsWith('/admin/student');
    const isDriverPath = pathname.startsWith('/admin/driver');
    const isAdminPath = !isStudentPath && !isDriverPath;

    if (isStudentPath && role !== 'STUDENT' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isDriverPath && role !== 'DRIVER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAdminPath && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated user away from login page
  if (pathname === '/login' && isAuthed) {
    if (role === 'STUDENT') {
      return NextResponse.redirect(new URL('/admin/student', request.url));
    }
    if (role === 'DRIVER') {
      return NextResponse.redirect(new URL('/admin/driver', request.url));
    }
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
