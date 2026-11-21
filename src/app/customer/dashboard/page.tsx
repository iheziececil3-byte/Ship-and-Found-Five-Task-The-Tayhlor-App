import Link from 'next/link';

const DASHBOARD_CARDS = [
  {
    title: 'Orders',
    description: 'Your garment orders and their current progress will appear here.',
  },
  {
    title: 'Measurements',
    description: 'Keep your measurement records ready for your next order.',
  },
  {
    title: 'Payments',
    description: 'Deposits, balances, and payment history will be shown here.',
  },
];

export default function CustomerDashboardPage() {
  return (
    <main className="min-h-screen bg-surface-container-low px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-outline-variant bg-surface p-8 shadow-soft sm:p-10">
          <p className="text-fluid-badge font-medium uppercase tracking-wide text-secondary">
            Customer dashboard
          </p>
          <h1 className="mt-2 font-display font-semibold text-fluid-headline-lg text-primary">
            Welcome to your dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-fluid-body-sm text-secondary">
            Your email is verified. This is your Tayhlor home for order progress,
            measurements, and payment history. Those sections will fill in as
            they become available.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {DASHBOARD_CARDS.map((card) => (
              <section
                key={card.title}
                className="rounded-xl border border-outline-variant bg-surface-container-low p-5"
              >
                <h2 className="font-display font-semibold text-fluid-label text-primary">
                  {card.title}
                </h2>
                <p className="mt-2 text-fluid-badge leading-relaxed text-secondary">
                  {card.description}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-8 border-t border-outline-variant pt-6">
            <Link
              href="/"
              className="text-fluid-body-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              Back to Tayhlor home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
