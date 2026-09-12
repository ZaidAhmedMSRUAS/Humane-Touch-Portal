import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;

    if (path.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=Forbidden', req.url));
    }
    if (path.startsWith('/trustee') && role !== 'TRUSTEE') {
      return NextResponse.redirect(new URL('/login?error=Forbidden', req.url));
    }
    if (path.startsWith('/volunteer') && role !== 'VOLUNTEER') {
      return NextResponse.redirect(new URL('/login?error=Forbidden', req.url));
    }
    if (path.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/login?error=Forbidden', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/trustee/:path*', '/volunteer/:path*', '/student/:path*'],
};