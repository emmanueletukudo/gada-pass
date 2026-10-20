'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BankSelect, BankOption } from '@/components/common/BankSelect';
import {
  useVerifyBankAccount,
  useCreateSettlementAccount,
  SetlementAccount,
  supportedBanksResponse,
} from '@/lib/hooks-new/useEvents';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportedBanks: supportedBanksResponse[];
  isLoadingBanks: boolean;
  onAccountCreated: (account: SetlementAccount) => void;
}

export function AddAccountModal({
  isOpen,
  onClose,
  supportedBanks,
  isLoadingBanks,
  onAccountCreated,
}: AddAccountModalProps) {
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountName, setNewAccountName] = useState('');

  const shouldVerify =
    newAccountNumber.length === 10 && Boolean(selectedBankCode);
  const verifyInput = shouldVerify
    ? { accountNumber: newAccountNumber, bankCode: selectedBankCode }
    : null;

  const { data: verificationData, isLoading: isResolving } =
    useVerifyBankAccount(verifyInput);
  const createAccountMutation = useCreateSettlementAccount();

  const bankOptions: BankOption[] = supportedBanks;

  const resetForm = () => {
    setSelectedBankCode('');
    setNewAccountNumber('');
    setNewAccountName('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBankChange = (code: string) => {
    setSelectedBankCode(code);
    if (newAccountNumber.length === 10) {
      setNewAccountName('');
    }
  };

  const handleAccountNumberChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    setNewAccountNumber(cleanVal);
    if (cleanVal.length === 10) {
      setNewAccountName('');
    }
  };

  const resolvedAccountName = verificationData?.accountName || newAccountName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedBankCode ||
      newAccountNumber.length !== 10 ||
      !resolvedAccountName
    ) {
      toast.error('Please complete bank selection and account verification.');
      return;
    }

    try {
      const selectedBank = supportedBanks.find(
        (b) => b.code === selectedBankCode,
      );

      const newAccount = await createAccountMutation.mutateAsync({
        bankName: selectedBank?.bank,
        bankCode: selectedBank?.code,
        accountName: resolvedAccountName,
        accountNumber: newAccountNumber,
        isDefault: true,
      });

      if (newAccount.accountName) {
        const createdAccount: SetlementAccount = {
          id: newAccount.id,
          bankName: newAccount.bankName,
          accountNumber: `•••• ${newAccount.accountNumber.slice(-4)}`,
          accountName: newAccount.accountName,
          isDefault: newAccount.isDefault,
        };

        onAccountCreated(createdAccount);
        toast.success('New payout account added successfully!');
        handleClose();
      }
    } catch (error) {
      console.error('Failed to create settlement account:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#dce1d5] bg-white p-6 shadow-2xl">
        <h4 className="display text-lg font-bold text-[#17211b]">
          Add Settlement Account
        </h4>
        <p className="mt-1 text-xs text-[#6d766d]">
          Select your bank and enter your 10-digit NUBAN account number.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-[#17211b]">
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
            <label className="mb-1 block text-xs font-bold uppercase text-[#17211b]">
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

          {resolvedAccountName && !isResolving && (
            <div className="rounded-xl border border-[#17211b]/10 bg-[#d6f94a]/30 p-3 text-xs font-bold text-[#17211b]">
              Account Name: {resolvedAccountName}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full px-4 py-2 text-xs font-bold text-[#6d766d] hover:bg-[#17211b]/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !resolvedAccountName ||
                isResolving ||
                createAccountMutation.isPending
              }
              className="rounded-full bg-[#17211b] px-5 py-2.5 text-xs font-bold text-white transition disabled:opacity-50"
            >
              {createAccountMutation.isPending ? 'Saving...' : 'Save & Select'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
