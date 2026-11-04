import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/passwords';
import { signUpSchema } from '@/lib/validations/auth';

function getRecordEnvironment(): 'LIVE' | 'TEST' | 'PREVIEW' {
  const value = process.env.RECORD_ENVIRONMENT;
  return value === 'TEST' || value === 'PREVIEW' ? value : 'LIVE';
}

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

  try {
    // SEC-07: Validate input on server
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
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
      return NextResponse.json(
        {
          error: 'An account with this email address already exists. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    // ACC-09: Salted password hash
    const passwordHash = await hashPassword(password);

    // ACC-02: Public sign-up always creates a CUSTOMER account
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
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
      return NextResponse.json(
        {
          error: 'An account with this email address already exists. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating your account. Please try again later.' },
      { status: 500 }
    );
  }
}

