'use client';

import { Suspense, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { TermsModal } from '@/components/terms/TermsModal';

type AuthMode = 'login' | 'signup' | 'reset';

const INPUT_BASE_CLASSES =
  'w-full px-4 py-2.5 rounded-lg border bg-surface text-primary placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 text-fluid-label transition-all';

const INPUT_NORMAL_CLASSES =
  'border-outline focus-visible:border-primary focus-visible:ring-primary';

const INPUT_ERROR_CLASSES =
  'border-error focus-visible:border-error focus-visible:ring-error';

// Solid, high-contrast focus ring: the old /20 and /30 opacity rings measured
// 1.52:1 and 1.93:1 against the surface, below the 3:1 non-text contrast minimum.
const FOCUS_RING_CLASSES =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const PRIMARY_BUTTON_CLASSES =
  `w-full py-3 px-4 rounded-lg bg-primary text-on-primary font-medium text-fluid-label shadow-soft hover:opacity-95 ${FOCUS_RING_CLASSES} transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`;

const SECONDARY_BUTTON_CLASSES =
  `w-full inline-flex justify-center py-2 px-4 rounded-lg border border-outline-variant text-primary text-fluid-label font-medium hover:bg-surface-container ${FOCUS_RING_CLASSES} transition-colors`;

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
  return '/customer/dashboard';
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
      className={`mb-6 p-4 rounded-lg border text-fluid-body-sm flex items-start gap-3 ${isError
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
  onFocus,
  onBlur,
  autoComplete,
  inputMode,
  placeholder,
  required = true,
  minLength,
  hint,
  showHintOnFocusOrType = false,
  showPasswordToggle = false,
  forceTouched = false,
  validate,
  validateOnType = false,
  externalError,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
  showHintOnFocusOrType?: boolean;
  showPasswordToggle?: boolean;
  forceTouched?: boolean;
  validate?: (value: string) => string | null;
  validateOnType?: boolean;
  externalError?: string | null;
}) {
  const [isTouched, setIsTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isBlank = !value.trim();
  const customError = externalError || (validate ? validate(value) : null);
  const isValidationActive =
    Boolean(externalError) ||
    isTouched ||
    forceTouched ||
    (validateOnType && !isBlank);

  const isInvalid = isBlank ? required : Boolean(customError);
  const showError = isValidationActive && isInvalid;
  const errorMessage = isBlank
    ? 'This field is required. Please enter a value.'
    : (customError || '');
  const isHintVisible = Boolean(
    hint && (!showHintOnFocusOrType || isFocused || value.length > 0)
  );
  const hintId = isHintVisible ? `${id}-hint` : undefined;
  const errorId = `${id}-error`;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);
    onBlur?.();
  };

  const inputType =
    type === 'password' && showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-fluid-label font-medium text-primary mb-1.5"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-error">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          inputMode={inputMode}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : hintId}
          className={`${INPUT_BASE_CLASSES} ${
            showPasswordToggle ? 'pr-11' : ''
          } ${showError ? INPUT_ERROR_CLASSES : INPUT_NORMAL_CLASSES}`}
        />
        {type === 'password' && showPasswordToggle && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              onMouseDown={(event) => event.preventDefault()}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={`pointer-events-auto p-2.5 rounded-md text-secondary hover:text-primary hover:bg-surface-container/60 transition-colors ${FOCUS_RING_CLASSES} !transform-none hover:!transform-none active:!transform-none hover:!filter-none active:!filter-none`}
            >
              {showPassword ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
      {showError ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-fluid-badge text-error flex items-center gap-1.5 font-medium animate-in fade-in duration-150"
        >
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errorMessage}</span>
        </p>
      ) : isHintVisible ? (
        <span id={hintId} className="text-fluid-badge text-secondary mt-1 block">
          {hint}
        </span>
      ) : null}
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
      className={`w-full py-2.5 px-4 rounded-lg border border-outline-variant bg-surface text-primary font-medium text-fluid-label hover:bg-surface-container transition-colors ${FOCUS_RING_CLASSES} disabled:opacity-50 flex items-center justify-center gap-3`}
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null; // Required check handles empty values
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Enter a valid email address';
  }
  return null;
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
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loginEmailError, setLoginEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isBusy = isLoading || isGoogleLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoginEmailError(null);

    const isEmailBlank = !email.trim();
    const isPasswordBlank = !password.trim();
    const isEmailInvalid = !isEmailBlank && !EMAIL_REGEX.test(email.trim());

    if (isEmailBlank || isPasswordBlank || isEmailInvalid) {
      setFormSubmitted(true);
      if (isEmailInvalid) {
        setLoginEmailError('Enter a valid email address');
      }
      // Move focus to the first invalid field, matching the sign-up form.
      const firstInvalidId = isEmailBlank || isEmailInvalid ? 'email' : 'password';
      setTimeout(() => {
        document.getElementById(firstInvalidId)?.focus();
      }, 0);
      return;
    }

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

      <form onSubmit={handleSubmit} noValidate aria-label="Sign in" className="space-y-5">
        <TextField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(val) => {
            setEmail(val);
            if (loginEmailError) {
              setLoginEmailError(null);
            }
          }}
          placeholder="name@example.com"
          forceTouched={formSubmitted}
          externalError={loginEmailError}
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
            showPasswordToggle={true}
            forceTouched={formSubmitted}
          />
          <div className="mt-2 text-right">
            <Link
              href={resetHref}
              scroll={false}
              className="inline-block py-1.5 text-fluid-body-sm text-secondary font-medium hover:text-primary hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <span className="sr-only" role="status">
          {isLoading ? 'Signing in…' : ''}
        </span>
        <button type="submit" disabled={isBusy} className={PRIMARY_BUTTON_CLASSES}>
          {isLoading ? (
            <>
              <span
                aria-hidden="true"
                className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin motion-reduce:animate-none"
              />
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

      <div className="mt-4 text-center">
        <Link
          href="/auth/verify"
          scroll={false}
          className="inline-block py-1.5 text-fluid-badge text-secondary hover:text-primary hover:underline transition-colors"
        >
          Need to verify your email?
        </Link>
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

      <div className="mt-4 text-center text-fluid-badge text-secondary">
        <Link
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block py-2 hover:underline hover:text-primary transition-colors"
        >
          Terms &amp; Conditions
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </div>
    </AuthFrame>
  );
}

function validateFullName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null; // Required check handles empty values
  }
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return 'Please enter at least 2 names separated by a space (e.g. Jane Doe).';
  }
  return null;
}

function validatePhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 11 || !digits.startsWith('0')) {
    return 'Phone number must be an 11-digit Nigerian number (e.g., 0908 116 6271)';
  }
  return null;
}

function validatePassword(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null; // Handled by required empty check
  }
  if (trimmed.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

function SignUpForm({ signInHref }: { signInHref: string }) {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isBusy = isLoading || isGoogleLoading;

  const handlePhoneChange = (val: string) => {
    // Strip out all letters and symbols, allowing only digits and spaces
    const cleanChars = val.replace(/[^\d\s]/g, '');

    // Limit numbers to 11 digits maximum while allowing user to type spaces
    let digits = 0;
    let result = '';
    for (const char of cleanChars) {
      if (/\d/.test(char)) {
        if (digits >= 11) break;
        digits++;
        result += char;
      } else if (char === ' ') {
        result += char;
      }
    }
    setPhone(result);
  };

  const fullNameError = validateFullName(fullName);
  const emailError = validateEmail(email);
  const phoneError = validatePhone(phone);
  const passwordError = validatePassword(password);

  const isFullNameInvalid = !fullName.trim() || Boolean(fullNameError);
  const isEmailInvalid = !email.trim() || Boolean(emailError);
  const isPhoneInvalid = !phone.trim() || Boolean(phoneError);
  const isPasswordInvalid = !password.trim() || Boolean(passwordError);

  const isFormInvalid =
    isFullNameInvalid ||
    isEmailInvalid ||
    isPhoneInvalid ||
    isPasswordInvalid ||
    !acceptTerms;

  const isFormValid = !isFormInvalid;
  const isAriaDisabled = isFormInvalid || isBusy;

  const handleButtonClick = () => {
    if (!acceptTerms) {
      setTermsError('You must accept the Terms & Conditions to create an account.');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy || !acceptTerms) {
      if (!acceptTerms) {
        setTermsError('You must accept the Terms & Conditions to create an account.');
        setTimeout(() => {
          document.getElementById('acceptTerms')?.focus();
        }, 0);
      }
      return;
    }
    setError(null);

    if (
      isFullNameInvalid ||
      isEmailInvalid ||
      isPhoneInvalid ||
      isPasswordInvalid
    ) {
      setFormSubmitted(true);
      const firstInvalidId = isFullNameInvalid
        ? 'fullName'
        : isEmailInvalid
        ? 'email'
        : isPhoneInvalid
        ? 'phone'
        : 'password';

      setTimeout(() => {
        document.getElementById(firstInvalidId)?.focus();
      }, 0);
      return;
    }

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
          acceptTerms: true,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(
          data.error || 'Too many requests. Please wait a moment before trying again.'
        );
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Failed to create account. Please check your information.');
        setIsLoading(false);
        return;
      }

      // Send new customers to email verification before they can sign in.
      router.push(
        `/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
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

  return (
    <>
      <AuthFrame title="Create customer account">
        {error && <FormAlert tone="error">{error}</FormAlert>}

        <form onSubmit={handleSubmit} noValidate aria-label="Create customer account" className="space-y-4">
          <TextField
            id="fullName"
            label="Full name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={setFullName}
            placeholder="Jane Doe"
            minLength={2}
            forceTouched={formSubmitted}
            validate={validateFullName}
          />

          <TextField
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            forceTouched={formSubmitted}
            validate={validateEmail}
            validateOnType={true}
          />

          <TextField
            id="phone"
            label="Phone number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="0908 116 6271"
            forceTouched={formSubmitted}
            validate={validatePhone}
          />

          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            placeholder="Password"
            minLength={8}
            hint="Must be at least 8 characters"
            showHintOnFocusOrType={true}
            showPasswordToggle={true}
            forceTouched={formSubmitted}
            validate={validatePassword}
          />

          {/* Terms & Conditions Checkbox */}
          <div className="pt-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container/60 border border-outline-variant/60">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (e.target.checked) {
                    setTermsError(null);
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20 accent-primary cursor-pointer"
              />
              <div className="text-fluid-badge text-secondary leading-snug">
                <label htmlFor="acceptTerms" className="cursor-pointer select-none">
                  I have read and agree to Tayhlor&apos;s{' '}
                </label>
                <button
                  id="terms-button"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTermsModalOpen(true);
                  }}
                  className="text-primary font-semibold underline hover:opacity-80 inline transition-opacity focus:outline-none focus:underline"
                >
                  Terms &amp; Conditions
                </button>
                <label htmlFor="acceptTerms" className="cursor-pointer select-none">
                  {' '}and acknowledge the bespoke order and data protection terms.
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            onClick={handleButtonClick}
            aria-disabled={isAriaDisabled}
            aria-describedby={
              termsError
                ? 'terms-click-error'
                : isAriaDisabled
                ? 'terms-button-hint'
                : undefined
            }
            className={`mt-2 ${PRIMARY_BUTTON_CLASSES} ${
              isAriaDisabled
                ? 'opacity-50 cursor-not-allowed shadow-none hover:opacity-50 hover:shadow-none !transform-none hover:!transform-none active:!transform-none hover:!filter-none active:!filter-none'
                : ''
            }`}
          >
            {isLoading ? (
              <>
                <span
                  aria-hidden="true"
                  className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin motion-reduce:animate-none"
                />
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {termsError && (
            <p
              id="terms-click-error"
              role="alert"
              className="mt-2 text-fluid-badge text-error flex items-center gap-1.5 font-medium animate-in fade-in duration-150"
            >
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{termsError}</span>
            </p>
          )}

          <span id="terms-button-hint" className="sr-only">
            You must accept the terms and conditions to enable this button
          </span>
        </form>

        <OrDivider label="Or sign up with" />

        <div className="mt-6">
          <GoogleButton
            onClick={handleGoogleSignIn}
            disabled={isBusy}
            isLoading={isGoogleLoading}
          />
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/auth/verify"
            scroll={false}
            className="inline-block py-1.5 text-fluid-badge text-secondary hover:text-primary hover:underline transition-colors"
          >
            Need to verify your email?
          </Link>
        </div>

        <p className="mt-6 text-fluid-badge text-secondary text-center">
          By creating an account, you acknowledge that your order and measurement data remain
          securely stored within Tayhlor. See our{' '}
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline">
            Terms &amp; Privacy Notice
          </Link>{' '}
          (FR-73).
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

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => {
          setAcceptTerms(true);
          setTermsError(null);
        }}
      />
    </>
  );
}

function ResetPasswordPanel({
  signInHref,
  resetHref,
  token,
}: {
  signInHref: string;
  resetHref: string;
  token: string;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasToken = token.length > 0;
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const confirmPasswordError =
    confirmPassword && confirmPassword !== password ? 'Passwords do not match.' : null;

  const isEmailInvalid = !email.trim() || Boolean(emailError);
  const isPasswordInvalid = !password.trim() || Boolean(passwordError);
  const isConfirmInvalid = !confirmPassword.trim() || Boolean(confirmPasswordError);

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (isEmailInvalid) {
      setFormSubmitted(true);
      setTimeout(() => {
        document.getElementById('reset-email')?.focus();
      }, 0);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'We could not send the reset email. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccess(
        data.message ||
          "If an email/password account exists for that address, we've sent a reset link."
      );
      setIsLoading(false);
    } catch {
      setError('An unexpected network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleConfirmSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (isPasswordInvalid || isConfirmInvalid) {
      setFormSubmitted(true);
      const firstInvalidId = isPasswordInvalid ? 'new-password' : 'confirm-password';
      setTimeout(() => {
        document.getElementById(firstInvalidId)?.focus();
      }, 0);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'We could not reset your password. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccess(
        data.message || 'Your password has been updated. Please sign in with your new password.'
      );
      setIsLoading(false);
    } catch {
      setError('An unexpected network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame
      title="Reset password"
      description={
        hasToken
          ? 'Choose a new password for your Tayhlor account.'
          : "Enter your email address and we'll send you a reset link if an email/password account exists."
      }
    >
      {error && <FormAlert tone="error">{error}</FormAlert>}

      {success ? (
        <div
          role="status"
          className="p-4 rounded-lg bg-surface-container border border-outline-variant text-fluid-body-sm text-secondary"
        >
          <p>{success}</p>
          {!hasToken && (
            <p className="mt-2">
              If you signed up with Google, use the Google sign-in option instead.
            </p>
          )}
        </div>
      ) : hasToken ? (
        <form
          onSubmit={handleConfirmSubmit}
          noValidate
          aria-label="Choose a new password"
          className="space-y-5"
        >
          <TextField
            id="new-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            minLength={8}
            hint="Must be at least 8 characters"
            showHintOnFocusOrType={true}
            showPasswordToggle={true}
            forceTouched={formSubmitted}
            validate={validatePassword}
          />

          <TextField
            id="confirm-password"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat your new password"
            showPasswordToggle={true}
            forceTouched={formSubmitted}
            validate={(value) =>
              value && value !== password ? 'Passwords do not match.' : null
            }
          />

          <span className="sr-only" role="status">
            {isLoading ? 'Updating your password…' : ''}
          </span>

          <button type="submit" disabled={isLoading} className={PRIMARY_BUTTON_CLASSES}>
            {isLoading ? (
              <>
                <span
                  aria-hidden="true"
                  className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin motion-reduce:animate-none"
                />
                <span>Updating password...</span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center">
            <Link
              href={resetHref}
              scroll={false}
              className="inline-block py-2 text-fluid-body-sm text-secondary font-medium hover:text-primary hover:underline transition-colors"
            >
              Request a different link
            </Link>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleRequestSubmit}
          noValidate
          aria-label="Request a password reset link"
          className="space-y-5"
        >
          <TextField
            id="reset-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            forceTouched={formSubmitted}
            validate={validateEmail}
            validateOnType={true}
          />

          <span className="sr-only" role="status">
            {isLoading ? 'Sending reset link…' : ''}
          </span>

          <button type="submit" disabled={isLoading} className={PRIMARY_BUTTON_CLASSES}>
            {isLoading ? (
              <>
                <span
                  aria-hidden="true"
                  className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin motion-reduce:animate-none"
                />
                <span>Sending link...</span>
              </>
            ) : (
              'Send reset link'
            )}
          </button>

          <p className="text-fluid-badge text-secondary text-center">
            The link expires in 30 minutes and can be used once. If you signed up with Google,
            use the Google sign-in option instead.
          </p>
        </form>
      )}

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
  const resetToken = searchParams.get('token') ?? '';

  if (status === 'loading') {
    return (
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
    return <SignUpForm signInHref={loginHref} />;
  }

  if (mode === 'reset') {
    return (
      <ResetPasswordPanel
        signInHref={loginHref}
        resetHref={resetHref}
        token={resetToken}
      />
    );
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
      <UnifiedAuthPage />
    </Suspense>
  );
}
