'use client';

import Link from 'next/link';
import { Wallet } from 'lucide-react';

interface SettlementNotificationProps {
  hasSettlementAccount?: boolean;
  setupUrl?: string;
}

export function SettlementNotification({
  hasSettlementAccount = false,
  setupUrl = '/dashboard/organizer/settings',
}: SettlementNotificationProps) {
  if (hasSettlementAccount) return null;

  return (
    <div className="w-full px-5 pt-4 md:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-black p-4 sm:p-5 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff765f]/10 text-[#ff5500]">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              Set Up Wallet <span className="text-[#ff765f]">*</span>
            </h3>
            <p className="text-md text-white mt-0.5">
              Set up your wallet for seamless and direct event payouts
            </p>
          </div>
        </div>

        <Link
          href={setupUrl}
          className="self-start sm:self-auto inline-flex items-center justify-center rounded-xl bg-[#ff5500] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#e04b00]"
        >
          Create Wallet
        </Link>
      </div>
    </div>
  );
}
