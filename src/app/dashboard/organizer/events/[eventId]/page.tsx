'use client';

import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/mertics-card';
import { toast } from 'sonner';
import { ShieldCheck, ArrowUpRight, Percent } from 'lucide-react';
import Link from 'next/link';
import { EventDetailSkeleton } from '@/components/dashboard/common/event-detail-skeleton';

interface TicketManifestSummary {
  revenue: number;
  ticketTierCount: number;
  checkedIn: number;
  totalIssued: number;
}

interface EditEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default function OrganizerTicketsAccessPage({
  params,
}: EditEventPageProps) {
  const [summary, setSummary] = useState<TicketManifestSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { eventId } = use(params);

  useEffect(() => {
    setIsLoading(true);
    api<TicketManifestSummary>(`/organizer/events/${eventId}/dashboard`, {
      method: 'GET',
    })
      .then((data) => {
        setSummary({
          revenue: data.revenue ?? 0,
          ticketTierCount: data.ticketTierCount ?? 0,
          checkedIn: data.checkedIn ?? 0,
          totalIssued: 1200,
        });
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'Failed to load event data';
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const formattedRevenue = summary
    ? `₦${Number(summary.revenue).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : '₦0.00';

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  return (
    <div className="space-y-8 mt-10">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          accent="#ff765f"
          metric={formattedRevenue}
          metricLabel="settled settlement balance"
          title="Revenue Pipeline"
        />
        <MetricCard
          metric={String(summary?.checkedIn ?? 0)}
          metricLabel="verified active admissions"
          title="Gate Clearances"
        />
        <MetricCard
          metric={String(summary?.ticketTierCount ?? 0)}
          metricLabel="configured operational tiers"
          title="Ticket Varieties"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff765f]/10 text-[#ff765f]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17211b]">
              Gate Access Assignments
            </h3>
            <p className="mt-1 text-sm text-[#6d766d]">
              Provision credentials or parse validation payloads to sync device
              registers.
            </p>
          </div>
          <Link
            href={`/dashboard/organizer/events/${eventId}/agents`}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#17211b] hover:underline"
          >
            <span>Manage Gate Agents</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6f94a] text-[#17211b]">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17211b]">
              Discounts & Campaign Codes
            </h3>
            <p className="mt-1 text-sm text-[#6d766d]">
              Configure systemic markdown codes, early access overrides, or
              promotional limits.
            </p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#17211b] hover:underline">
            <span>Configure Code Sets</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
