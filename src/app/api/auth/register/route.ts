import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isPasswordBreached } from '@/lib/breached-passwords';
import {
  sendVerificationEmailInBackground,
  sendWelcomeEmailInBackground,
} from '@/lib/email';
import { hashPassword } from '@/lib/passwords';
import { signUpSchema } from '@/lib/validations/auth';
import { generateVerificationCode, getVerificationExpiry } from '@/lib/verification-code';

function getRecordEnvironment(): 'LIVE' | 'TEST' | 'PREVIEW' {
  const value = process.env.RECORD_ENVIRONMENT;
  return value === 'TEST' || value === 'PREVIEW' ? value : 'LIVE';
}

export async function POST(req: Request) {
  console.time('total-request');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    console.timeEnd('total-request');
    return NextResponse.json(
      { error: 'Invalid JSON request payload' },
      { status: 400 }
    );
  }

  try {
    // SEC-07: Validate input on server
    console.time('zod-validation');
    const parsed = signUpSchema.safeParse(body);
    console.timeEnd('zod-validation');

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        fieldErrors.fullName?.[0] ||
        fieldErrors.email?.[0] ||
        fieldErrors.phone?.[0] ||
        fieldErrors.password?.[0] ||
        fieldErrors.acceptTerms?.[0] ||
        'Validation failed';

      console.timeEnd('total-request');
      return NextResponse.json(
        {
          error: firstErrorMessage,
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password } = parsed.data;

    // ACC-05: Check for existing account with this email
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.timeEnd('total-request');
      return NextResponse.json(
        {
          error: 'An account with this email address already exists. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    // Check every candidate password against known breaches before hashing it.
    // The lookup is k-anonymous: only a five-character hash prefix is sent,
    // never the password itself. An unavailable lookup rejects the request so
    // no password is accepted with an unverified breach status.
    let breached: boolean;
    try {
      breached = await isPasswordBreached(password);
    } catch (error) {
      console.error('Breach lookup failed during registration:', error);
      console.timeEnd('total-request');
      return NextResponse.json(
        { error: 'We could not verify this password right now. Please try again shortly.' },
        { status: 503 }
      );
    }

    if (breached) {
      console.timeEnd('total-request');
      return NextResponse.json(
        {
          error:
            'This password has appeared in a known data breach. Please choose a different password.',
        },
        { status: 400 }
      );
    }

    // TEMP: dev-only diagnostic. Shows length/whitespace shape only, never the
    // password characters (SEC-06, SEC-08). Remove after verification.
    if (process.env.NODE_ENV !== 'production') {
      const rawPassword = (body as { password?: unknown } | null)?.password;
      const shape = (value: string) =>
        value.replace(/[\s\S]/g, (char) => (/\s/.test(char) ? '␣' : '•'));
      console.log('[auth] password shape before hash', {
        rawLength: typeof rawPassword === 'string' ? rawPassword.length : null,
        parsedLength: password.length,
        trimmed: typeof rawPassword === 'string' && rawPassword !== password,
        rawShape: typeof rawPassword === 'string' ? shape(rawPassword) : null,
        parsedShape: shape(password),
      });
    }

    // ACC-09: Salted password hash
    const passwordHash = await hashPassword(password);

    // Six-digit verification code from Node crypto, never Math.random().
    const verificationCode = generateVerificationCode();
    const verificationExpires = getVerificationExpiry();

    // ACC-02: Public sign-up always creates a CUSTOMER account
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        verificationCode,
        verificationExpires,
        role: 'CUSTOMER',
        recordEnvironment: getRecordEnvironment(),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Deliberately not awaited: SMTP delivery must not delay the response.
    sendVerificationEmailInBackground({
      to: user.email,
      fullName: user.fullName,
      code: verificationCode,
    });
    sendWelcomeEmailInBackground({
      to: user.email,
      fullName: user.fullName,
    });

    console.timeEnd('total-request');
    return NextResponse.json(
      {
        message: 'Account created successfully.',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    // Two requests can pass the existence check at the same time.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      console.timeEnd('total-request');
      return NextResponse.json(
        {
          error: 'An account with this email address already exists. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    console.error('Registration error:', error);
    console.timeEnd('total-request');
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating your account. Please try again later.' },
      { status: 500 }
    );
  }
}

