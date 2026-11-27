import { NextResponse, type NextRequest } from 'next/server';
import {
  checkFormRateLimit,
  getRateLimitedEndpoint,
  type RateLimitedEndpoint,
  type RateLimitResult,
} from '@/lib/rate-limit';
import { getRetryCookieName } from '@/lib/rate-limit-retry-cookie';

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

function rateLimitResponse(
  req: NextRequest,
  endpoint: RateLimitedEndpoint,
  rateLimit: RateLimitResult
): NextResponse {
  // The client reads the stable code and the retry cookie after the app-owned
  // sign-in route replaced the old Credentials callback.
  const errorCode = rateLimit.storeUnavailable
    ? 'RateLimitUnavailable'
    : 'RateLimited';

  const signInUrl = new URL('/auth', req.nextUrl.origin);
  signInUrl.searchParams.set('mode', 'login');
  signInUrl.searchParams.set('error', errorCode);

  const response = NextResponse.json(
    {
      error: rateLimit.storeUnavailable
        ? 'Rate limiting is temporarily unavailable. Please try again later.'
        : 'Too many requests. Please wait a moment before trying again.',
      code: rateLimit.storeUnavailable
        ? 'RATE_LIMIT_UNAVAILABLE'
        : 'RATE_LIMITED',
      url: signInUrl.toString(),
    },
    { status: rateLimit.storeUnavailable ? 503 : 429 }
  );

  // Only a real lockout has a known retry time, so an outage sets no cookie.
  if (!rateLimit.storeUnavailable) {
    response.cookies.set({
      name: getRetryCookieName(endpoint),
      value: String(Date.now() + rateLimit.retryAfterSeconds * 1000),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      maxAge: rateLimit.retryAfterSeconds,
    });
  }

  applyRateLimitHeaders(response, rateLimit);
  return response;
}

type SessionUser = {
  id?: string;
  role?: string;
  email?: string | null;
};

/**
 * Middleware runs on the Edge runtime, where Prisma cannot be used. The
 * NextAuth session endpoint performs the database lookup and returns the same
 * session payload the application uses, including the role from the database.
 */
async function readDatabaseSession(req: NextRequest): Promise<SessionUser | null> {
  try {
    const sessionUrl = new URL('/api/auth/session', req.nextUrl.origin);
    const response = await fetch(sessionUrl, {
      headers: { cookie: req.headers.get('cookie') ?? '' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { user?: SessionUser } | null;
    if (!data?.user?.id || !data.user.role) {
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
}

function signInRedirect(req: NextRequest): NextResponse {
  const callbackUrl = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  const signInUrl = new URL('/auth', req.nextUrl.origin);
  signInUrl.searchParams.set('mode', 'login');
  signInUrl.searchParams.set('callbackUrl', callbackUrl);
  return NextResponse.redirect(signInUrl);
}

function forbidden(req: NextRequest, message: string): NextResponse {
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: message }, { status: 403 });
  }

  return new NextResponse(message, {
    status: 403,
    headers: { 'Content-Type': 'text/plain' },
  });
}

function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth')
  );
}

function isTailorPath(pathname: string): boolean {
  return (
    pathname === '/tailor' ||
    pathname.startsWith('/tailor/') ||
    pathname === '/api/tailor' ||
    pathname.startsWith('/api/tailor/')
  );
}

function isCustomerPath(pathname: string): boolean {
  return (
    pathname === '/customer' ||
    pathname.startsWith('/customer/') ||
    pathname === '/api/customer' ||
    pathname.startsWith('/api/customer/')
  );
}

async function enforceSession(req: NextRequest): Promise<NextResponse> {
  if (isPublicPath(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const user = await readDatabaseSession(req);
  if (!user) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return signInRedirect(req);
  }

  // FR-04, SEC-02: role is read from the database-backed session, not from a
  // browser-supplied token or request body.
  if (isTailorPath(req.nextUrl.pathname) && user.role !== 'TAILOR') {
    return forbidden(req, 'Forbidden: Tailor access required');
  }

  if (isCustomerPath(req.nextUrl.pathname) && user.role !== 'CUSTOMER') {
    return forbidden(req, 'Forbidden: Customer access required');
  }

  return NextResponse.next();
}

export default async function middleware(req: NextRequest) {
  const rateLimitedEndpoint = getRateLimitedEndpoint(
    req.nextUrl.pathname,
    req.method
  );

  if (rateLimitedEndpoint) {
    const rateLimit = await checkFormRateLimit(req, rateLimitedEndpoint);

    if (!rateLimit.success) {
      return rateLimitResponse(req, rateLimitedEndpoint, rateLimit);
    }

    const response = NextResponse.next();
    applyRateLimitHeaders(response, rateLimit);
    return response;
  }

  return enforceSession(req);
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
    '/api/auth/sign-in',
    '/api/auth/resend-verification',
    '/api/auth/verify-email',
  ],
};
