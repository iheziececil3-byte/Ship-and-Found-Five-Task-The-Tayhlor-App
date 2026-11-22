import { randomInt } from 'node:crypto';

// One source of truth for the verification code lifetime. The email body, the
// registration route, and the resend route all use these values so a code is
// never described or expired differently depending on where it was issued.
export const VERIFICATION_CODE_TTL_MINUTES = 7;
export const VERIFICATION_CODE_TTL_MS = VERIFICATION_CODE_TTL_MINUTES * 60 * 1000;

/**
 * Six-digit verification code from Node crypto, never Math.random().
 * The upper bound is exclusive, so 1000000 is required to include 999999.
 */
export function generateVerificationCode(): string {
  return String(randomInt(100000, 1000000));
}

export function getVerificationExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + VERIFICATION_CODE_TTL_MS);
}
