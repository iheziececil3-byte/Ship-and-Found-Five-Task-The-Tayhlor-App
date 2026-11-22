import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from 'next/server';
import {
  checkFormRateLimit,
  getRateLimitedEndpoint,
  type RateLimitResult,
} from '@/lib/rate-limit';

function applyRateLimitHeaders(
  response: Response,
  rateLimit: RateLimitResult
): void {
  const resetSeconds = Math.ceil(rateLimit.reset / 1000);

  response.headers.set('RateLimit-Limit', String(rateLimit.limit));
  response.headers.set('RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('RateLimit-Reset', String(resetSeconds));
  response.headers.set('Retry-After', String(rateLimit.retryAfterSeconds));

  // Widely deployed compatibility names.
  response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(resetSeconds));
}

function rateLimitResponse(rateLimit: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: rateLimit.storeUnavailable
        ? 'Rate limiting is temporarily unavailable. Please try again later.'
        : 'Too many requests. Please wait a moment before trying again.',
    },
    { status: rateLimit.storeUnavailable ? 503 : 429 }
  );

  applyRateLimitHeaders(response, rateLimit);
  return response;
}

const authMiddleware = withAuth(
  function enforceRoles(req: NextRequestWithAuth) {
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

export default async function middleware(
  req: NextRequest,
  event: NextFetchEvent
) {
  const rateLimitedEndpoint = getRateLimitedEndpoint(
    req.nextUrl.pathname,
    req.method
  );

  if (rateLimitedEndpoint) {
    const rateLimit = await checkFormRateLimit(req, rateLimitedEndpoint);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const response = NextResponse.next();
    applyRateLimitHeaders(response, rateLimit);
    return response;
  }

  return authMiddleware(req as NextRequestWithAuth, event);
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/tailor/:path*',
    '/api/customer/:path*',
    '/api/tailor/:path*',
    '/api/auth/register',
    '/api/auth/password-reset',
    '/api/auth/password-reset/:path*',
    '/api/auth/callback/credentials',
    '/api/auth/resend-verification',
    '/api/auth/verify-email',
  ],
};
