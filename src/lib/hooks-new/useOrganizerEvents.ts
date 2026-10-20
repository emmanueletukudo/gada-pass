import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TicketTier {
  quantity: number;
  soldCount: number;
}

export interface OrganizerEvent {
  id: string;
  name: string;
  startsAt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'PAST';
  ticketTiers?: TicketTier[];
}

export function useOrganizerEvents() {
  return useQuery({
    queryKey: ['organizer-events-list'],
    queryFn: () => api<OrganizerEvent[]>('/organizer/events'),
  });
}
