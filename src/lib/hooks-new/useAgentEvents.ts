import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './useApi';

export type AssignedEvent = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  venue: string;
  banner: string;
  images: string[];
  clearanceLevel: string;
  scannedCount: number;
  city: string;
};

export type BackendAttendee = {
  id: string;
  ticketId: string;
  guestFullName: string;
  guestEmail: string;
  tierName: string;
  status: 'PAID' | 'CHECKED_IN' | 'CANCELLED';
  checkedInAt?: string;
  orderNumber?: string;
  tier?: {
    isMultiDay?: boolean;
    validDate?: string;
  };
};

export type CheckInResult = {
  valid: boolean;
  totalProcessed?: number;
  ticketId: string;
  attendeeName?: string;
  tierName?: string;
  orderNumber?: string;
  checkedInAt?: string;
  processedTickets?: Array<{
    ticketId: string;
    attendeeName: string;
    tierName: string;
  }>;
  mode?: 'IN' | 'OUT';
};

export function useAssignedEvents() {
  return useQuery({
    queryKey: ['assigned-events'],
    queryFn: () => api<AssignedEvent[]>('/agents/assigned-events'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: () =>
      api<BackendAttendee[]>(`/agents/events/${eventId}/attendees`),
    enabled: Boolean(eventId),
  });
}

export function useCheckInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      qrPayload: string;
      eventId: string;
      mode: 'IN' | 'OUT';
    }) =>
      api<CheckInResult>('/events/check-in', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-attendees', variables.eventId],
      });
    },
  });
}
