import type { Metadata } from 'next';
import Link from 'next/link';
import { UserNav } from '@/components/navigation/UserNav';
import { HeroActions } from '@/components/home/HeroActions';

export const metadata: Metadata = {
  title: 'Bespoke Tailoring Atelier',
  description: 'Bespoke tailoring management platform',
  keywords: [
    'bespoke tailoring',
    'custom clothing',
    'tailor atelier',
    'garment measurements',
    'clothing orders',
  ],
  authors: [{ name: 'Tayhlor Atelier' }],
  creator: 'Tayhlor',
  publisher: 'Tayhlor',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: '/',
    locale: 'en_US',
    siteName: 'Tayhlor',
    title: 'Tayhlor | Bespoke Tailoring Atelier',
    description: 'Bespoke tailoring management platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tayhlor | Bespoke Tailoring Atelier',
    description: 'Bespoke tailoring management platform',
  },
};

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col justify-between">
      {/* Brand Navigation Header */}
      <header className="border-b border-outline-variant bg-surface/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Tayhlor home"
            className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-display font-semibold text-xl shadow-soft">
              T
            </div>
            <span className="font-display font-semibold text-fluid-brand text-primary">
              Tayhlor
            </span>
          </Link>
          <UserNav />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant mb-6 shadow-soft">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-fluid-badge font-medium text-secondary">
            Verified Digital Atelier
          </span>
        </div>

        <h1 className="font-display font-semibold text-fluid-hero text-primary max-w-3xl">
          Bespoke tailoring, crafted with timeless precision.
        </h1>

        <p className="mt-6 text-fluid-lead text-secondary max-w-2xl font-normal">
          From anatomical measurements in centimetres to the final fitting, every garment order,
          deposit, and stitch is recorded and verified in one place.
        </p>

        <HeroActions />
      </section>

      {/* Foundation & Architecture Cards */}
      <section className="bg-surface-container-low py-16 border-t border-outline-variant">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-semibold text-fluid-headline-lg text-primary">
              Craftsmanship & Atelier Principles
            </h2>
            <p className="mt-2 text-fluid-body-sm text-secondary">
              Core structural pillars defined by the Tayhlor Platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Precision Measurements */}
            <div className="bg-surface rounded-xl p-8 border border-outline-variant shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center mb-6 font-display font-semibold text-xl">
                  01
                </div>
                <h3 className="font-display font-semibold text-fluid-title text-primary mb-3">
                  Precision Measurements
                </h3>
                <p className="text-fluid-body-sm text-secondary">
                  Standardised anatomical captures in centimetres (chest, waist, hip, shoulder, sleeve, inseam, length). Each garment submission preserves an immutable snapshot.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant text-fluid-badge text-secondary font-medium">
                Centimetre Standard • FR-10
              </div>
            </div>

            {/* Card 2: Two-Stage Payments */}
            <div className="bg-surface rounded-xl p-8 border border-outline-variant shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6 font-display font-semibold text-xl">
                  02
                </div>
                <h3 className="font-display font-semibold text-fluid-title text-primary mb-3">
                  Two-Stage Financials
                </h3>
                <p className="text-fluid-body-sm text-secondary">
                  Strict 70% deposit upon tailor acceptance before work begins, followed by the remaining 30% balance upon collection for fitting. Server-verified via Paystack.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant text-fluid-badge text-secondary font-medium">
                70/30 Structure • FR-40/FR-42
              </div>
            </div>

            {/* Card 3: Accountable Progress */}
            <div className="bg-surface rounded-xl p-8 border border-outline-variant shadow-medium flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center mb-6 font-display font-semibold text-xl">
                  03
                </div>
                <h3 className="font-display font-semibold text-fluid-title text-primary mb-3">
                  Lifecycle Tracking
                </h3>
                <p className="text-fluid-body-sm text-secondary">
                  Orders progress through strictly regulated states. Completion requires verified balance settlement and recorded satisfactory fitting with zero fabricated updates.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant text-fluid-badge text-secondary font-medium">
                Satisfactory Fitting Gate • PRD 8.4
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand & Compliance Footer */}
      <footer className="border-t border-outline-variant bg-surface py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-fluid-body-sm text-secondary">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <span className="font-display font-semibold text-primary">Tayhlor</span>
            <span className="hidden sm:inline text-outline">•</span>
            <span>Bespoke Tailoring Platform</span>
          </div>
          <div className="flex items-center gap-6 text-fluid-badge">
            <span>Verified Information Standard (G3)</span>
            <span className="text-outline">•</span>
            <span>Privacy Notice (FR-73)</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
