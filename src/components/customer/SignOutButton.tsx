'use client';

import { signOut } from 'next-auth/react';

interface SignOutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function SignOutButton({
  className = '',
  variant = 'secondary',
}: SignOutButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium text-fluid-label transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  const variantClasses = {
    primary:
      'bg-primary text-on-primary py-2.5 px-4 shadow-soft hover:opacity-95',
    secondary:
      'border border-outline-variant bg-surface text-primary py-2 px-3.5 hover:bg-surface-container shadow-soft',
    danger:
      'border border-error/30 text-error bg-surface py-2 px-3.5 hover:bg-error-container/20 shadow-soft',
  }[variant];

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/auth?mode=login' })}
      className={`${baseClasses} ${variantClasses} ${className}`}
      aria-label="Sign out of your account"
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span>Sign Out</span>
    </button>
  );
}
