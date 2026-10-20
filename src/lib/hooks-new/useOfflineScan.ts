'use client';

import { del, get, set } from 'idb-keyval';
import { api } from './useApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type OfflineScan = {
  ticketCode: string;
  scannedAt: string;
  agentId: string;
};

const SCAN_QUEUE_KEY = 'eventsgada-scan-queue';


export function useOfflineScans() {
  return useQuery({
    queryKey: ['offline-scans'],
    queryFn: async (): Promise<OfflineScan[]> => {
      const queue = await get<OfflineScan[]>(SCAN_QUEUE_KEY);
      return queue ?? [];
    },
  });
}


export function useQueueOfflineScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scan: OfflineScan) => {
      const queue = (await get<OfflineScan[]>(SCAN_QUEUE_KEY)) ?? [];
      await set(SCAN_QUEUE_KEY, [...queue, scan]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-scans'] });
      toast.info('Scan queued offline.');
    },
    onError: (error: any) => {
      toast.error('Failed to save offline scan.');
    },
  });
}


export function useFlushOfflineScans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<number> => {
      const queue = (await get<OfflineScan[]>(SCAN_QUEUE_KEY)) ?? [];

      if (!queue.length) return 0;

      for (const scan of queue) {
        await api('/check-in', {
          method: 'POST',
          body: JSON.stringify({ qrPayload: scan.ticketCode }),
        });
      }

      await del(SCAN_QUEUE_KEY);
      return queue.length;
    },
    onSuccess: (flushedCount) => {
      queryClient.invalidateQueries({ queryKey: ['offline-scans'] });
      queryClient.invalidateQueries({ queryKey: ['check-ins'] });
      if (flushedCount > 0) {
        toast.success(`Successfully synced ${flushedCount} offline scan(s)!`);
      }
    },
    onError: (error: any) => {
      const message =
        error instanceof Error ? error.message : 'Failed to sync offline scans';
      toast.error(message);
    },
  });
}
