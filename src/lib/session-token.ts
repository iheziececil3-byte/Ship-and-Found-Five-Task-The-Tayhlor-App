import { createHash, randomBytes } from 'node:crypto';

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days (ACC-08)

/**
 * Generates the opaque value placed in the session cookie. Only its hash is
 * stored in the Session table.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Hashes a session token exactly as NextAuth hashes adapter session tokens.
 * The secret is required so a database leak alone cannot reproduce a cookie.
 */
export function hashSessionToken(token: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  return createHash('sha256').update(`${token}${secret}`).digest('hex');
}

export function getSessionExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
}
