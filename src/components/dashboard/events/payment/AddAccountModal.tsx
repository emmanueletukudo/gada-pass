'use client';

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createSetlementAccounts,
  verifyBankAccount,
  SetlementAccount,
  supportedBanksResponse,
} from '@/lib/event';
import { BankSelect, BankOption } from '@/components/common/BankSelect';

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
  const [isResolving, setIsResolving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              'Failed to verify account number. Please check details.',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedBankCode ||
      newAccountNumber.length !== 10 ||
      !newAccountName
    ) {
      toast.error('Please complete bank selection and account verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedBank = supportedBanks.find(
        (b) => b.code === selectedBankCode,
      );

      const newAccount = await createSetlementAccounts({
        bankName: selectedBank?.bank,
        bankCode: selectedBank?.code,
        accountName: newAccountName,
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
    } finally {
      setIsSubmitting(false);
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

          {newAccountName && !isResolving && (
            <div className="rounded-xl border border-[#17211b]/10 bg-[#d6f94a]/30 p-3 text-xs font-bold text-[#17211b]">
              Account Name: {newAccountName}
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
              disabled={!newAccountName || isResolving || isSubmitting}
              className="rounded-full bg-[#17211b] px-5 py-2.5 text-xs font-bold text-white transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save & Select'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
