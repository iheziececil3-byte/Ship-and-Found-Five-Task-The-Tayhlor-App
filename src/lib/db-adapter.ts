import { Prisma } from '@prisma/client';
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from 'next-auth/adapters';
import { prisma } from './prisma';
import {
  generateSessionToken,
  getSessionExpiry,
  hashSessionToken,
} from './session-token';

type TayhlorUser = Prisma.UserGetPayload<{}>;

function getRecordEnvironment(): 'LIVE' | 'TEST' | 'PREVIEW' {
  const value = process.env.RECORD_ENVIRONMENT;
  return value === 'TEST' || value === 'PREVIEW' ? value : 'LIVE';
}

function toAdapterUser(user: TayhlorUser): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.fullName,
    image: null,
    role: user.role,
  };
}

function toAdapterSession(
  session: Prisma.SessionGetPayload<{}>
): AdapterSession {
  return {
    sessionToken: session.hashedToken,
    userId: session.userId,
    expires: session.expiresAt,
  };
}

async function persistSession(session: {
  sessionToken: string;
  userId: string;
  expires: Date;
}): Promise<AdapterSession> {
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { recordEnvironment: true },
  });

  if (!user) {
    throw new Error('Cannot create a session for an unknown user');
  }

  const created = await prisma.session.create({
    data: {
      userId: session.userId,
      hashedToken: hashSessionToken(session.sessionToken),
      expiresAt: session.expires,
      recordEnvironment: user.recordEnvironment,
    },
  });

  return toAdapterSession(created);
}

/**
 * Starts a database session for the app-owned sign-in route. The caller puts
 * the returned opaque token in the HTTP-only cookie; only the hash is stored.
 */
export async function createDatabaseSession(userId: string): Promise<{
  sessionToken: string;
  expires: Date;
}> {
  const sessionToken = generateSessionToken();
  const expires = getSessionExpiry();
  await persistSession({ sessionToken, userId, expires });
  return { sessionToken, expires };
}

function isNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}

export const prismaAdapter: Adapter = {
  async createUser(user: Omit<AdapterUser, 'id'>) {
    const email = user.email.trim().toLowerCase();
    const fallbackName = email.split('@')[0] || 'Tayhlor Customer';
    const fullName =
      typeof user.name === 'string' && user.name.trim()
        ? user.name.trim()
        : fallbackName;

    // Google is the only adapter-driven sign-in, and Google verifies the
    // address (ACC-13).
    const verifiedAt = user.emailVerified ?? new Date();

    const created = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash: null,
        googleSubject: null,
        role: 'CUSTOMER',
        emailVerified: verifiedAt,
        emailVerifiedAt: verifiedAt,
        recordEnvironment: getRecordEnvironment(),
      },
    });

    return toAdapterUser(created);
  },

  async getUser(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toAdapterUser(user) : null;
  },

  async getUserByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    return user ? toAdapterUser(user) : null;
  },

  async getUserByAccount({ provider, providerAccountId }) {
    if (provider !== 'google') {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { googleSubject: providerAccountId },
    });
    return user ? toAdapterUser(user) : null;
  },

  async updateUser(user) {
    const data: Prisma.UserUpdateInput = {};

    if (user.email !== undefined) {
      data.email = user.email.trim().toLowerCase();
    }
    if (typeof user.name === 'string' && user.name.trim()) {
      data.fullName = user.name.trim();
    }
    if (user.emailVerified !== undefined) {
      data.emailVerified = user.emailVerified;
      data.emailVerifiedAt = user.emailVerified;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });
    return toAdapterUser(updated);
  },

  async linkAccount(account: AdapterAccount) {
    if (account.provider !== 'google') {
      throw new Error(`Unsupported OAuth provider: ${account.provider}`);
    }

    await prisma.user.update({
      where: { id: account.userId },
      data: { googleSubject: account.providerAccountId },
    });
  },

  async createSession(session) {
    return persistSession(session);
  },

  async getSessionAndUser(sessionToken) {
    const session = await prisma.session.findUnique({
      where: { hashedToken: hashSessionToken(sessionToken) },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    return {
      session: toAdapterSession(session),
      user: toAdapterUser(session.user),
    };
  },

  async updateSession(session) {
    const data: Prisma.SessionUncheckedUpdateInput = {};
    if (session.expires !== undefined) {
      data.expiresAt = session.expires;
    }
    if (session.userId !== undefined) {
      data.userId = session.userId;
    }

    try {
      const updated = await prisma.session.update({
        where: { hashedToken: hashSessionToken(session.sessionToken) },
        data,
      });
      return toAdapterSession(updated);
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  },

  async deleteSession(sessionToken) {
    try {
      const deleted = await prisma.session.delete({
        where: { hashedToken: hashSessionToken(sessionToken) },
      });
      return toAdapterSession(deleted);
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  },
};
