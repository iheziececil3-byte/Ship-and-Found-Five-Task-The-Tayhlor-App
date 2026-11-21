'use client';

import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const INPUT_BASE_CLASSES =
  'w-full px-4 py-2.5 rounded-lg border bg-surface text-primary placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 text-fluid-label transition-all';

const INPUT_NORMAL_CLASSES =
  'border-outline focus-visible:border-primary focus-visible:ring-primary';

const FOCUS_RING_CLASSES =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const PRIMARY_BUTTON_CLASSES =
  `w-full py-3 px-4 rounded-lg bg-primary text-on-primary font-medium text-fluid-label shadow-soft hover:opacity-95 ${FOCUS_RING_CLASSES} transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`;

function BrandLink() {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group rounded-lg transition-opacity hover:opacity-80 ${FOCUS_RING_CLASSES}`}
    >
      <div
        aria-hidden="true"
        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-display font-semibold text-2xl shadow-soft"
      >
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
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-surface-container-low flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLink />
        <h1 className="mt-6 font-display font-semibold text-fluid-headline-lg text-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-fluid-body-sm text-secondary">{description}</p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 sm:px-10 rounded-2xl border border-outline-variant shadow-soft">
          {children}
        </div>

        <div className="mt-8 text-center text-fluid-badge text-secondary">
          <Link href="/" className="inline-block py-2 hover:underline">
            ← Back to Tayhlor Home
          </Link>
        </div>
      </div>
    </main>
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

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isVerified) {
      return;
    }

    const timer = setTimeout(() => {
      router.replace('/customer/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [isVerified, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading || isVerified) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email }),
      });

      let data: { error?: string; message?: string } | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(
          data?.error ??
            data?.message ??
            'We could not verify your email. Please try again.'
        );
        return;
      }

      setIsVerified(true);
    } catch {
      setError('An unexpected network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame
      title="Verify your email"
      description="Enter the 6-digit code sent to your email address."
    >
      {error && <FormAlert tone="error">{error}</FormAlert>}

      {isVerified ? (
        <div className="text-center">
          <FormAlert tone="success">
            Email verified successfully! Redirecting to your dashboard...
          </FormAlert>
          <p className="text-fluid-body-sm text-secondary">
            You will be redirected shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate aria-label="Verify email" className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-fluid-label font-medium text-primary mb-1.5"
            >
              Verification code
              <span aria-hidden="true" className="ml-0.5 text-error">
                *
              </span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="123456"
              aria-invalid={Boolean(error)}
              aria-describedby="code-hint"
              className={`${INPUT_BASE_CLASSES} ${INPUT_NORMAL_CLASSES} text-center tracking-[0.3em]`}
            />
            <span id="code-hint" className="text-fluid-badge text-secondary mt-1 block">
              {email ? `Sent to ${email}. ` : ''}The code expires after a short time.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-2 ${PRIMARY_BUTTON_CLASSES}`}
          >
            {isLoading ? (
              <>
                <span
                  aria-hidden="true"
                  className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin motion-reduce:animate-none"
                />
                <span>Verifying...</span>
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>
      )}
    </AuthFrame>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-surface-container-low flex items-center justify-center"
          role="status"
        >
          <div
            aria-hidden="true"
            className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin motion-reduce:animate-none"
          />
          <span className="sr-only">Loading…</span>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
