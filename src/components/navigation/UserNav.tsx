'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === 'authenticated' && session?.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <span className="text-fluid-body-sm font-semibold text-primary block leading-tight">
            {session.user.name || session.user.email}
          </span>
          <span className="text-fluid-badge uppercase font-medium text-secondary tracking-wider">
            {session.user.role || 'Customer'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium border border-outline-variant text-primary hover:bg-surface-container transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth?mode=signup"
        className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium bg-primary text-on-primary shadow-soft hover:opacity-95 transition-opacity"
      >
        Get Started
      </Link>
    </div>
  );
}

