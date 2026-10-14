'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Sparkles, ShieldCheck } from 'lucide-react';
import {
  getSetlementAccounts,
  getSupportedBanks,
  SetlementAccount,
  supportedBanksResponse,
} from '@/lib/event';
import { AccountSelectList } from './AccountSelectList';
import { AccountPreviewCard } from './AccountPreviewCard';
import { AddAccountModal } from './AddAccountModal';

interface PaymentSettingsStepProps {
  form: UseFormReturn<any>;
  mode?: 'event-creation' | 'settings';
}

export function PaymentSettingsStep({
  form,
  mode = 'event-creation',
}: PaymentSettingsStepProps) {
  const { setValue, watch } = form;

  const [accounts, setAccounts] = useState<SetlementAccount[]>([]);
  const [supportedBanks, setSupportedBanks] = useState<
    supportedBanksResponse[]
  >([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const watchAccountId = watch('settlementAccountId');
  const eventType = watch('eventType');
  const coverFees = watch('coverFees');
  const isFreeEvent = eventType === 'FREE_EVENT';

  const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
  const selectedAccountId = watchAccountId || defaultAcc?.id;
  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) || defaultAcc;

  useEffect(() => {
    let isMounted = true;
    getSetlementAccounts()
      .then((res) => {
        if (isMounted && res) setAccounts(res);
      })
      .catch((err) =>
        console.error('Failed to fetch settlement accounts', err),
      );

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingBanks(true);
    getSupportedBanks()
      .then((res) => {
        if (isMounted && res) setSupportedBanks(res);
      })
      .catch((err) => console.error('Failed to fetch banks', err))
      .finally(() => {
        if (isMounted) setIsLoadingBanks(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    if (selectedAccount && !isFreeEvent) {
      setValue('settlementAccountId', selectedAccount.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('settlementAccount', selectedAccount, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [selectedAccount, isFreeEvent, setValue]);

  const handleSelectAccount = (id: string) => {
    const matchedAccount = accounts.find((a) => a.id === id);
    if (matchedAccount) {
      setValue('settlementAccountId', matchedAccount.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('settlementAccount', matchedAccount, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    setIsChanging(false);
  };

  const handleAccountCreated = (newAccount: SetlementAccount) => {
    setAccounts((prev) => [...prev, newAccount]);
    handleSelectAccount(newAccount.id as string);
  };

  return (
    <div className="space-y-6">
      <div>
        <h6 className="display text-lg font-bold tracking-tight text-[#17211b]">
          Payout & Settlement Account
        </h6>
        <p className="mt-1 text-sm text-[#6d766d]">
          {isFreeEvent
            ? 'Free events do not require settlement account selection as ticket prices are ₦0.'
            : mode === 'event-creation'
              ? 'Ticket revenues and payouts for this event will be settled directly to this bank account.'
              : 'Ticket revenues and payouts will be settled directly to this bank account.'}
        </p>
      </div>

      {isFreeEvent ? (
        <div className="rounded-2xl border border-[#d6f94a] bg-[#d6f94a]/10 p-6 text-[#17211b]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#17211b]" />
            <h4 className="text-sm font-bold">Settlement Account Waived</h4>
          </div>
          <p className="mt-1 text-xs text-[#6d766d]">
            Because this experience is marked as a <strong>Free Event</strong>,
            ticket passes are set to ₦0 and revenue settlement is waived. You
            can proceed directly to the next step.
          </p>
        </div>
      ) : (
        <>
          {selectedAccount && !isChanging ? (
            <AccountPreviewCard
              account={selectedAccount}
              onChangeRequested={() => setIsChanging(true)}
            />
          ) : (
            <AccountSelectList
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={handleSelectAccount}
              onCancelChange={() => setIsChanging(false)}
              onOpenAddModal={() => setShowAddModal(true)}
              showCancel={Boolean(selectedAccount)}
            />
          )}
        </>
      )}


{ mode === "event-creation" && (
      <div className="flex items-center justify-between rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 sm:p-5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-10 w-10 text-[#ff5500]" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#17211b]">
                Fee Absorbing Mode
              </h4>
              <p className="text-xs text-[#6d766d]">
                {coverFees
                  ? 'Organizer absorbs platform commission fees on behalf of buyers.'
                  : 'Ticket buyers will pay platform commission fees during checkout.'}
              </p>
            </div>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
            coverFees
              ? 'bg-[#17211b] text-white'
              : 'bg-[#f7f7f2] border border-[#dce1d5] text-[#17211b]'
          }`}
        >
          {coverFees ? 'Organizer Pays' : 'Buyer Pays'}
        </span>
      </div>
      )}

      <AddAccountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        supportedBanks={supportedBanks}
        isLoadingBanks={isLoadingBanks}
        onAccountCreated={handleAccountCreated}
      />
    </div>
  );
}
