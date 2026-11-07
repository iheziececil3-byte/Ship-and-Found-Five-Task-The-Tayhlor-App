import React from 'react';
import Link from 'next/link';
import { TermsContent } from '@/components/terms/TermsContent';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-container-low py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Brand Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-outline-variant">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-display font-semibold text-xl shadow-soft">
              T
            </div>
            <span className="font-display font-semibold text-fluid-brand text-primary">
              Tayhlor
            </span>
          </Link>

          <div className="flex items-center gap-3 text-fluid-badge">
            <Link
              href="/auth?mode=signup"
              className="py-2 px-4 rounded-lg bg-primary text-on-primary font-medium shadow-soft hover:opacity-95 transition-opacity"
            >
              Back to Create Account
            </Link>
            <Link
              href="/"
              className="py-2 px-3 rounded-lg border border-outline-variant bg-surface text-primary font-medium hover:bg-surface-container transition-colors"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Document Header */}
        <div className="mb-8">
          <span className="inline-block py-1 px-3 rounded-full bg-surface text-secondary border border-outline-variant text-fluid-badge font-medium mb-3">
            Legal Agreement
          </span>
          <h1 className="font-display font-semibold text-fluid-headline-lg text-primary tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-fluid-body text-secondary">
            Governing your access, clothing orders, bespoke measurements, and payment obligations within the Tayhlor tailoring application.
          </p>
        </div>

        {/* Document Card */}
        <div className="bg-surface p-6 sm:p-10 rounded-2xl border border-outline-variant shadow-soft">
          <TermsContent />
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 text-fluid-badge text-secondary">
          <p>
            &copy; {new Date().getFullYear()} Tayhlor Atelier. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/auth?mode=signup" className="text-primary hover:underline font-medium">
              Create Customer Account
            </Link>
            <Link href="/" className="hover:underline">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

