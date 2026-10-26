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

      const sortedItems = [...pendingItems].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      const itemsByEvent = sortedItems.reduce(
        (acc, item) => {
          if (!acc[item.eventId]) {
            acc[item.eventId] = [];
          }
          acc[item.eventId].push(item);
          return acc;
        },
        {} as Record<string, typeof sortedItems>,
      );

      let totalSyncedCount = 0;
      for (const [eventId, eventItems] of Object.entries(itemsByEvent)) {
        toast.info(`Syncing ${eventItems.length} offline scan(s)...`);

        const scans = eventItems.map((item) => ({
          qrPayload: item.ticketId,
          mode: item.mode,
          checkedInAt: item.timestamp,
        }));

        try {
          const response: any = await api('/events/check-in/batch', {
            method: 'POST',
            body: JSON.stringify({ eventId, scans }),
          });

          for (let i = 0; i < response.details.length; i++) {
            const detail = response.details[i];
            const originalItem = eventItems[i];
            if (
              detail.status === 'SUCCESS' ||
              detail.error?.includes('already checked in') ||
              detail.error?.includes('maximum entry limit')
            ) {
              await markTicketCheckedInOffline(originalItem.ticketId);
              if (originalItem.id) {
                await removeOutboxItem(originalItem.id);
              }
              if (detail.status === 'SUCCESS') {
                totalSyncedCount++;
              }
            }
          }
        } catch (err) {
          console.error(`Failed to sync batch for event ${eventId}:`, err);
          throw err; 
        }
      }

      return totalSyncedCount;
    },
    onSuccess: (successCount) => {
      if (successCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['check-ins'] });
        queryClient.invalidateQueries({ queryKey: ['offline-outbox'] });
        toast.success('All offline scans successfully synced to server!');
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