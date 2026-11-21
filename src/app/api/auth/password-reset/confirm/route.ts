import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPasswordBreached } from '@/lib/breached-passwords';
import { hashPassword } from '@/lib/passwords';
import {
  getPasswordVersion,
  verifyPasswordResetToken,
} from '@/lib/password-reset';
import { resetPasswordSchema } from '@/lib/validations/auth';

const INVALID_LINK_MESSAGE =
  'This password reset link is invalid or has expired. Please request a new one.';

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

  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const message =
      fieldErrors.token?.[0] ||
      fieldErrors.password?.[0] ||
      'A valid reset link and password are required';

    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenData = verifyPasswordResetToken(token);

  if (!tokenData) {
    return NextResponse.json({ error: INVALID_LINK_MESSAGE }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (
      !user?.passwordHash ||
      getPasswordVersion(user.passwordHash) !== tokenData.passwordVersion
    ) {
      return NextResponse.json({ error: INVALID_LINK_MESSAGE }, { status: 400 });
    }

    // Check every newly chosen password against known breaches before hashing
    // it. The lookup is k-anonymous: only a five-character hash prefix is sent,
    // never the password itself. An unavailable lookup rejects the request so
    // no password is accepted with an unverified breach status.
    let breached: boolean;
    try {
      breached = await isPasswordBreached(password);
    } catch (error) {
      console.error('Breach lookup failed during password reset:', error);
      return NextResponse.json(
        { error: 'We could not verify this password right now. Please try again shortly.' },
        { status: 503 }
      );
    }

    if (breached) {
      return NextResponse.json(
        {
          error:
            'This password has appeared in a known data breach. Please choose a different password.',
        },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Conditional update makes the token single-use even if two requests with
    // the same link arrive at the same time.
    const updated = await prisma.user.updateMany({
      where: {
        id: user.id,
        passwordHash: user.passwordHash,
      },
      data: {
        passwordHash,
      },
    });

    if (updated.count !== 1) {
      return NextResponse.json({ error: INVALID_LINK_MESSAGE }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Your password has been updated. Please sign in with your new password.',
    });
  } catch (error) {
    console.error('Password reset confirmation failed:', error);
    return NextResponse.json(
      { error: 'We could not reset your password. Please try again later.' },
      { status: 500 }
    );
  }
}
