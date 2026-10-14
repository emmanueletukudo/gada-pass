export type SetlementAccount = {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
  isDefault?: boolean;
};

export interface PaymentSettingsStepProps {
  selectedAccountId?: string;
  onSelectAccount: (accountId: string) => void;
}
