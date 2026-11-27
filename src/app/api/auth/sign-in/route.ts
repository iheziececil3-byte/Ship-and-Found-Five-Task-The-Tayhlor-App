import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createDatabaseSession } from '@/lib/db-adapter';
import { verifyPassword } from '@/lib/passwords';
import { getSessionCookieName, getSessionCookieOptions } from '@/lib/session-cookie';
import { signInSchema } from '@/lib/validations/auth';
import { verifyVerificationSessionToken } from '@/lib/verification-token';
import { prisma } from '@/lib/prisma';

const passwordSignInSchema = signInSchema.strict();

const verificationSignInSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: 'Enter a valid email address' }),
    verificationToken: z.string().trim().min(1),
  })
  .strict();

const signInRequestSchema = z.union([
  passwordSignInSchema,
  verificationSignInSchema,
]);

function invalidCredentials(): NextResponse {
  return NextResponse.json(
    { error: 'Invalid email or password. Please check your credentials and try again.' },
    { status: 401 }
  );
}

/**
 * App-owned sign-in for the two flows NextAuth v4 cannot handle with database
 * sessions: email/password and the post-verification handshake. Google keeps
 * using NextAuth's OAuth callback and the same Prisma adapter.
 */
export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request payload' },
      { status: 400 }
    );
  }

  const parsed = signInRequestSchema.safeParse(body);
  if (!parsed.success) {
    return invalidCredentials();
  }

  try {
    let userId: string;

    if ('password' in parsed.data) {
      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, passwordHash: true },
      });

      // Generic response for unknown accounts, Google-only accounts, and bad
      // passwords (ACC-07).
      if (!user?.passwordHash) {
        return invalidCredentials();
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return invalidCredentials();
      }

      userId = user.id;
    } else {
      const user = await verifyVerificationSessionToken(
        parsed.data.email,
        parsed.data.verificationToken
      );

      if (!user) {
        return NextResponse.json(
          {
            error:
              'That verification link is invalid or has expired. Please request a new code.',
          },
          { status: 400 }
        );
      }

      userId = user.id;
    }

    const { sessionToken, expires } = await createDatabaseSession(userId);

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      ...getSessionCookieOptions(),
      name: getSessionCookieName(),
      value: sessionToken,
      expires,
    });
    return response;
  } catch (error) {
    // Never log the submitted password or verification token.
    console.error('Database sign-in failed:', error);
    return NextResponse.json(
      { error: 'We could not start your session. Please try again.' },
      { status: 500 }
    );
  }
}
