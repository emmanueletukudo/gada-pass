'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Plus, Calendar, Ticket, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { OrganizerEventsSkeleton } from '@/components/dashboard/common/organizer-events-skeleton';

interface TicketTier {
  quantity: number;
  soldCount: number;
}

interface OrganizerEvent {
  id: string;
  name: string;
  startsAt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'PAST';
  ticketTiers?: TicketTier[];
}

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api<OrganizerEvent[]>('/organizer/events')
      .then(setEvents)
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Could not load your events';
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 mt-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Events Studio</h2>
          <p className="text-sm text-[#6d766d]">
            Create, update, and monitor your event performance.
          </p>
        </div>
        <Link
          href="/dashboard/organizer/events/create"
          className="inline-flex items-center gap-2 rounded-full bg-[#17211b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#25332b]"
        >
          <Plus className="h-4 w-4" />
          <span>Create new event</span>
        </Link>
      </div>

      {isLoading ? (
        <OrganizerEventsSkeleton />
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-12 text-center space-y-4">
          <Calendar className="mx-auto h-10 w-10 text-black" />
          <p className="text-sm font-medium text-[#6d766d]">
            You haven't scheduled any experiences yet.
          </p>
          <Link
            href="/dashboard/organizer/events/create"
            className="inline-block rounded-full border border-[#17211b] px-4 py-2 text-xs font-bold text-[#17211b] hover:bg-[#17211b]/5"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const totalCapacity =
              event.ticketTiers?.reduce(
                (acc, curr) => acc + curr.quantity,
                0,
              ) || 0;
            const totalSoldCount =
              event.ticketTiers?.reduce(
                (acc, curr) => acc + curr.soldCount,
                0,
              ) || 0;
            const progressPercentage =
              totalCapacity > 0 ? (totalSoldCount / totalCapacity) * 100 : 0;

            return (
              <div
                key={event.id}
                className="flex flex-col justify-between gap-6 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 transition hover:border-[#17211b] md:flex-row md:items-center"
              >
                <div className="space-y-2 max-w-md">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      event.status === 'PUBLISHED'
                        ? 'bg-[#d6f94a]/30 text-[#17211b]'
                        : 'bg-[#dce1d5] text-[#6d766d]'
                    }`}
                  >
                    {event.status || 'DRAFT'}
                  </span>
                  <h3 className="text-base font-bold text-[#17211b]">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-semibold text-[#6d766d]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.startsAt as string).toLocaleString(
                        'en-NG',
                        {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        },
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ticket className="h-3 w-3" />
                      {totalSoldCount} / {totalCapacity} Sold
                    </span>
                  </div>
                </div>

                <div className="flex w-full items-center gap-4 md:max-w-xs">
                  <div className="w-full space-y-1">
                    <div className="h-2 w-full rounded-full bg-[#17211b]/5 overflow-hidden">
                      <div
                        className="h-full bg-[#ff765f] transition-all duration-300"
                        style={{
                          width: `${Math.min(progressPercentage, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-right text-[10px] font-bold text-[#6d766d]">
                      {progressPercentage.toFixed(0)}% Capacity Fill
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/organizer/events/${event.id}`}
                    className="rounded-xl border border-[#dce1d5] p-3 text-[#17211b] hover:border-[#17211b] hover:bg-[#17211b]/5"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
