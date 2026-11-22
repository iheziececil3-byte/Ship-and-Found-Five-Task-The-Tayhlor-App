import { createHmac, timingSafeEqual } from 'node:crypto';
import { prisma } from './prisma';

// 60-second validity window for completing the handshake sign-in
const TOKEN_MAX_AGE_MS = 60 * 1000;

/**
 * Creates a cryptographically signed single-use token for authenticating
 * a customer immediately after successful email verification.
 */
export function createVerificationSessionToken(userId: string, email: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  const timestamp = Date.now().toString();
  const normalizedEmail = email.toLowerCase().trim();
  const payload = `${userId}:${normalizedEmail}:${timestamp}`;
  const signature = createHmac('sha256', secret).update(payload).digest('hex');

  return `${payload}:${signature}`;
}

/**
 * Verifies a single-use verification handshake token and returns the verified user.
 */
export async function verifyVerificationSessionToken(email: string, token: string) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || !token) {
    return null;
  }

  const parts = token.split(':');
  if (parts.length !== 4) {
    return null;
  }

  const [userId, tokenEmail, timestampStr, signature] = parts;
  const normalizedInputEmail = email.toLowerCase().trim();

  if (tokenEmail !== normalizedInputEmail) {
    return null;
  }

  const timestamp = Number(timestampStr);
  const now = Date.now();

  // Enforce TTL and reject timestamps in the future beyond 5 seconds (clock drift tolerance)
  if (
    !Number.isFinite(timestamp) ||
    now - timestamp > TOKEN_MAX_AGE_MS ||
    timestamp > now + 5000
  ) {
    return null;
  }

  const payload = `${userId}:${tokenEmail}:${timestampStr}`;
  const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const actualBuffer = Buffer.from(signature, 'utf8');

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      emailVerified: true,
      emailVerifiedAt: true,
    },
  });

  // Must exist, match the email, and already be verified
  if (!user || user.email.toLowerCase() !== normalizedInputEmail || !user.emailVerified) {
    return null;
  }

  return user;
}
