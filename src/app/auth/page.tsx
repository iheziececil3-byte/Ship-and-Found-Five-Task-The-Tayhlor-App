'use client';

import { Suspense, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

type AuthMode = 'login' | 'signup' | 'reset';

const INPUT_CLASSES =
  'w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-fluid-label transition-all';

const PRIMARY_BUTTON_CLASSES =
  'w-full py-3 px-4 rounded-lg bg-primary text-on-primary font-medium text-fluid-label shadow-soft hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

const SECONDARY_BUTTON_CLASSES =
  'w-full inline-flex justify-center py-2 px-4 rounded-lg border border-outline-variant text-primary text-fluid-label font-medium hover:bg-surface-container transition-colors';

function resolveMode(value: string | null): AuthMode {
  if (value === 'signup' || value === 'reset') {
    return value;
  }
  return 'login';
}

function resolveCallbackUrl(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }
  return '/';
}

function buildAuthHref(mode: AuthMode, callbackUrl: string): string {
  const params = new URLSearchParams({ mode });
  if (callbackUrl !== '/') {
    params.set('callbackUrl', callbackUrl);
  }
  return `/auth?${params.toString()}`;
}

function BrandLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 group rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-display font-semibold text-2xl shadow-soft">
        T
      </div>
      <span className="font-display font-semibold text-fluid-brand text-primary">
        Tayhlor
      </span>
    </Link>
  );
}

function AuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLink />
        <h2 className="mt-6 font-display font-semibold text-fluid-headline-lg text-primary">
          {title}
        </h2>
        <p className="mt-2 text-fluid-body-sm text-secondary">{description}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 sm:px-10 rounded-2xl border border-outline-variant shadow-soft">
          {children}
        </div>

        <div className="mt-8 text-center text-fluid-badge text-secondary">
          <Link href="/" className="hover:underline">
            ← Back to Tayhlor Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function FormAlert({
  tone,
  children,
}: {
  tone: 'error' | 'success';
  children: ReactNode;
}) {
  const isError = tone === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`mb-6 p-4 rounded-lg border text-fluid-body-sm flex items-start gap-3 ${
        isError
          ? 'bg-error-container/20 border-error/30 text-error'
          : 'bg-success/10 border-success/30 text-primary'
      }`}
    >
      <svg
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        {isError ? (
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        )}
      </svg>
      <span>{children}</span>
    </div>
  );
}

function TextField({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
  required = true,
  minLength,
  hint,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-fluid-label font-medium text-primary mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-describedby={hintId}
        className={INPUT_CLASSES}
      />
      {hint && (
        <span id={hintId} className="text-fluid-badge text-secondary mt-1 block">
          {hint}
        </span>
      )}
    </div>
  );
}

function OrDivider({ label }: { label: string }) {
  return (
    <div className="mt-6 relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-outline-variant" />
      </div>
      <div className="relative flex justify-center text-fluid-badge uppercase">
        <span className="bg-surface px-3 text-secondary font-medium tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
}

function GoogleButton({
  onClick,
  disabled,
  isLoading,
}: {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2.5 px-4 rounded-lg border border-outline-variant bg-surface text-primary font-medium text-fluid-label hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
      <span>{isLoading ? 'Connecting to Google...' : 'Google'}</span>
    </button>
  );
}

function LoginForm({
  callbackUrl,
  registered,
  signUpHref,
  resetHref,
}: {
  callbackUrl: string;
  registered: boolean;
  signUpHref: string;
  resetHref: string;
}) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (!res || res.error) {
        // ACC-07: Invalid sign-in MUST show a generic error
        setError('Invalid email or password. Please check your credentials and try again.');
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl }).catch(() => {
      setError(
        'Google Sign-In is not configured yet. Please sign in with your email and password.'
      );
      setIsGoogleLoading(false);
    });
  };

  const isBusy = isLoading || isGoogleLoading;

  return (
    <AuthFrame
      title="Welcome back"
      description="Sign in to access your orders, measurements, and atelier updates"
    >
      {registered && !error && (
        <FormAlert tone="success">
          Account created successfully. Please sign in with your new credentials.
        </FormAlert>
      )}

      {error && <FormAlert tone="error">{error}</FormAlert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="name@example.com"
        />

        <div>
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />
          <div className="mt-2 text-right">
            <Link
              href={resetHref}
              scroll={false}
              className="text-fluid-badge text-secondary font-medium hover:text-primary hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button type="submit" disabled={isBusy} className={PRIMARY_BUTTON_CLASSES}>
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <OrDivider label="Or continue with" />

      <div className="mt-6">
        <GoogleButton
          onClick={handleGoogleSignIn}
          disabled={isBusy}
          isLoading={isGoogleLoading}
        />
      </div>

      <div className="mt-8 text-center text-fluid-body-sm text-secondary">
        Don&apos;t have an account?{' '}
        <Link
          href={signUpHref}
          scroll={false}
          className="text-primary font-semibold hover:underline transition-all"
        >
          Create customer account
        </Link>
      </div>
    </AuthFrame>
  );
}

