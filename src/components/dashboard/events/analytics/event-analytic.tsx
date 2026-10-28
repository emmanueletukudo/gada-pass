'use client';

import { useMemo } from 'react';
import {
  Users,
  Wifi,
  WifiOff,
  ArrowLeft,
  Download,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { EventAnalyticsData } from '@/lib/types';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17211b]/40 focus-visible:ring-offset-2';


interface EventAnalyticsPageProps {
  analytics: EventAnalyticsData;
  onBack?: () => void;
  onExportCsv?: (eventId: string) => void;
}

export default function EventAnalyticsPage({
  analytics,
  onBack,
  onExportCsv,
}: EventAnalyticsPageProps) {
  const turnoutPct = useMemo(() => {
    if (!analytics.totalSold || analytics.totalSold === 0) return 0;
    return Math.min(
      100,
      Math.round((analytics.totalCheckedIn / analytics.totalSold) * 100),
    );
  }, [analytics]);

  const maxHourlyCount = useMemo(() => {
    return Math.max(...analytics.turnoutHourly.map((h) => h.scanCount), 1);
  }, [analytics]);

  const handleExport = () => {
    toast.info(`Downloading audit log for "${analytics.eventName}"...`);
    onExportCsv?.(analytics.eventId);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3 py-3 sm:space-y-6 sm:px-4 sm:py-6 lg:px-0">
      <section className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back to past events"
                className={`grid h-10 w-10 place-items-center rounded-full border border-[#dce1d5] bg-[#f7f7f2] text-[#17211b] transition hover:bg-[#e8ede0] ${focusRing}`}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#f0f2ea] px-2.5 py-0.5 text-[11px] font-semibold text-[#4d564d]">
                  Analytics & Audit Report
                </span>
                {analytics.pendingSyncCount === 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d6f94a]/40 px-2.5 py-0.5 text-[11px] font-semibold text-[#17211b]">
                    <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                    All Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                    <WifiOff className="h-3 w-3 text-amber-600" />
                    {analytics.pendingSyncCount} pending syncs
                  </span>
                )}
              </div>
              <h1 className="mt-1 text-xl font-bold text-[#17211b] sm:text-2xl">
                {analytics.eventName}
              </h1>
              <p className="text-xs text-[#6d766d]">
                {[analytics.venue, analytics.city].filter(Boolean).join(', ')} ·{' '}
                {new Date(analytics.startedAt).toLocaleDateString([], {
                  dateStyle: 'medium',
                })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#17211b] px-5 text-sm font-semibold text-white transition hover:bg-[#25332b] ${focusRing}`}
          >
            <Download className="h-4 w-4 text-[#d6f94a]" />
            <span>Export Detailed Audit Log</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#6d766d]">
            <span className="text-xs font-semibold">Total Turnout</span>
            <Users className="h-4 w-4 text-[#17211b]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#17211b] sm:text-3xl">
            {analytics.totalCheckedIn}
            <span className="ml-1 text-xs font-normal text-[#6d766d]">
              / {analytics.totalSold}
            </span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8ede0]">
              <div
                className="h-full bg-[#17211b]"
                style={{ width: `${turnoutPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#17211b]">
              {turnoutPct}%
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#6d766d]">
            <span className="text-xs font-semibold">Live Scans</span>
            <Wifi className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#17211b] sm:text-3xl">
            {analytics.onlineScansCount}
          </p>
          <p className="mt-1 text-xs text-[#6d766d]">
            Instant server check-ins
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#6d766d]">
            <span className="text-xs font-semibold">Offline Scans</span>
            <WifiOff className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#17211b] sm:text-3xl">
            {analytics.offlineScansCount}
          </p>
          <p className="mt-1 text-xs text-[#6d766d]">Reconciled post-event</p>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#6d766d]">
            <span className="text-xs font-semibold">Active Agents</span>
            <ShieldCheck className="h-4 w-4 text-[#17211b]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#17211b] sm:text-3xl">
            {analytics.agentBreakdown.length}
          </p>
          <p className="mt-1 text-xs text-[#6d766d]">Gate operators logged</p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#17211b]" />
            <h2 className="text-base font-bold text-[#17211b]">
              Check-in Density by Hour
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#6d766d]">
            Peak entry tracking
          </span>
        </div>

        <div className="flex h-48 items-end gap-2 border-b border-[#dce1d5] pb-2 pt-6 sm:gap-4">
          {analytics.turnoutHourly.map((h, i) => {
            const barHeightPct = Math.round(
              (h.scanCount / maxHourlyCount) * 100,
            );
            return (
              <div
                key={i}
                className="group relative flex flex-1 flex-col items-center h-full justify-end"
              >
                <div className="absolute -top-8 hidden rounded-lg bg-[#17211b] px-2 py-1 text-[10px] font-bold text-white group-hover:block">
                  {h.scanCount} scans
                </div>
                <div
                  className="w-full rounded-t-lg bg-[#17211b] transition-all hover:bg-[#d6f94a]"
                  style={{ height: `${barHeightPct}%` }}
                />
                <span className="mt-2 truncate text-[10px] font-semibold text-[#6d766d]">
                  {h.hourLabel}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold text-[#17211b] pb-3 border-b border-[#dce1d5]">
            Attendance by Ticket Tier
          </h2>
          <div className="mt-3 divide-y divide-[#dce1d5]">
            {analytics.tierBreakdown.map((t, idx) => {
              const tierPct =
                t.totalSold > 0
                  ? Math.round((t.checkedIn / t.totalSold) * 100)
                  : 0;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-[#17211b]">
                      {t.tierName}
                    </p>
                    <p className="text-xs text-[#6d766d]">
                      {t.checkedIn} checked in of {t.totalSold} sold
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#17211b]">
                      {tierPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gate Agent Throughput */}
        <section className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold text-[#17211b] pb-3 border-b border-[#dce1d5]">
            Gate Agent Scans & Offline Syncs
          </h2>
          <div className="mt-3 divide-y divide-[#dce1d5]">
            {analytics.agentBreakdown.map((agent, idx) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold text-[#17211b]">
                    {agent.agentName}
                  </p>
                  <p className="text-xs text-[#6d766d]">
                    {agent.offlineScans} scans queued offline
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#17211b]">
                    {agent.totalScans} total scans
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
