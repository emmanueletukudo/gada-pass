import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Ticket {
  id: string;
  qrPayload?: string;
  status?: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  createdAt?: string;
  event?: {
    id?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
  };
}

export function useAttendeeTickets() {
  return useQuery({
    queryKey: ['attendee-tickets'],
    queryFn: async () => {
      const data = await api<Ticket[]>('/tickets/my-tickets');
      return Array.isArray(data) ? data : [];
    },
  });
}
