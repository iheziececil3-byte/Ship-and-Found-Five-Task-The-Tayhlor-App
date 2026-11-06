'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function HeroActions() {
  const { data: session, status } = useSession();

  if (status === 'authenticated' && session?.user) {
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
            href="/customer/orders"
            className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium bg-primary text-on-primary shadow-soft hover:opacity-95 transition-opacity"
          >
            Access Atelier Orders
          </Link>
          <Link
            href="/customer/measurements"
            className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium bg-surface-container text-primary border border-outline-variant shadow-soft hover:bg-surface-container-high transition-colors"
          >
            My Measurements (FR-10)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <Link
        href="/auth/signup"
        className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium bg-primary text-on-primary shadow-soft hover:opacity-95 transition-opacity"
      >
        Create Customer Account
      </Link>
      <Link
        href="/auth/signin"
        className="inline-flex items-center justify-center py-3 px-6 rounded-lg text-fluid-label font-medium bg-surface-container text-primary border border-outline-variant shadow-soft hover:bg-surface-container-high transition-colors"
      >
        Sign In to Dashboard
      </Link>
    </div>
  );
}