function SignUpForm({
  callbackUrl,
  signInHref,
}: {
  callbackUrl: string;
  signInHref: string;
}) {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        const params = new URLSearchParams({ mode: 'login', registered: 'true' });
        if (callbackUrl !== '/') {
          params.set('callbackUrl', callbackUrl);
        }
        router.replace(`/auth?${params.toString()}`);
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
      setError(
        'Google Sign-In is not configured yet. Please sign in with your email and password.'
      );
      setIsGoogleLoading(false);
    });
  };

  const isBusy = isLoading || isGoogleLoading;

  return (
    <AuthFrame
      title="Create customer account"
      description="Store your body measurements, commission bespoke garments, and track order progress"
    >
      {error && <FormAlert tone="error">{error}</FormAlert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="fullName"
          label="Full name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={setFullName}
          placeholder="Jane Doe"
          minLength={2}
        />

        <TextField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="name@example.com"
        />

        <TextField
          id="phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+234 801 234 5678"
        />

        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          minLength={8}
          hint="Must be at least 8 characters"
        />

        <button
          type="submit"
          disabled={isBusy}
          className={`mt-2 ${PRIMARY_BUTTON_CLASSES}`}
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

      <OrDivider label="Or sign up with" />

      <div className="mt-6">
        <GoogleButton
          onClick={handleGoogleSignIn}
          disabled={isBusy}
          isLoading={isGoogleLoading}
        />
      </div>

      <p className="mt-6 text-fluid-badge text-secondary text-center">
        By creating an account, you acknowledge that your order and measurement data remain
        securely stored within Tayhlor. See our{' '}
        <span className="text-primary font-medium underline">Privacy Notice</span> (FR-73).
      </p>

      <div className="mt-8 text-center text-fluid-body-sm text-secondary">
        Already have an account?{' '}
        <Link
          href={signInHref}
          scroll={false}
          className="text-primary font-semibold hover:underline transition-all"
        >
          Sign in here
        </Link>
      </div>
    </AuthFrame>
  );
}

function ResetPasswordPanel({ signInHref }: { signInHref: string }) {
  return (
    <AuthFrame
      title="Reset password"
      description="Password reset by email is not available in this build."
    >
      <div
        role="status"
        className="p-4 rounded-lg bg-surface-container border border-outline-variant text-fluid-body-sm text-secondary"
      >
        <p>
          Password reset by email (FR-03) has not been implemented yet. To regain access to
          your account, please contact the tailor directly.
        </p>
        <p className="mt-2">
          If you signed up with Google, use the Google sign-in option instead.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <Link href={signInHref} scroll={false} className={PRIMARY_BUTTON_CLASSES}>
          Back to Sign In
        </Link>
        <Link href="/" className={SECONDARY_BUTTON_CLASSES}>
          Return to Tayhlor Home
        </Link>
      </div>
    </AuthFrame>
  );
}

function AuthenticatedPanel({
  name,
  role,
}: {
  name: string | null | undefined;
  role: string;
}) {
  return (
    <AuthFrame
      title="Already Signed In"
      description="You already have an active Tayhlor session."
    >
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container mx-auto flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="mt-2 text-fluid-body-sm text-secondary">
          You are currently signed in as{' '}
          <span className="font-semibold text-primary">{name || 'your account'}</span> ({role}).
        </p>
        <div className="mt-6 space-y-3">
          <Link
            href="/"
            className="w-full inline-flex justify-center py-2.5 px-4 rounded-lg bg-primary text-on-primary font-medium text-fluid-label shadow-soft hover:opacity-95 transition-all"
          >
            Return to Tayhlor Home
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/auth?mode=login' })}
            className={SECONDARY_BUTTON_CLASSES}
          >
            Sign Out to Switch Accounts
          </button>
        </div>
      </div>
    </AuthFrame>
  );
}

function UnifiedAuthPage() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const mode = resolveMode(searchParams.get('mode'));
  const callbackUrl = resolveCallbackUrl(searchParams.get('callbackUrl'));
  const registered = searchParams.get('registered') === 'true';

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'authenticated' && session?.user) {
    return (
      <AuthenticatedPanel
        name={session.user.name || session.user.email}
        role={session.user.role}
      />
    );
  }

  const loginHref = buildAuthHref('login', callbackUrl);
  const signUpHref = buildAuthHref('signup', callbackUrl);
  const resetHref = buildAuthHref('reset', callbackUrl);

  if (mode === 'signup') {
    return <SignUpForm callbackUrl={callbackUrl} signInHref={loginHref} />;
  }

  if (mode === 'reset') {
    return <ResetPasswordPanel signInHref={loginHref} />;
  }

  return (
    <LoginForm
      callbackUrl={callbackUrl}
      registered={registered}
      signUpHref={signUpHref}
      resetHref={resetHref}
    />
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <UnifiedAuthPage />
    </Suspense>
  );
}
