import { useMutation, useQuery } from "@tanstack/react-query";
import { EventAnalyticsData } from "../types";
import { toast } from "sonner";
import { api } from "./api";

export function useEventAnalytics(eventId: string) {
  return useQuery({
    queryKey: ['event-analytics', eventId],
    queryFn: async () => {
      return api<EventAnalyticsData>(`/organizer/events/${eventId}/analytics`);
    },
    enabled: Boolean(eventId),
  });
}

export function useExportEventAuditLog() {
  return useMutation({
    mutationFn: async (eventId: string) => {
      const blob = await api<Blob>(
        `/organizer/events/${eventId}/export-audit`,
        {
          method: 'GET',
          responseType: 'blob',
        },
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-event-${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return eventId;
    },
    onSuccess: () => {
      toast.success('Audit log downloaded successfully!');
    },
    onError: (error: any) => {
      const message =
        error instanceof Error ? error.message : 'Failed to download audit log';
      toast.error(message);
    },
  });
}
