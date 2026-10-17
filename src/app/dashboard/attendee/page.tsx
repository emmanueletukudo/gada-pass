'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/mertics-card';
import { EventGraph } from '@/components/dashboard/event-graph';
import { QuickActions } from '@/components/dashboard/quick-action';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  qrPayload?: string;
  status?: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  createdAt?: string;
  event?: {
    id?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
  };
}

function AttendeeDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm"
          >
            <div className="h-3 w-20 rounded bg-[#e8ebe3] mb-4" />
            <div className="h-8 w-16 rounded bg-[#f0f3eb] mb-2" />
            <div className="h-3 w-28 rounded bg-[#f0f3eb]" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-[350px] rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm" />
        <div className="h-[350px] rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm" />
      </div>
    </div>
  );
}

export default function AttendeeDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api<Ticket[]>('/tickets/my-tickets')
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Could not load your tickets';
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Compute metrics from real ticket data
  const metrics = useMemo(() => {
    const activeTickets = tickets.filter(
      (t) => t.status !== 'USED' && t.status !== 'CANCELLED',
    );
    const usedTickets = tickets.filter((t) => t.status === 'USED');

    // Find the next upcoming event based on event startDate or active ticket list
    const sortedUpcoming = [...activeTickets].sort((a, b) => {
      const dateA = a.event?.startDate
        ? new Date(a.event.startDate).getTime()
        : 0;
      const dateB = b.event?.startDate
        ? new Date(b.event.startDate).getTime()
        : 0;
      return dateA - dateB;
    });

    const nextEventName = sortedUpcoming[0]?.event?.name || 'Explore events';

    return {
      upcomingCount: String(activeTickets.length),
      usedCount: String(usedTickets.length),
      totalCount: String(tickets.length),
      nextEventName,
    };
  }, [tickets]);

  // Transform ticket creation dates into monthly activity trend points for EventGraph
  const chartData = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const currentYear = new Date().getFullYear();
    const monthlyCounts: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${months[d.getMonth()]}`;
      monthlyCounts[label] = 0;
    }

    tickets.forEach((ticket) => {
      if (ticket.createdAt) {
        const date = new Date(ticket.createdAt);
        const label = months[date.getMonth()];
        if (label in monthlyCounts) {
          monthlyCounts[label] += 1;
        }
      }
    });

    return Object.entries(monthlyCounts).map(([month, passes]) => ({
      name: month,
      passes,
    }));
  }, [tickets]);

  if (isLoading) {
    return <AttendeeDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          accent="#d6f94a"
          metric={metrics.upcomingCount}
          metricLabel="active passes"
          title="Upcoming Events"
        />

        <MetricCard
          metric={metrics.usedCount}
          metricLabel="completed pass check-ins"
          title="Attended Events"
        />

        <MetricCard
          metric={metrics.totalCount}
          metricLabel={metrics.nextEventName}
          title="Next Up"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <EventGraph isGate={false} data={chartData} />
        <QuickActions role="ATTENDEE" />
      </div>
    </div>
  );
}
