/**
 * Shared helpers for the rate-limit retry cookie.
 *
 * The middleware writes this cookie on a 429 so the auth forms can render an
 * accurate countdown and restore it after a refresh. The value is a single
 * epoch-millisecond timestamp: no credentials, tokens, or user data. It is
 * deliberately not HttpOnly because the browser must read it.
 *
 * This module has no imports so it stays safe in both the edge middleware
 * runtime and the browser bundle.
 */

export const RETRY_COOKIE_PREFIX = 'tayhlor_retry_at';

/** Login window fallback when a 429 arrives without a readable cookie. */
export const RETRY_FALLBACK_SECONDS = 60;

/** Reject absurd values (clock tampering, corrupted cookies). */
const MAX_RETRY_AHEAD_MS = 24 * 60 * 60 * 1000;

/**
 * One cookie per rate-limited endpoint, so a login lockout cannot show a
 * countdown on the sign-up or verification forms (and vice versa).
 */
export function getRetryCookieName(scope: string): string {
  const safeScope = scope.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return `${RETRY_COOKIE_PREFIX}_${safeScope}`;
}

/**
 * Returns the retry timestamp in epoch milliseconds, or null when the value is
 * missing, malformed, already elapsed, or implausibly far in the future.
 */
export function parseRetryAt(
  value: string | null | undefined,
  now: number = Date.now()
): number | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!/^\d{1,16}$/.test(trimmed)) {
    return null;
  }

  const retryAt = Number(trimmed);

  if (!Number.isFinite(retryAt) || retryAt <= now) {
    return null;
  }

  if (retryAt - now > MAX_RETRY_AHEAD_MS) {
    return null;
  }

  return retryAt;
}

export function secondsUntilRetry(
  retryAt: number,
  now: number = Date.now()
): number {
  return Math.max(0, Math.ceil((retryAt - now) / 1000));
}
