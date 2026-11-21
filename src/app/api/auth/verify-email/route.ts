import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Enter a valid email address' }),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'Enter the 6-digit verification code' }),
});

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

  const parsed = verifyEmailSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const message =
      fieldErrors.code?.[0] ||
      fieldErrors.email?.[0] ||
      'A valid email address and code are required';

    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { email, code } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        verificationCode: true,
        verificationExpires: true,
      },
    });

    // Same response for an unknown address and an already-verified account so
    // the endpoint does not disclose which email addresses are registered.
    if (!user?.verificationCode) {
      return NextResponse.json(
        {
          error:
            'We could not verify this email address. Please check your code or request a new one.',
        },
        { status: 400 }
      );
    }

    if (
      !user.verificationExpires ||
      user.verificationExpires.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { error: 'This verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: 'Incorrect verification code. Please check and try again.' },
        { status: 400 }
      );
    }

    const verifiedAt = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: verifiedAt,
        // Keep the existing verification flag in sync for the current auth gate.
        emailVerified: verifiedAt,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return NextResponse.json({
      message: 'Email verified! You can now log in',
    });
  } catch (error) {
    console.error('Email verification failed:', error);
    return NextResponse.json(
      { error: 'We could not verify your email. Please try again later.' },
      { status: 500 }
    );
  }
}
