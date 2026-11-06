import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // FR-04, SEC-02: Enforce role-based access
    // A customer attempting to access tailor routes receives 403 Forbidden
    if (pathname.startsWith('/tailor') && token?.role !== 'TAILOR') {
      return new NextResponse('Forbidden: Tailor access required', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes: home, auth pages, and public assets
        if (
          pathname === '/' ||
          pathname.startsWith('/auth') ||
          pathname.startsWith('/api/auth')
        ) {
          return true;
        }

        // Protected routes require an active session token (SEC-01)
        return !!token;
      },
    },
    pages: {
      signIn: '/auth?mode=login',
    },
  }
);

export const config = {
  matcher: [
    '/customer/:path*',
    '/tailor/:path*',
    '/api/customer/:path*',
    '/api/tailor/:path*',
  ],
};

