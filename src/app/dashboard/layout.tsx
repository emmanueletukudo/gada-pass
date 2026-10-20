'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import SideBar, { User } from '@/components/dashboard/sidebar';
import MobileSideBar from '@/components/dashboard/mobile-sidebar';
import { Header } from '@/components/dashboard/header';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { SettlementNotification } from '@/components/dashboard/settlement-notification';
import { DashboardSkeleton } from '@/components/dashboard/common/dashboard-skeleton';
import { useSettlementAccounts } from '@/lib/hooks-new/useSettlementAccounts';
import { useSettlementStore } from '@/stores/use-settlement-store';

export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const isOrganizer = user?.role?.toUpperCase() === 'ORGANIZER';

  const { data: accounts = [], isLoading: isAccountsLoading } =
    useSettlementAccounts();
  const isDismissed = useSettlementStore((s) => s.isDismissed);

  if (isUserLoading || (isOrganizer && isAccountsLoading)) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] text-[#17211b]">
        <div className="lg:ml-64">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  const pathSegments = pathname.split('/');
  const rawTitle = pathSegments[pathSegments.length - 1];
  const derivedActiveTitle =
    !rawTitle || rawTitle === user?.role?.toLowerCase()
      ? 'Overview'
      : rawTitle.replace('-', ' ');

  const needsWalletSetup = isOrganizer && accounts.length === 0 && !isDismissed;

  return (
    <div className="min-h-screen bg-[#f7f7f2] text-[#17211b]">
      <SideBar user={user as User} />
      <MobileSideBar
        user={user as User}
        isOpen={isMobileOpen}
        setIsOpen={setIsMobileOpen}
      />

      <main className="lg:ml-64">
        <Header
          active={derivedActiveTitle}
          online={true}
          onMenuToggle={() => setIsMobileOpen(true)}
        />

        {needsWalletSetup && (
          <SettlementNotification
            hasSettlementAccount={false}
            setupUrl="/dashboard/organizer/settings"
          />
        )}

        <div className="mx-auto max-w-7xl px-5 py-6 md:px-10 md:py-2">
          {children}
        </div>
      </main>
    </div>
  );
}
