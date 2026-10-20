import { useQuery } from '@tanstack/react-query';
import { api } from './useApi';

export interface AdminGlobalStats {
  volumeThisMonth: number;
  eventsPublishedCount: number;
  upcomingFeaturedEventName: string;
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin-metrics-summary'],
    queryFn: async () => {
      try {
        return await api<AdminGlobalStats>('/admin/metrics/summary');
      } catch {
        console.warn(
          'Admin remote endpoints unmapped. Defaulting to local data layers.',
        );
        return null;
      }
    },
  });
}
