'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already authenticated, show status card
  if (status === 'authenticated' && session?.user) {
    return (
      <div className="min-h-screen bg-surface-container-low flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-display font-semibold text-2xl shadow-soft">
              T
            </div>
            <span className="font-display font-semibold text-3xl tracking-tight text-primary">
              Tayhlor
            </span>
          </Link>
          <div className="mt-8 bg-surface py-8 px-6 sm:px-10 rounded-2xl border border-outline-variant shadow-soft text-center">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container mx-auto flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display font-semibold text-xl text-primary">
              Account Active
            </h2>
            <p className="mt-2 text-sm text-secondary">
              You already have an active session as <span className="font-semibold text-primary">{session.user.name || session.user.email}</span>.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/"
                className="w-full inline-flex justify-center py-2.5 px-4 rounded-lg bg-primary text-on-primary font-medium text-sm shadow-soft hover:opacity-95 transition-all"
              >
                Return to Tayhlor Home
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/auth/signup' })}
                className="w-full inline-flex justify-center py-2 px-4 rounded-lg border border-outline-variant text-primary text-sm font-medium hover:bg-surface-container transition-colors"
              >
                Sign Out to Create a Different Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account. Please check your information.');
        setIsLoading(false);
        return;
      }

      // Automatically sign in upon successful account creation
      const signInRes = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.ok) {
        router.push('/');
        router.refresh();
      } else {
        router.push('/auth/signin?registered=true');
      }
    } catch {
      setError('An unexpected network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl: '/' }).catch(() => {
      setError('Google Sign-In is not configured yet. Please sign in with your email and password.');
      setIsGoogleLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-display font-semibold text-2xl shadow-soft">
            T
          </div>
          <span className="font-display font-semibold text-3xl tracking-tight text-primary">
            Tayhlor
          </span>
        </Link>
        <h2 className="mt-6 font-display font-semibold text-2xl text-primary tracking-tight">
          Create customer account
        </h2>
        <p className="mt-2 text-sm text-secondary">
          Store your body measurements, commission bespoke garments, and track order progress
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 sm:px-10 rounded-2xl border border-outline-variant shadow-soft">
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-lg bg-error-container/20 border border-error/30 text-error text-sm flex items-start gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-primary mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1.5">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
              />
              <span className="text-xs text-secondary mt-1 block">
                Must be at least 8 characters
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-primary text-on-primary font-medium text-sm shadow-soft hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-3 text-secondary font-medium tracking-wider">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-lg border border-outline-variant bg-surface text-primary font-medium text-sm hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Google'}</span>
            </button>
          </div>

          <p className="mt-6 text-xs text-secondary text-center leading-relaxed">
            By creating an account, you acknowledge that your order and measurement data remain securely stored within Tayhlor. See our{' '}
            <span className="text-primary font-medium underline">Privacy Notice</span> (FR-73).
          </p>

          <div className="mt-8 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-primary font-semibold hover:underline transition-all"
            >
              Sign in here
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-secondary">
          <Link href="/" className="hover:underline">
            ← Back to Tayhlor Home
          </Link>
        </div>
      </div>
    </div>
  );
}

