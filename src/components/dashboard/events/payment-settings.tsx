'use client';

import { useEffect, useState, useCallback } from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import {
  Building2,
  CheckCircle2,
  Plus,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createSetlementAccounts,
  getSetlementAccounts,
  getSupportedBanks,
  SetlementAccount,
  supportedBanksResponse,
  verifyBankAccount,
} from '@/lib/event';
import { BankSelect, BankOption } from '@/components/common/BankSelect';

interface PaymentSettingsStepProps {
  form: UseFormReturn<any>;
}

export function PaymentSettingsStep({ form }: PaymentSettingsStepProps) {
  const { setValue, watch, control } = form;

  const [accounts, setAccounts] = useState<SetlementAccount[]>([]);
  const [supportedBanks, setSupportedBanks] = useState<
    supportedBanksResponse[]
  >([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
  const selectedAccountId = watch('settlementAccountId') || defaultAcc?.id;
  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) || defaultAcc;

  const [isChanging, setIsChanging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const bankOptions: BankOption[] = supportedBanks.map((b) => b);

  useEffect(() => {
    let isMounted = true;
    const fetchAccounts = async () => {
      try {
        const res = await getSetlementAccounts();
        if (isMounted && res) {
          setAccounts(res);
        }
      } catch (error) {
        console.error('Could not fetch settlement accounts', error);
      }
    };
    fetchAccounts();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const res = await getSupportedBanks();
        if (isMounted && res) {
          setSupportedBanks(res);
        }
      } catch (error) {
        console.error('Failed to fetch banks', error);
      } finally {
        if (isMounted) setIsLoadingBanks(false);
      }
    };
    fetchBanks();
    return () => {
      isMounted = false;
    };
  }, []);

  const triggerVerification = useCallback(
    async (accNum: string, code: string) => {
      if (accNum.length === 10 && code) {
        setIsResolving(true);
        setNewAccountName('');
        try {
          const result = await verifyBankAccount({
            accountNumber: accNum,
            bankCode: code,
          });

          if (result.accountName) {
            setNewAccountName(result.accountName);
            toast.success('Account name verified');
          } else {
            toast.error('Could not verify account details');
          }
        } catch (error: any) {
          console.error('Account verification error:', error);
          toast.error(
            error?.response?.data?.message ||
              'Failed to verify account number. Please check the details.',
          );
        } finally {
          setIsResolving(false);
        }
      }
    },
    [],
  );

  const handleBankChange = (code: string) => {
    setSelectedBankCode(code);
    if (newAccountNumber.length === 10) {
      triggerVerification(newAccountNumber, code);
    }
  };

  const handleAccountNumberChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    setNewAccountNumber(cleanVal);
    if (cleanVal.length === 10 && selectedBankCode) {
      triggerVerification(cleanVal, selectedBankCode);
    } else {
      setNewAccountName('');
    }
  };

  const handleAddNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (
        !selectedBankCode ||
        newAccountNumber.length !== 10 ||
        !newAccountName
      ) {
        toast.error('Please complete bank selection and account verification.');
        return;
      }

      const selectedBank = supportedBanks.find(
        (b) => b.code === selectedBankCode,
      );

      const newAccount = await createSetlementAccounts({
        bankName: selectedBank && selectedBank.bank as string,
        accountName: newAccountName,
        bankCode: selectedBank?.code,
        accountNumber: newAccountNumber,
        isDefault: true,
      });

      if (newAccount.accountName) {
        console.log('newAccount', newAccount);
        const createdAccount: SetlementAccount = {
          id: newAccount.id,
          bankName: newAccount.bankName,
          accountNumber: `•••• ${newAccount.accountNumber.slice(-4)}`,
          accountName: newAccount.accountName,
          isDefault: newAccount.isDefault,
        };

        setAccounts((prev) => [...prev, createdAccount]);
        setValue('settlementAccountId', createdAccount.id, {
          shouldValidate: true,
        });

        setShowAddModal(false);
        setIsChanging(false);
        setSelectedBankCode('');
        setNewAccountNumber('');
        setNewAccountName('');
        toast.success('New payout account added successfully!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h6 className="display text-lg font-bold tracking-tight text-[#17211b]">
          Payout & Settlement Account
        </h6>
        <p className="mt-1 text-sm text-[#6d766d]">
          Ticket revenues and payouts for this event will be settled directly to
          this bank account.
        </p>
      </div>

      {selectedAccount && !isChanging ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-[#17211b] bg-[#fffef9] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d6f94a] text-[#17211b]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#17211b]">
                    {selectedAccount.bankName}
                  </h4>
                  {selectedAccount.isDefault && (
                    <span className="rounded-full bg-[#17211b]/10 px-2 py-0.5 text-[10px] font-bold text-[#17211b]">
                      Default Account
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold tracking-wide text-[#6d766d]">
                  {selectedAccount.accountNumber} -{' '}
                  {selectedAccount.accountName}
                </p>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-[#17211b]" />
          </div>

          <div className="mt-5 flex items-center justify-between border-[#dce1d5] pt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsChanging(true)}
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
      ) : (
        <div className="space-y-3 rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-wider text-[#6d766d]">
              Select or create a Payout Account
            </p>
            {selectedAccount && (
              <button
                type="button"
                onClick={() => setIsChanging(false)}
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
                    onChange={() => {
                      setValue('settlementAccountId', acc.id, {
                        shouldValidate: true,
                      });
                      setIsChanging(false);
                    }}
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
            onClick={() => setShowAddModal(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#17211b]/40 bg-white py-3 text-xs font-bold text-[#17211b] transition hover:border-[#17211b] hover:bg-[#17211b]/5"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Settlement Account</span>
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#dce1d5] bg-white p-6 shadow-2xl">
            <h4 className="display text-lg font-bold text-[#17211b]">
              Add Settlement Account
            </h4>
            <p className="mt-1 text-xs text-[#6d766d]">
              Select your bank and enter your 10-digit NUBAN account number.
            </p>

            <form onSubmit={handleAddNewAccount} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#17211b] mb-1">
                  Select Bank
                </label>
                <BankSelect
                  banks={bankOptions}
                  value={selectedBankCode}
                  onChange={handleBankChange}
                  isLoading={isLoadingBanks}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#17211b] mb-1">
                  Account Number (10 Digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={newAccountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  placeholder="0123456789"
                  required
                  className="w-full rounded-xl border border-[#dce1d5] bg-[#f7f7f2] px-4 py-3 text-sm font-bold text-[#17211b] focus:border-[#17211b] focus:outline-none"
                />
              </div>
              {isResolving && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#6d766d]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#17211b]" />
                  <span>Verifying account details...</span>
                </div>
              )}

              {newAccountName && !isResolving && (
                <div className="rounded-xl bg-[#d6f94a]/30 border border-[#17211b]/10 p-3 text-xs font-bold text-[#17211b]">
                  Account Name: {newAccountName}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedBankCode('');
                    setNewAccountNumber('');
                    setNewAccountName('');
                  }}
                  className="rounded-full px-4 py-2 text-xs font-bold text-[#6d766d] hover:bg-[#17211b]/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newAccountName || isResolving}
                  className="rounded-full bg-[#17211b] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50 transition"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
