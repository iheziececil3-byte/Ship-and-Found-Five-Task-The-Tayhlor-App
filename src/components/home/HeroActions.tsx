'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function HeroActions() {
  const { data: session, status } = useSession();

  if (status === 'authenticated' && session?.user) {
    const dashboardHref =
      session.user.role === 'TAILOR' ? '/tailor/orders' : '/customer/dashboard';

    return (
      <div className="mt-10 flex flex-col items-center gap-4 max-w-xl w-full">
        <div className="p-4 rounded-xl bg-surface border border-outline-variant shadow-soft text-center w-full">
          <p className="text-fluid-body-sm font-semibold text-primary">
            Welcome back, {session.user.name || 'Valued Customer'}!
          </p>
          <p className="text-fluid-badge text-secondary mt-1">
            Active session: <span className="font-medium text-primary">{session.user.email}</span> (
            <span className="uppercase font-semibold">{session.user.role}</span>)
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={dashboardHref}
            className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium bg-primary text-on-primary shadow-soft hover:opacity-95 transition-opacity"
          >
            Go to Customer Dashboard →
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium bg-surface-container text-primary border border-outline-variant shadow-soft hover:bg-surface-container-high transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <Link
        href="/auth?mode=signup"
        className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium bg-primary text-on-primary shadow-soft hover:opacity-95 transition-opacity"
      >
        Create Customer Account
      </Link>
      <Link
        href="/auth?mode=login&callbackUrl=/customer/dashboard"
        className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium bg-surface-container text-primary border border-outline-variant shadow-soft hover:bg-surface-container-high transition-colors"
      >
        Sign In to Dashboard
      </Link>
    </div>
  );
}

