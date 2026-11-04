'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <span className="text-sm font-semibold text-primary block leading-tight">
            {session.user.name || session.user.email}
          </span>
          <span className="text-xs uppercase font-medium text-secondary tracking-wider">
            {session.user.role || 'Customer'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium border border-outline-variant text-primary hover:bg-surface-container transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/signin"
        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-surface-container transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/auth/signup"
        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary shadow-soft hover:opacity-95 transition-opacity"
      >
        Get Started
      </Link>
    </div>
  );
}

