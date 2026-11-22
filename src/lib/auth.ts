import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import { verifyPassword } from './passwords';
import { signInSchema } from './validations/auth';
import { verifyVerificationSessionToken } from './verification-token';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days session inactivity expiry (ACC-08)
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth?mode=login',
    newUser: '/customer/dashboard',
    error: '/auth?mode=login',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Always return generic error (ACC-07)
        if (!user || !user.passwordHash) {
          return null;
        }

        // TEMP: dev-only diagnostic. Shows length/whitespace shape only, never the
        // password characters (SEC-06, SEC-08). Remove after verification.
        if (process.env.NODE_ENV !== 'production') {
          const rawPassword = credentials?.password;
          const shape = (value: string) =>
            value.replace(/[\s\S]/g, (char) => (/\s/.test(char) ? '␣' : '•'));
          console.log('[auth] password shape before verify', {
            rawLength: typeof rawPassword === 'string' ? rawPassword.length : null,
            parsedLength: password.length,
            trimmed: typeof rawPassword === 'string' && rawPassword !== password,
            rawShape: typeof rawPassword === 'string' ? shape(rawPassword) : null,
            parsedShape: shape(password),
          });
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
    CredentialsProvider({
      id: 'email-verification',
      name: 'EmailVerification',
      credentials: {
        email: { label: 'Email', type: 'text' },
        verificationToken: { label: 'Verification Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.verificationToken) {
          return null;
        }

        const user = await verifyVerificationSessionToken(
          credentials.email,
          credentials.verificationToken
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified ? new Date(token.emailVerified) : null;
      }
      return session;
    },
  },
};

