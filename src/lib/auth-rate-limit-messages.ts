/**
 * Shared copy for authentication rate limiting.
 *
 * The countdown itself is rendered in the submit button, never in the alert:
 * the alert uses role="alert", so a per-second value inside it would be
 * re-announced by screen readers every second.
 */

export const AUTH_RATE_LIMIT_MESSAGES = {
  signIn: 'Too many sign-in attempts. Please wait a moment before trying again.',
  signUp: 'Too many sign-up attempts. Please wait a moment before trying again.',
  codeRequest: 'Too many code requests. Please wait a moment before trying again.',
} as const;

/** Shown when the rate-limit store is unavailable (HTTP 503). No countdown. */
export const AUTH_RATE_LIMIT_UNAVAILABLE_MESSAGE =
  'Sign-in is temporarily unavailable. Please try again shortly.';
