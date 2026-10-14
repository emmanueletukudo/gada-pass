import type { Metadata } from 'next';
import { PwaRegister } from '@/components/pwa-register';

import { Toaster } from 'sonner';
import './globals.css';
import { SessionProvider } from '@/components/providers/session-provider';

export const metadata: Metadata = {
  title: 'events.gada.africa | Your city, in full colour',
  description: 'Discover and manage unforgettable events across Nigeria.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <PwaRegister />
          <Toaster position="top-right" richColors />
            {children}
        </SessionProvider>
      </body>
    </html>
  );
}
