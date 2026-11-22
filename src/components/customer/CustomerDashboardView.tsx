'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignOutButton } from './SignOutButton';

interface CustomerDashboardViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

type TabType = 'overview' | 'orders' | 'measurements' | 'payments';

const STANDARD_MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest', hint: 'Around fullest part of chest', standard: 'cm' },
  { key: 'waist', label: 'Waist', hint: 'Natural waistline above navel', standard: 'cm' },
  { key: 'hip', label: 'Hip', hint: 'Around widest part of hips', standard: 'cm' },
  { key: 'shoulder', label: 'Shoulder Width', hint: 'Tip of shoulder to tip of shoulder', standard: 'cm' },
  { key: 'sleeve', label: 'Sleeve Length', hint: 'Shoulder point to wrist bone', standard: 'cm' },
  { key: 'inseam', label: 'Inseam', hint: 'Crotch seam to bottom of ankle', standard: 'cm' },
  { key: 'length', label: 'Total Garment Length', hint: 'Base of neck to desired hem', standard: 'cm' },
];

const ORDER_STEPS = [
  {
    step: '1',
    title: 'Order Submitted',
    status: 'SUBMITTED',
    description: 'Specify garment details and attach your saved centimetre measurement record.',
  },
  {
    step: '2',
    title: 'Review & 70% Deposit',
    status: 'ACCEPTED',
    description: 'Tailor sets the quoted total and target date. 70% deposit is unlocked for payment.',
  },
  {
    step: '3',
    title: 'Garment Crafting',
    status: 'IN_PROGRESS',
    description: 'Bespoke cutting and tailoring begins once Paystack confirms deposit receipt.',
  },
  {
    step: '4',
    title: 'Fitting & 30% Balance',
    status: 'READY_FOR_COLLECTION',
    description: 'Garment is ready. Final fitting recorded and remaining 30% balance completed.',
  },
];

