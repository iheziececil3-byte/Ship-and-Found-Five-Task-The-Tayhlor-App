import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

const RESET_TOKEN_PREFIX = 'tayhlor-reset-v1';
const PASSWORD_RESET_TTL_SECONDS = 30 * 60;

export const PASSWORD_RESET_TTL_MINUTES = 30;

type ResetTokenPayload = {
  v: 1;
  sub: string;
  ver: string;
  iat: number;
  exp: number;
  jti: string;
};

function getTokenSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', getTokenSecret())
    .update(value)
    .digest('base64url');
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

/**
 * Derives a short version marker from the current password hash. A reset token
 * is bound to this value, so changing the password invalidates every earlier
 * reset link without storing token records.
 */
export function getPasswordVersion(passwordHash: string): string {
  return createHash('sha256')
    .update(`${RESET_TOKEN_PREFIX}:password:${passwordHash}`)
    .digest('hex')
    .slice(0, 32);
}

export function createPasswordResetToken(userId: string, passwordHash: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: ResetTokenPayload = {
    v: 1,
    sub: userId,
    ver: getPasswordVersion(passwordHash),
    iat: now,
    exp: now + PASSWORD_RESET_TTL_SECONDS,
    jti: randomBytes(16).toString('hex'),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(`${RESET_TOKEN_PREFIX}.${encodedPayload}`);

  return `${RESET_TOKEN_PREFIX}.${encodedPayload}.${signature}`;
}

function isResetTokenPayload(value: unknown): value is ResetTokenPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.v === 1 &&
    typeof candidate.sub === 'string' &&
    candidate.sub.length > 0 &&
    typeof candidate.ver === 'string' &&
    candidate.ver.length > 0 &&
    typeof candidate.iat === 'number' &&
    typeof candidate.exp === 'number' &&
    typeof candidate.jti === 'string' &&
    candidate.jti.length > 0
  );
}

export function verifyPasswordResetToken(
  token: string
): { userId: string; passwordVersion: string } | null {
  const parts = token.split('.');

  if (parts.length !== 3 || parts[0] !== RESET_TOKEN_PREFIX) {
    return null;
  }

  const [, encodedPayload, signature] = parts;
  const expectedSignature = sign(`${RESET_TOKEN_PREFIX}.${encodedPayload}`);
  const provided = Buffer.from(signature, 'utf8');
  const expected = Buffer.from(expectedSignature, 'utf8');

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  let decoded: unknown;

  try {
    decoded = JSON.parse(fromBase64Url(encodedPayload));
  } catch {
    return null;
  }

  if (!isResetTokenPayload(decoded)) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);

  if (decoded.exp <= now || decoded.iat > now + 60) {
    return null;
  }

  return {
    userId: decoded.sub,
    passwordVersion: decoded.ver,
  };
}
