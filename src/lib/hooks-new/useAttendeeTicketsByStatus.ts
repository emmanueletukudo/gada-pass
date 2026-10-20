import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AttendeeTicket {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  ticketCode: string;
  status: 'UPCOMING' | 'USED' | 'EXPIRED';
  qrCodeUrl?: string;
}

export function useAttendeeTicketsByStatus(status: 'upcoming' | 'past') {
  const statusParam = status === 'upcoming' ? 'UPCOMING' : 'PAST';

  return useQuery({
    queryKey: ['attendee-tickets', status],
    queryFn: async () => {
      const data = await api<AttendeeTicket[]>(
        `/tickets/my-tickets?status=${statusParam}`,
      );
      return Array.isArray(data) ? data : [];
    },
  });
}
