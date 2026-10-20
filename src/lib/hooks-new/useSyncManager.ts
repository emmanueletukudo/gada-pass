'use client';

import {
  getOutboxItems,
  removeOutboxItem,
  markTicketCheckedInOffline,
} from '../offline-db';


import { api } from './useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';


export function useSyncOfflineOutbox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<number> => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Device is currently offline');
      }

      const pendingItems = await getOutboxItems();
      if (pendingItems.length === 0) {
        return 0;
      }

      toast.info(`Syncing ${pendingItems.length} offline check-in(s)...`);

      let successCount = 0;

      for (const item of pendingItems) {
        try {
          await api('/events/check-in', {
            method: 'POST',
            body: JSON.stringify({
              qrPayload: item.ticketId,
              eventId: item.eventId,
            }),
          });
          await markTicketCheckedInOffline(item.ticketId);
          if (item.id) {
            await removeOutboxItem(item.id);
          }
          successCount++;
        } catch (err) {
          console.error(`Failed to sync ticket ${item.ticketId}:`, err);
        }
      }

      return successCount;
    },
    onSuccess: (successCount) => {
      if (successCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['check-ins'] });
        queryClient.invalidateQueries({ queryKey: ['offline-outbox'] });
        toast.success('All offline check-ins successfully synced to server!');
      }
    },
    onError: (error: any) => {
      if (error?.message !== 'Device is currently offline') {
        const message =
          error instanceof Error ? error.message : 'Sync queue error';
        console.error('Sync queue error:', error);
        toast.error(message);
      }
    },
  });
}
