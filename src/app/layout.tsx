import type { Metadata, Viewport } from 'next';
import { Lora, Manrope } from 'next/font/google';
import '../styles/globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';

const lora = Lora({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-lora',
  display: 'swap',
  preload: true,
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tayhlor.vercel.app');

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Tayhlor | Bespoke Tailoring Atelier',
    template: '%s | Tayhlor',
  },
  description: 'Bespoke tailoring management platform',
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#101b2d',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-surface text-on-surface antialiased flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

