import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './useApi';

export interface SupportInquiry {
  id: string;
  orderId: string;
  guestName: string;
  eventName: string;
  phoneNumber: string;
  ticketTierName?: string;
  ticketQuantity: number;
  lastMessage: string;
  timestamp: string;
  status: 'OPEN' | 'RESOLVED';
}

export function useSupportInquiries() {
  return useQuery({
    queryKey: ['support-inquiries'],
    queryFn: async () => {
      const response = await api<SupportInquiry[] | { data: SupportInquiry[] }>(
        '/support-inquiries/organizer',
        { method: 'GET' },
      );

      return Array.isArray(response)
        ? response
        : Array.isArray((response as { data?: SupportInquiry[] })?.data)
          ? (response as { data: SupportInquiry[] }).data
          : [];
    },
  });
}

export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'OPEN' | 'RESOLVED' }) =>
      api(`/support-inquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-inquiries'] });
    },
  });
}
