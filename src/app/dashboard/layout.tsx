'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SideBar, { User } from '@/components/dashboard/sidebar';
import MobileSideBar from '@/components/dashboard/mobile-sidebar';
import { Header } from '@/components/dashboard/header';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { SettlementNotification } from '@/components/dashboard/settlement-notification';
import { DashboardSkeleton } from '@/components/dashboard/common/dashboard-skeleton';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { getSetlementAccounts, SetlementAccount } from '@/lib/event';



export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [accounts, setAccounts] = useState<SetlementAccount[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const isOrganizer = user?.role?.toUpperCase() === 'ORGANIZER';

  useEffect(() => {
    let isMounted = true;

    const fetchAccounts = async () => {
      if (!isOrganizer) {
        setIsAccountsLoading(false);
        return;
      }

      try {
        const res = await getSetlementAccounts();
        if (isMounted && res) {
          setAccounts(res);
        }
      } catch (error) {
        console.error('Could not fetch settlement accounts', error);
      } finally {
        if (isMounted) {
          setIsAccountsLoading(false);
        }
      }
    };

    if (user) {
      fetchAccounts();
    }

    return () => {
      isMounted = false;
    };
  }, [user, isOrganizer]);


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
  const needsWalletSetup = isOrganizer && accounts.length === 0;

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
