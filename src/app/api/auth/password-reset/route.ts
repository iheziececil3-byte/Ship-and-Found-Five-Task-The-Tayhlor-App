import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPasswordResetEmailConfigured, sendPasswordResetEmail } from '@/lib/email';
import {
  createPasswordResetToken,
  PASSWORD_RESET_TTL_MINUTES,
} from '@/lib/password-reset';
import { requestPasswordResetSchema } from '@/lib/validations/auth';

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

  const parsed = requestPasswordResetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a valid email address' },
      { status: 400 }
    );
  }

  if (!isPasswordResetEmailConfigured()) {
    return NextResponse.json(
      { error: 'Password reset email is not configured. Please contact the tailor.' },
      { status: 503 }
    );
  }

  const { email } = parsed.data;
  const genericMessage =
    `If an email/password account exists for that address, we've sent a reset link. ` +
    `Check your inbox and spam folder. The link expires in ${PASSWORD_RESET_TTL_MINUTES} minutes.`;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
      },
    });

    // Google-only accounts have no password to reset. The same generic response
    // is used so the endpoint cannot be used to enumerate registered emails.
    if (user?.passwordHash) {
      const token = createPasswordResetToken(user.id, user.passwordHash);
      const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
      const resetUrl = new URL('/auth', baseUrl);

      resetUrl.searchParams.set('mode', 'reset');
      resetUrl.searchParams.set('token', token);

      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.fullName,
        resetUrl: resetUrl.toString(),
      });
    }

    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    console.error('Password reset request failed:', error);
    return NextResponse.json(
      { error: 'We could not send the reset email. Please try again later.' },
      { status: 502 }
    );
  }
}
