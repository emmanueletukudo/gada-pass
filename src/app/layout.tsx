import type { Metadata } from 'next';
import { PwaRegister } from '@/components/pwa-register';

import { Toaster } from 'sonner';
import './globals.css';
import { SessionProvider } from '@/components/providers/session-provider';
import TankstackProvider from '@/components/providers/tankstack-provider';

export const metadata: Metadata = {
  title: 'Gada Pass | Your city, in full colour',
  description: 'Discover and manage unforgettable events across Nigeria.',
  keywords: [
    'Gada Pass Admin',
    'Event Management',
    'Ticket Management',
    'Lagos Events',
    'Events in Abuja',
    'Events in Enugu',
    'Events in Nigeria',
    'Detty December Events',
  ],
  robots: { follow: true, index: true },

  openGraph: {
    title: 'Home | Gada Pass',
    description: 'Manage your events and tickets with Gada Pass Ticket Admin',
    siteName: 'Gada Pass',
    type: 'website',
    images: [
      'https://pub-0d201b6612bc47859f4719a27046564f.r2.dev/uploads/gada_pass_og_image.png',
    ],
    url: 'https://pass.gada.africa',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TankstackProvider>
          <SessionProvider>
            <PwaRegister />
            <Toaster position="top-right" richColors />
            {children}
          </SessionProvider>
        </TankstackProvider>
      </body>
    </html>
  );
}
