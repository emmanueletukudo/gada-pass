'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Search,
  WifiOff,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17211b]/40 focus-visible:ring-offset-2';

export interface PastEvent {
  id: string;
  name: string;
  venue: string;
  city: string;
  endedAt: string;
  totalSold: number;
  totalCheckedIn: number;
  pendingSyncCount: number;
  status: 'POST_EVENT_SYNC' | 'ARCHIVED';
}

interface PastEventsTabProps {
  events: PastEvent[];
  isLoading?: boolean;
  onExportAuditLog?: (eventId: string) => void;
  onViewAnalytics?: (eventId: string) => void;
}

export function PastEventsTab({
  events = [],
  isLoading = false,
  onExportAuditLog,
  onViewAnalytics,
}: PastEventsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q),
    );
  }, [events, searchQuery]);

  const handleExport = (eventId: string, eventName: string) => {
    toast.info(`Generating audit log for "${eventName}"...`);
    onExportAuditLog?.(eventId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-8 text-center sm:p-12">
        <Calendar className="mx-auto h-12 w-12 text-[#6d766d]" />
        <h3 className="mt-4 text-lg font-bold text-[#17211b]">
          No past events found
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-[#6d766d]">
          Concluded events and historical turnout logs will appear here after
          events end.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past events by name or city..."
            className={`h-11 w-full rounded-full border border-[#dce1d5] bg-[#fffef9] pl-10 pr-4 text-sm text-[#17211b] placeholder-[#6d766d] ${focusRing}`}
          />
        </div>
        <span className="text-xs font-semibold text-[#6d766d]">
          Showing {filteredEvents.length} past event
          {filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5">
        {filteredEvents.map((evt) => {
          const turnOutPct =
            evt.totalSold > 0
              ? Math.min(
                  100,
                  Math.round((evt.totalCheckedIn / evt.totalSold) * 100),
                )
              : 0;

          const isFullySynced = evt.pendingSyncCount === 0;

          return (
            <div
              key={evt.id}
              className="group rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-5 shadow-sm transition hover:border-[#17211b]/30 sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        evt.status === 'ARCHIVED'
                          ? 'bg-[#f0f2ea] text-[#4d564d]'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {evt.status === 'ARCHIVED'
                        ? 'Archived'
                        : 'Post-Event Grace Period'}
                    </span>

                    {isFullySynced ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d6f94a]/40 px-2.5 py-1 text-[11px] font-semibold text-[#17211b]">
                        <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                        Reconciled & Synced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                        <WifiOff className="h-3 w-3 text-amber-600" />
                        {evt.pendingSyncCount} un-synced scan(s) pending
                      </span>
                    )}
                  </div>

                  <h3 className="truncate text-lg font-bold text-[#17211b] sm:text-xl">
                    {evt.name}
                  </h3>
                  <p className="truncate text-sm text-[#6d766d]">
                    {[evt.venue, evt.city].filter(Boolean).join(', ')} · Ended{' '}
                    {new Date(evt.endedAt).toLocaleDateString([], {
                      dateStyle: 'medium',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-4 lg:w-72">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#6d766d]">
                        Turnout
                      </span>
                      <span className="font-bold text-[#17211b]">
                        {turnOutPct}%
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-[#e8ede0]"
                      role="progressbar"
                      aria-valuenow={turnOutPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-[#17211b] transition-all duration-500"
                        style={{ width: `${turnOutPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#6d766d]">
                      <strong className="text-[#17211b]">
                        {evt.totalCheckedIn}
                      </strong>{' '}
                      of {evt.totalSold} tickets checked in
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                  <button
                    type="button"
                    onClick={() => handleExport(evt.id, evt.name)}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#dce1d5] bg-[#f7f7f2] px-4 text-xs font-bold text-[#17211b] transition hover:bg-[#e8ede0] ${focusRing}`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Export Audit Log</span>
                  </button>

                  <Link
                    href={`/dashboard/organizer/events/${evt.id}/analytics`}
                    onClick={() => onViewAnalytics?.(evt.id)}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#17211b] px-4 text-xs font-bold text-white transition hover:bg-[#25332b] ${focusRing}`}
                  >
                    <TrendingUp className="h-4 w-4 text-[#d6f94a]" />
                    <span>View Analytics</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