export function CustomerDashboardView({ user }: CustomerDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fullName = user.name || 'Valued Customer';
  const firstName = fullName.split(' ')[0];
  const email = user.email || '';
  const initial = (firstName || 'C')[0].toUpperCase();

  const handleActionClick = (actionName: string) => {
    setActionNotice(`${actionName} will be available in the upcoming atelier intake release.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      {/* Top Header / Navigation Bar */}
      <header className="border-b border-outline-variant bg-surface sticky top-0 z-10 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-display font-semibold text-xl shadow-soft"
              >
                T
              </div>
              <div className="flex flex-col">
                <span className="font-display font-semibold text-fluid-brand text-primary leading-tight">
                  Tayhlor
                </span>
                <span className="text-fluid-badge uppercase tracking-wider text-secondary font-medium">
                  Atelier Customer Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* User Profile Pill */}
            <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant">
              <div
                aria-hidden="true"
                className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs"
              >
                {initial}
              </div>
              <div className="text-left">
                <p className="text-fluid-badge font-semibold text-primary leading-none truncate max-w-[140px]">
                  {fullName}
                </p>
                <p className="text-[11px] text-success font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                  Verified
                </p>
              </div>
            </div>

            {/* Prominent Sign Out Button */}
            <SignOutButton variant="secondary" />
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Action Notification Toast */}
        {actionNotice && (
          <div
            role="status"
            className="p-4 rounded-xl bg-primary text-on-primary text-fluid-body-sm shadow-soft flex items-center justify-between gap-3 animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{actionNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-on-primary/80 hover:text-on-primary text-xs font-semibold px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Welcome Banner */}
        <section className="rounded-2xl border border-outline-variant bg-surface p-6 sm:p-8 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-fluid-badge font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>Email Verified &amp; Account Active</span>
              </div>
              <h1 className="font-display font-semibold text-fluid-headline-lg text-primary">
                Welcome back, {firstName}
              </h1>
              <p className="text-fluid-body-sm text-secondary max-w-2xl">
                Your Tayhlor atelier hub. Record your centimetre measurements, commission bespoke garments, and follow real-time craft progress.
              </p>
            </div>

            {/* Quick Action CTA Group */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleActionClick('Bespoke order placement')}
                className="py-2.5 px-4 rounded-lg bg-primary text-on-primary font-medium text-fluid-label shadow-soft hover:opacity-95 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Bespoke Order</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('measurements')}
                className="py-2.5 px-4 rounded-lg bg-surface-container border border-outline-variant text-primary font-medium text-fluid-label hover:bg-surface-container-high transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>My Measurements</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Navigation Controls */}
        <nav aria-label="Dashboard views" className="flex border-b border-outline-variant space-x-1 sm:space-x-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: 'My Orders' },
            { id: 'measurements', label: 'Measurements (cm)' },
            { id: 'payments', label: 'Payments & Deposits' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-3 px-4 font-medium text-fluid-label border-b-2 whitespace-nowrap transition-colors focus-visible:outline-none ${
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-secondary hover:text-primary hover:border-outline'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 3 Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <section className="rounded-xl border border-outline-variant bg-surface p-5 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-fluid-badge uppercase tracking-wider font-semibold text-secondary">
                      Orders
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container border border-outline-variant text-primary">
                      0 Active
                    </span>
                  </div>
                  <h2 className="font-display font-semibold text-fluid-headline-md text-primary">
                    Bespoke Orders
                  </h2>
                  <p className="mt-2 text-fluid-badge text-secondary leading-relaxed">
                    Custom garment requests with milestones from submission to fitting.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-fluid-body-sm font-semibold text-primary hover:underline"
                  >
                    View order queue →
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-outline-variant bg-surface p-5 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-fluid-badge uppercase tracking-wider font-semibold text-secondary">
                      Profile
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      7 Standards (cm)
                    </span>
                  </div>
                  <h2 className="font-display font-semibold text-fluid-headline-md text-primary">
                    Measurements
                  </h2>
                  <p className="mt-2 text-fluid-badge text-secondary leading-relaxed">
                    Chest, waist, hips, and inseam stored in centimetres per FR-10.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('measurements')}
                    className="text-fluid-body-sm font-semibold text-primary hover:underline"
                  >
                    Open measurements →
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-outline-variant bg-surface p-5 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-fluid-badge uppercase tracking-wider font-semibold text-secondary">
                      Billing
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                      Paystack Ready
                    </span>
                  </div>
                  <h2 className="font-display font-semibold text-fluid-headline-md text-primary">
                    70% / 30% Split
                  </h2>
                  <p className="mt-2 text-fluid-badge text-secondary leading-relaxed">
                    Deposit unlocked upon acceptance; final balance due at garment fitting.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className="text-fluid-body-sm font-semibold text-primary hover:underline"
                  >
                    View billing policy →
                  </button>
                </div>
              </section>
            </div>

            {/* Bespoke Order Flow Guide */}
            <section className="rounded-2xl border border-outline-variant bg-surface p-6 sm:p-8 shadow-soft">
              <h2 className="font-display font-semibold text-fluid-headline-md text-primary">
                How Bespoke Tailoring Works at Tayhlor
              </h2>
              <p className="mt-1 text-fluid-body-sm text-secondary">
                Every order follows a strict 4-stage quality lifecycle from digital submission to final collection.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {ORDER_STEPS.map((s) => (
                  <div
                    key={s.step}
                    className="rounded-xl border border-outline-variant bg-surface-container-low p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                          {s.step}
                        </span>
                        <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-outline-variant text-secondary">
                          {s.status}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-fluid-label text-primary">
                        {s.title}
                      </h3>
                      <p className="mt-1.5 text-fluid-badge text-secondary leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Atelier Support & Contact Information */}
            <section className="rounded-2xl border border-outline-variant bg-surface p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-fluid-label text-primary">
                  Tayhlor Tailor Atelier Contact
                </h3>
                <p className="text-fluid-body-sm text-secondary">
                  Direct communication: Verified information is recorded on each accepted order invoice.
                </p>
                <p className="text-fluid-badge text-secondary">
                  Registered account: <span className="font-mono text-primary font-medium">{email}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="py-2 px-3.5 rounded-lg border border-outline-variant bg-surface-container text-primary text-fluid-body-sm font-medium hover:bg-surface-container-high transition-colors"
                >
                  Back to Tayhlor Home
                </Link>
                <SignOutButton variant="danger" />
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div className="rounded-2xl border border-outline-variant bg-surface p-8 sm:p-12 shadow-soft text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="font-display font-semibold text-fluid-headline-md text-primary">
              No Garment Orders Yet
            </h2>
            <p className="text-fluid-body-sm text-secondary max-w-md mx-auto">
              When you submit a garment order, the tailor reviews your description, enters a quoted total in Nigerian Naira (NGN), and sets a target completion date.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleActionClick('Order submission')}
                className="py-2.5 px-6 rounded-lg bg-primary text-on-primary font-medium text-fluid-label shadow-soft hover:opacity-95 transition-opacity"
              >
                Place Your First Bespoke Request
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: MEASUREMENTS */}
        {activeTab === 'measurements' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-outline-variant bg-surface p-6 sm:p-8 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display font-semibold text-fluid-headline-md text-primary">
                    Standard Anatomical Measurements (FR-10)
                  </h2>
                  <p className="mt-1 text-fluid-body-sm text-secondary">
                    All values are stored in centimetres. Submitted orders retain an immutable snapshot of your measurements at time of placement.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleActionClick('Measurement editor')}
                  className="py-2 px-4 rounded-lg bg-primary text-on-primary font-medium text-fluid-label shadow-soft hover:opacity-95 transition-opacity self-start sm:self-auto"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {STANDARD_MEASUREMENT_FIELDS.map((f) => (
                  <div
                    key={f.key}
                    className="p-4 rounded-xl border border-outline-variant bg-surface-container-low flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-fluid-label text-primary">{f.label}</span>
                        <span className="text-xs font-mono font-medium text-secondary">{f.standard}</span>
                      </div>
                      <p className="mt-1 text-fluid-badge text-secondary">{f.hint}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-outline-variant/60">
                      <span className="text-xs text-secondary font-mono">Not yet recorded</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-outline-variant bg-surface p-6 sm:p-8 shadow-soft">
              <h2 className="font-display font-semibold text-fluid-headline-md text-primary">
                Tayhlor Payment Architecture (FR-40 - FR-46)
              </h2>
              <p className="mt-1 text-fluid-body-sm text-secondary">
                Money is handled in whole Nigerian kobo units through Paystack test credentials with server-side webhook validation.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="p-5 rounded-xl border border-outline-variant bg-surface-container-low">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-fluid-label text-primary">Stage 1: Deposit (70%)</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Pre-production</span>
                  </div>
                  <p className="text-fluid-badge text-secondary leading-relaxed">
                    Calculated automatically from the tailor&apos;s quoted total. Payable only after the order is officially ACCEPTED. Crafting begins once verified.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-outline-variant bg-surface-container-low">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-fluid-label text-primary">Stage 2: Balance (30%)</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-outline-variant text-secondary">Fitting Completion</span>
                  </div>
                  <p className="text-fluid-badge text-secondary leading-relaxed">
                    Payable when the garment moves to READY_FOR_COLLECTION. Completion requires a satisfactory fitting and balance confirmation.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl border border-outline-variant bg-surface text-center">
                <p className="text-fluid-body-sm text-secondary">
                  No payment records found for account <span className="font-mono text-primary font-medium">{email}</span>.
                </p>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant bg-surface py-6 mt-12 text-center text-fluid-badge text-secondary">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Tayhlor Atelier. Single-shop bespoke tailoring system.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
