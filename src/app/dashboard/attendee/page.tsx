'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/mertics-card';
import { EventGraph } from '@/components/dashboard/event-graph';
import { QuickActions } from '@/components/dashboard/quick-action';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  qrPayload?: string;
  status?: string;
  event?: { name?: string };
}

export default function AttendeeDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api<Ticket[]>('/tickets/me')
      .then(setTickets)
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Could not load your tickets';
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const ticketCount = String(tickets.length);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          accent="#d6f94a"
          metric={isLoading ? '...' : ticketCount}
          metricLabel="upcoming tickets"
          title="Live now"
        />

        <MetricCard
          metric={isLoading ? '...' : ticketCount}
          metricLabel="new interactions"
          title="This week"
        />

        <MetricCard
          metric={isLoading ? '...' : ticketCount}
          metricLabel={tickets[0]?.event?.name || 'Explore events'}
          title="Next up"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <EventGraph isGate={false} />
        <QuickActions role="ATTENDEE" />
      </div>
      <section className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
          My tickets
        </p>
        {isLoading ? (
          <p className="mt-4 text-sm text-[#6d766d] animate-pulse">
            Loading passes...
          </p>
        ) : tickets.length === 0 ? (
          <p className="mt-4 text-sm text-[#6d766d]">
            No tickets yet. Explore an event to get started.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-[#dce1d5]">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between py-4 text-sm font-bold"
              >
                <span>{ticket.event?.name || 'Standard Admission Pass'}</span>
                <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-[#17211b]/5 text-[#17211b]">
                  {ticket.status || 'Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
