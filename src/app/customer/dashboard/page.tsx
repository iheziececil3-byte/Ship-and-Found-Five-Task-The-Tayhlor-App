import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CustomerDashboardView } from '@/components/customer/CustomerDashboardView';

export const metadata = {
  title: 'Customer Dashboard | Tayhlor Atelier',
  description: 'Manage your bespoke orders, measurements, and payments.',
};

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth?mode=login');
  }

  return (
    <CustomerDashboardView
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    />
  );
}
