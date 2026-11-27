import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prismaAdapter } from './db-adapter';
import { getSessionCookieName, getSessionCookieOptions } from './session-cookie';
import { SESSION_MAX_AGE_SECONDS } from './session-token';

export const authOptions: NextAuthOptions = {
  adapter: prismaAdapter,
  session: {
    strategy: 'database',
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: getSessionCookieName(),
      options: getSessionCookieOptions(),
    },
  },
  pages: {
    signIn: '/auth?mode=login',
    newUser: '/customer/dashboard',
    error: '/auth?mode=login',
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    // With database sessions, Auth.js passes the user loaded by the adapter.
    // Identity and role therefore come from the database on every request,
    // not from a signed JWT.
    async session({ session, user }) {
      if (user && session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.emailVerified = user.emailVerified;
      }
      return session;
    },
  },
};
