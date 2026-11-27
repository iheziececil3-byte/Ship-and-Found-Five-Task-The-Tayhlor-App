'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RETRY_FALLBACK_SECONDS,
  getRetryCookieName,
  parseRetryAt,
  secondsUntilRetry,
} from '@/lib/rate-limit-retry-cookie';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const prefix = `${name}=`;

  for (const part of document.cookie.split(';')) {
    const entry = part.trim();

    if (entry.startsWith(prefix)) {
      try {
        return decodeURIComponent(entry.slice(prefix.length));
      } catch {
        // A tampered or malformed value must never crash the form.
        return null;
      }
    }
  }

  return null;
}

function expireCookie(name: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

/** Reads the server-issued retry time for one endpoint, if it is still active. */
export function readRetryAt(scope: string): number | null {
  return parseRetryAt(readCookie(getRetryCookieName(scope)));
}

/** Drops the retry cookie once the lockout is over. */
export function clearRetryAt(scope: string): void {
  expireCookie(getRetryCookieName(scope));
}

/**
 * Tracks the remaining seconds of a server-issued rate-limit lockout.
 *
 * The remaining time is always derived from the target timestamp, so a
 * throttled or backgrounded tab cannot drift, and the interval is torn down as
 * soon as the countdown ends.
 */
export function useRateLimitCountdown(scope: string) {
  const cookieName = getRetryCookieName(scope);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [expired, setExpired] = useState(false);

  // Restore an active lockout after a refresh; discard stale values.
  useEffect(() => {
    const restored = parseRetryAt(readCookie(cookieName));

    if (restored === null) {
      expireCookie(cookieName);
      return;
    }

    setRetryAt(restored);
    setRemaining(secondsUntilRetry(restored));
  }, [cookieName]);

  useEffect(() => {
    if (retryAt === null) {
      return;
    }

    const tick = () => {
      const next = secondsUntilRetry(retryAt);
      setRemaining(next);

      if (next <= 0) {
        expireCookie(cookieName);
        setRetryAt(null);
        setExpired(true);
      }
    };

    tick();

    const timer = window.setInterval(tick, 500);
    const handleVisibility = () => {
      if (!document.hidden) {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [cookieName, retryAt]);

  const start = useCallback((until: number | null) => {
    const target = until ?? Date.now() + RETRY_FALLBACK_SECONDS * 1000;

    setExpired(false);
    setRetryAt(target);
    setRemaining(secondsUntilRetry(target));
  }, []);

  return { remaining, isLimited: remaining > 0, expired, start };
}
