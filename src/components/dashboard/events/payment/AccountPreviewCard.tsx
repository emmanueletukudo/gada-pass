'use client';

import { Building2, CheckCircle2, ExternalLink } from 'lucide-react';
import { SetlementAccount } from '@/lib/event';

interface AccountPreviewCardProps {
  account: SetlementAccount;
  onChangeRequested: () => void;
}

export function AccountPreviewCard({
  account,
  onChangeRequested,
}: AccountPreviewCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#17211b] bg-[#fffef9] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d6f94a] text-[#17211b]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#17211b]">{account.bankName}</h4>
              {account.isDefault && (
                <span className="rounded-full bg-[#17211b]/10 px-2 py-0.5 text-[10px] font-bold text-[#17211b]">
                  Default Account
                </span>
              )}
            </div>
            <p className="text-sm font-semibold tracking-wide text-[#6d766d]">
              {account.accountNumber} - {account.accountName}
            </p>
          </div>
        </div>
        <CheckCircle2 className="h-5 w-5 text-[#17211b]" />
      </div>

      <div className="mt-5 flex items-center justify-between border-[#dce1d5] pt-4 text-xs font-bold">
        <button
          type="button"
          onClick={onChangeRequested}
          className="text-[#17211b] hover:underline"
        >
          Use a different account
        </button>

        <a
          href="/dashboard/organizer/settings"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[#6d766d] hover:text-[#17211b]"
        >
          Manage accounts <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
