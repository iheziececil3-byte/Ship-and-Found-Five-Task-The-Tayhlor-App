import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis/cloudflare';
import type { NextRequest } from 'next/server';

export type RateLimitedEndpoint =
  | 'register'
  | 'login'
  | 'passwordResetRequest'
  | 'passwordResetConfirm'
  | 'verificationResend'
  | 'verifyEmail';

type EndpointConfig = {
  requests: number;
  window: Duration;
  windowMs: number;
  prefix: string;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds: number;
  storeUnavailable: boolean;
};

const FORM_RATE_LIMITS: Record<RateLimitedEndpoint, EndpointConfig> = {
  register: {
    requests: 5,
    window: '1 m',
    windowMs: 60_000,
    prefix: 'register',
  },
  login: {
    requests: 5,
    window: '1 m',
    windowMs: 60_000,
    prefix: 'login',
  },
  passwordResetRequest: {
    requests: 5,
    window: '1 m',
    windowMs: 60_000,
    prefix: 'password-reset-request',
  },
  passwordResetConfirm: {
    requests: 5,
    window: '1 m',
    windowMs: 60_000,
    prefix: 'password-reset-confirm',
  },
  verificationResend: {
    requests: 5,
    window: '10 m',
    windowMs: 10 * 60_000,
    prefix: 'verification-resend',
  },
  verifyEmail: {
    requests: 5,
    window: '10 m',
    windowMs: 10 * 60_000,
    prefix: 'verify-email',
  },
};

const globalForRateLimit = globalThis as unknown as {
  tayhlorRateLimitBuckets?: Map<string, number[]>;
  tayhlorUpstashLimiters?: Map<RateLimitedEndpoint, Ratelimit>;
};

const memoryBuckets =
  globalForRateLimit.tayhlorRateLimitBuckets ?? new Map<string, number[]>();
const upstashLimiters =
  globalForRateLimit.tayhlorUpstashLimiters ?? new Map<RateLimitedEndpoint, Ratelimit>();

globalForRateLimit.tayhlorRateLimitBuckets = memoryBuckets;
globalForRateLimit.tayhlorUpstashLimiters = upstashLimiters;

let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch {
    redis = null;
  }
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const firstForwarded = forwarded?.split(',')[0]?.trim();

  if (firstForwarded) {
    return firstForwarded.slice(0, 128);
  }

  const requestIp = (req as NextRequest & { ip?: string | null }).ip;

  if (requestIp) {
    return requestIp.trim().slice(0, 128);
  }

  return 'unknown';
}

export function getRateLimitedEndpoint(
  pathname: string,
  method: string
): RateLimitedEndpoint | null {
  if (method.toUpperCase() !== 'POST') {
    return null;
  }

  const path = pathname.replace(/\/+$/, '') || '/';

  switch (path) {
    case '/api/auth/register':
      return 'register';
    case '/api/auth/callback/credentials':
      return 'login';
    case '/api/auth/password-reset':
      return 'passwordResetRequest';
    case '/api/auth/password-reset/confirm':
      return 'passwordResetConfirm';
    case '/api/auth/resend-verification':
      return 'verificationResend';
    case '/api/auth/verify-email':
      return 'verifyEmail';
    default:
      return null;
  }
}

function getEnvironmentPrefix(): string {
  const value = process.env.RECORD_ENVIRONMENT;
  return value === 'TEST' || value === 'PREVIEW' ? value.toLowerCase() : 'live';
}

function getUpstashLimiter(endpoint: RateLimitedEndpoint): Ratelimit | null {
  if (!redis) {
    return null;
  }

  const existing = upstashLimiters.get(endpoint);

  if (existing) {
    return existing;
  }

  const config = FORM_RATE_LIMITS[endpoint];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `tayhlor:ratelimit:${getEnvironmentPrefix()}:${config.prefix}`,
  });

  upstashLimiters.set(endpoint, limiter);
  return limiter;
}

function memoryLimit(
  key: string,
  requests: number,
  windowMs: number
): Omit<RateLimitResult, 'storeUnavailable'> {
  const now = Date.now();
  const bucket = (memoryBuckets.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs
  );

  const success = bucket.length < requests;

  if (success) {
    bucket.push(now);
  }

  memoryBuckets.set(key, bucket);

  if (memoryBuckets.size > 10_000) {
    memoryBuckets.forEach((timestamps, bucketKey) => {
      const last = timestamps[timestamps.length - 1];

      if (!last || now - last >= windowMs) {
        memoryBuckets.delete(bucketKey);
      }
    });
  }

  const reset = bucket.length > 0 ? bucket[0] + windowMs : now + windowMs;

  return {
    success,
    limit: requests,
    remaining: Math.max(0, requests - bucket.length),
    reset,
    retryAfterSeconds: Math.max(1, Math.ceil((reset - now) / 1000)),
  };
}

export async function checkFormRateLimit(
  req: NextRequest,
  endpoint: RateLimitedEndpoint
): Promise<RateLimitResult> {
  const config = FORM_RATE_LIMITS[endpoint];
  const identifier = `${endpoint}:${getClientIp(req)}`;
  const limiter = getUpstashLimiter(endpoint);

  if (!limiter) {
    return {
      ...memoryLimit(identifier, config.requests, config.windowMs),
      storeUnavailable: false,
    };
  }

  try {
    const result = await limiter.limit(identifier);
    const now = Date.now();

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfterSeconds: Math.max(1, Math.ceil((result.reset - now) / 1000)),
      storeUnavailable: false,
    };
  } catch (error) {
    console.error('Rate limit store check failed:', error);

    return {
      success: false,
      limit: config.requests,
      remaining: 0,
      reset: Date.now() + config.windowMs,
      retryAfterSeconds: Math.ceil(config.windowMs / 1000),
      storeUnavailable: true,
    };
  }
}
