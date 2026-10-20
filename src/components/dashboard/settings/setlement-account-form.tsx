import { BankOption, BankSelect } from '@/components/common/BankSelect';
import { Control, Controller } from 'react-hook-form';

type FormValues = {
  bankCode: string;
  accountNumber: string;
};

type Props = {
  control: Control<FormValues>;
  banks: BankOption[];
  isLoading: boolean;
  onSubmit: () => void;
  isResolving: boolean;
  newAccountNumber: string;
  newAccountName: string;
  handleShowModal: (val: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleAccountNumberChange: (
    val: string,
  ) => void;
};

export function SettlementAccountForm({
  control,
  banks,
  isLoading,
  isResolving,
  newAccountNumber,
  newAccountName,
  handleShowModal,
  onSubmit,
  handleAccountNumberChange,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#dce1d5] bg-white p-6 shadow-2xl">
        <h4 className="display text-lg font-bold text-[#17211b]">
          Add Settlement Account
        </h4>
        <p className="mt-1 text-xs text-[#6d766d]">
          Enter your verified business or personal bank account details.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <Controller
              name="bankCode"
              control={control}
              rules={{ required: 'Please select a bank' }}
              render={({ field, fieldState }) => (
                <BankSelect
                  banks={banks}
                  value={field.value}
                  onChange={field.onChange}
                  isLoading={isLoading}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#17211b]">
              Account Number (10 Digits)
            </label>
            <input
              type="text"
              maxLength={10}
              value={newAccountNumber}
              onChange={(e) =>
                handleAccountNumberChange(e.target.value.replace(/\D/g, ''))
              }
              placeholder="0123456789"
              required
              className="mt-1 w-full rounded-xl border border-[#dce1d5] bg-[#f7f7f2] px-4 py-3 text-sm font-bold text-[#17211b] focus:border-[#17211b] focus:outline-none"
            />
          </div>

          {isResolving && (
            <p className="text-xs font-bold text-[#6d766d] animate-pulse">
              Verifying account details with NIBSS...
            </p>
          )}

          {newAccountName && !isResolving && (
            <div className="rounded-xl bg-[#d6f94a]/20 p-3 text-xs font-bold text-[#17211b]">
              Account Name: {newAccountName}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleShowModal}
              className="rounded-full px-4 py-2 text-xs font-bold text-[#6d766d] hover:bg-[#17211b]/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newAccountName || isResolving}
              className="rounded-full bg-[#17211b] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              Save & Select
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
