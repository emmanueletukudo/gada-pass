import { AppHeader } from '@/components/app-header';
import AppFooter from '@/components/app-footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full min-w-full">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}