'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/mertics-card';
import { EventGraph } from '@/components/dashboard/event-graph';
import { QuickActions } from '@/components/dashboard/quick-action';
import { toast } from 'sonner';
import { OrganizerMetricsSkeleton } from '@/components/dashboard/common/organizer-metrics-skeleton';

interface OrganizerStats {
  revenue: string;
  orders: number;
  attendees: number;
  checkedIn: number;
  capacity?: number | null;
}

interface OrganizerEvent {
  id: string;
  name: string;
  ticketTiers?: Array<{ quantity: number; soldCount: number }>;
}

export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    api<OrganizerEvent[]>('/organizer/events')
      .then((items) => {
        setEvents(items);
        const firstEvent = items[0];

        if (firstEvent) {
          return api<OrganizerStats>(
            `/organizer/events/${firstEvent.id}/dashboard`,
          )
            .then(setStats)
            .catch(() => {
              toast.error('Failed to load real-time metrics.');
            });
        }
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Could not load organizer dashboard';
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const formattedRevenue = stats
    ? `₦${Number(stats.revenue || 0).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : '₦0.00';

  return (
    <div className="space-y-8 mt-10">
      {isLoading ? (
        <OrganizerMetricsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            accent="#ff765f"
            metric={formattedRevenue}
            metricLabel="gross revenue"
            title="Live now"
          />

          <MetricCard
            metric={stats ? stats.attendees.toLocaleString() : '0'}
            metricLabel="new interactions"
            title="This week"
          />

          <MetricCard
            metric={String(events.length)}
            metricLabel={events[0]?.name || 'No active events'}
            title="Next up"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <EventGraph isGate={false} />
        <QuickActions role="ORGANIZER" />
      </div>
    </div>
  );
}
