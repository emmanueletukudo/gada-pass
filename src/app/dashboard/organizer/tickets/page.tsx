'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/mertics-card';
import { toast } from 'sonner';
import { ShieldCheck, ArrowUpRight, Percent } from 'lucide-react';
import Link from 'next/link';

interface TicketManifestSummary {
  totalRevenue: number;
  activeTiersCount: number;
  checkedInCount: number;
  totalIssued: number;
}

export default function OrganizerTicketsAccessPage() {
  const [summary, setSummary] = useState<TicketManifestSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api<TicketManifestSummary>('/organizer/tickets/summary')
      .then(setSummary)
      .catch(() => {
        setSummary({
          totalRevenue: 4800000,
          activeTiersCount: 6,
          checkedInCount: 842,
          totalIssued: 1200,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          Tickets & Access Control
        </h2>
        <p className="text-sm text-[#6d766d]">
          Oversee admission issuance bounds, check-in thresholds, and financial
          processing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          accent="#ff765f"
          metric={
            isLoading
              ? 'Calculating...'
              : `₦${summary?.totalRevenue.toLocaleString()}`
          }
          metricLabel="settled settlement balance"
          title="Revenue Pipeline"
        />
        <MetricCard
          metric={isLoading ? '...' : String(summary?.checkedInCount)}
          metricLabel="verified active admissions"
          title="Gate Clearances"
        />
        <MetricCard
          metric={isLoading ? '...' : String(summary?.activeTiersCount)}
          metricLabel="configured operational tiers"
          title="Ticket Varieties"
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4">
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
            href="/dashboard/organizer/tickets/gate-control"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#17211b] hover:underline"
          >
            <span>Manage Gate Agents</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4">
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
