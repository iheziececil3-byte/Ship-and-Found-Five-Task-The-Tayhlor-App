import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  isVerificationEmailConfigured,
  sendVerificationEmailInBackground,
} from '@/lib/email';
import {
  generateVerificationCode,
  getVerificationExpiry,
  VERIFICATION_CODE_TTL_MINUTES,
} from '@/lib/verification-code';
import { resendVerificationSchema } from '@/lib/validations/auth';

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

  const parsed = resendVerificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a valid email address' },
      { status: 400 }
    );
  }

  if (!isVerificationEmailConfigured()) {
    return NextResponse.json(
      { error: 'Verification email is not configured. Please contact the tailor.' },
      { status: 503 }
    );
  }

  const { email } = parsed.data;

  // The same message is returned for an unknown address and an already-verified
  // account, so this endpoint cannot be used to discover registered emails.
  const genericMessage =
    `If an unverified account exists for that address, we've sent a new code. ` +
    `Check your inbox and spam folder. The code expires in ${VERIFICATION_CODE_TTL_MINUTES} minutes.`;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        emailVerified: true,
        emailVerifiedAt: true,
      },
    });

    if (user && !user.emailVerified && !user.emailVerifiedAt) {
      const verificationCode = generateVerificationCode();
      const verificationExpires = getVerificationExpiry();

      // Replacing the code invalidates any earlier one, so only the newest
      // email can be used to verify the address.
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationCode, verificationExpires },
      });

      // Deliberately not awaited, matching registration: SMTP delivery must not
      // delay the response.
      sendVerificationEmailInBackground({
        to: user.email,
        fullName: user.fullName,
        code: verificationCode,
      });
    }

    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    console.error('Verification code resend failed:', error);
    return NextResponse.json(
      { error: 'We could not send a new code. Please try again later.' },
      { status: 502 }
    );
  }
}
