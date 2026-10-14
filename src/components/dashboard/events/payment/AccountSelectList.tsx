'use client';

import { Plus } from 'lucide-react';
import { SetlementAccount } from '@/lib/event';

interface AccountSelectListProps {
  accounts: SetlementAccount[];
  selectedAccountId?: string;
  onSelectAccount: (id: string) => void;
  onCancelChange?: () => void;
  onOpenAddModal: () => void;
  showCancel?: boolean;
}

export function AccountSelectList({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onCancelChange,
  onOpenAddModal,
  showCancel = false,
}: AccountSelectListProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold tracking-wider text-[#6d766d]">
          Select or create a Payout Account
        </p>
        {showCancel && onCancelChange && (
          <button
            type="button"
            onClick={onCancelChange}
            className="text-xs font-bold text-[#17211b] hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="space-y-2">
        {accounts.map((acc) => (
          <label
            key={acc.id}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
              selectedAccountId === acc.id
                ? 'border-[#17211b] bg-[#fffef9] shadow-sm'
                : 'border-[#dce1d5] bg-white hover:border-[#17211b]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="settlementAccountId"
                value={acc.id}
                checked={selectedAccountId === acc.id}
                onChange={() => onSelectAccount(acc.id as string)}
                className="accent-[#17211b]"
              />
              <div>
                <p className="text-sm font-bold text-[#17211b]">
                  {acc.bankName} ({acc.accountNumber})
                </p>
                <p className="text-xs text-[#6d766d]">{acc.accountName}</p>
              </div>
            </div>
            {acc.isDefault && (
              <span className="text-[10px] font-bold text-[#6d766d]">
                DEFAULT
              </span>
            )}
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenAddModal}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#17211b]/40 bg-white py-3 text-xs font-bold text-[#17211b] transition hover:border-[#17211b] hover:bg-[#17211b]/5"
      >
        <Plus className="h-4 w-4" />
        <span>Add New Settlement Account</span>
      </button>
    </div>
  );
}
