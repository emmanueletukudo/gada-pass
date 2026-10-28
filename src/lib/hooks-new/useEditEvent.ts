import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { updateEvent } from '@/lib/event';
import { api } from './api';

export function useEventDetail(eventId: string) {
  return useQuery({
    queryKey: ['organizer-event-detail', eventId],
    queryFn: () => api<any>(`/organizer/events/${eventId}`),
    enabled: Boolean(eventId),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload: any }) =>
      updateEvent(eventId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['organizer-event-detail', variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ['organizer-events-list'] });
    },
  });
}
