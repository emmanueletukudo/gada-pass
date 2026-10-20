import { useMutation } from '@tanstack/react-query';
import { api } from './useApi';

interface CheckInPayload {
  qrPayload: string;
  mode: 'IN' | 'OUT';
}

type ProcessedTicket = {
  ticketId: string;
  attendeeName: string;
  tierName: string;
};

export type CheckInResult = {
  valid: boolean;
  totalProcessed?: number;
  ticketId: string;
  attendeeName?: string;
  attendeeEmail?: string;
  tierName?: string;
  orderNumber?: string;
  checkedInAt?: string;
  processedTickets?: ProcessedTicket[];
  eventName?: string;
  mode?: 'IN' | 'OUT';
};

export function useCheckInMutation() {
  return useMutation({
    mutationFn: async ({ qrPayload, mode }: CheckInPayload) => {
      const result = await api<CheckInResult>('/events/check-in', {
        method: 'POST',
        body: JSON.stringify({
          qrPayload,
          mode,
        }),
      });

      return {
        valid: true,
        ticketId: qrPayload,
        attendeeName: result.attendeeName || 'Attendee Recognized',
        email: result.attendeeEmail || 'N/A',
        tierName: result.tierName || 'Standard Pass',
        eventName: result.eventName || 'Gada Pass Event',
        checkedInAt: result.checkedInAt || new Date().toISOString(),
        totalProcessed: result.totalProcessed,
        orderNumber: result.orderNumber,
        processedTickets: result.processedTickets,
        message:
          mode === 'IN'
            ? 'Access Granted (Checked In)'
            : 'Exit Recorded (Cleared for Re-Entry)',
        mode,
      };
    },
  });
}
