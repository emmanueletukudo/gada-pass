import { useQuery } from '@tanstack/react-query';
import { api } from './useApi';

export interface SetlementAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  [key: string]: unknown;
}

export function useSettlementAccounts() {
  return useQuery({
    queryKey: ['settlement-accounts'],
    queryFn: () =>
      api<SetlementAccount[]>('/settlement-accounts/organization', {
        method: 'GET',
      }),
  });
}