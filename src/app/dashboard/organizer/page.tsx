'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/mertics-card';
import { QuickActions } from '@/components/dashboard/quick-action';
import { toast } from 'sonner';
import { OrganizerMetricsSkeleton } from '@/components/dashboard/common/organizer-metrics-skeleton';
import { Calendar, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface OrganizerOverview {
  totalEvents: number;
  activeEvents: number;
  grossRevenue: string;
  totalOrders: number;
  totalTicketsSold: number;
  totalCheckIns: number;
  overallTurnoutRate: number;
  recentEvents: Array<{
    id: string;
    name: string;
    status: string;
    startsAt: string;
    eventType: string;
  }>;
  monthlyRevenueGraph: Array<{
    month: string;
    revenue: number;
    checkIns?: number;
  }>;
}

export default function OrganizerDashboardPage() {
  const [overview, setOverview] = useState<OrganizerOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    api<OrganizerOverview>('/organizer/dashboard/overview')
      .then((data) => {
        setOverview(data);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Could not load organizer overview dashboard';
        toast.error(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const formattedRevenue = overview
    ? `₦${Number(overview.grossRevenue || 0).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : '₦0.00';

  if (isLoading) {
    return <OrganizerMetricsSkeleton />;
  }

  return (
    <div className="space-y-8 mt-10 pb-16">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          accent="#ff765f"
          metric={formattedRevenue}
          metricLabel="accumulated earnings"
          title="Total Gross Revenue"
        />

        <MetricCard
          metric={overview ? overview.totalTicketsSold.toLocaleString() : '0'}
          metricLabel={`${overview?.totalOrders ?? 0} paid orders`}
          title="Tickets Issued"
        />

        <MetricCard
          metric={overview ? overview.totalCheckIns.toLocaleString() : '0'}
          metricLabel={`${overview?.overallTurnoutRate ?? 0}% turnout rate`}
          title="Total Admissions"
        />

        <MetricCard
          metric={String(overview?.totalEvents ?? 0)}
          metricLabel={`${overview?.activeEvents ?? 0} active live events`}
          title="Hosted Experiences"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#dce1d5] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#17211b]">
                Portfolio Revenue Trajectory
              </h3>
              <p className="text-xs text-[#6d766d]">
                Cumulative earnings growth across all hosted events over time
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-[#ff5500]" />
          </div>

          <div className="h-72 w-full pt-2">
            {overview?.monthlyRevenueGraph &&
            overview.monthlyRevenueGraph.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={overview.monthlyRevenueGraph}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#17211b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#17211b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e8ede0"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#6d766d' }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6d766d' }}
                    axisLine={false}
                    tickFormatter={(val) =>
                      `₦${val >= 1000 ? `${val / 1000}k` : val}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17211b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value: any) => [
                      `₦${Number(value).toLocaleString('en-NG')}`,
                      'Gross Revenue',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#17211b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#6d766d]">
                No monthly sales performance recorded yet.
              </div>
            )}
          </div>
        </div>

        <QuickActions role="ORGANIZER" />
      </div>

      {/* Recent Events List */}
      <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#dce1d5] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#17211b]">
              Recent Experiences
            </h3>
            <p className="text-xs text-[#6d766d]">
              Manage specific gate access, ticketing, and event dashboards
            </p>
          </div>
          <Link
            href="/dashboard/organizer/events"
            className="text-xs font-bold uppercase tracking-wider text-[#17211b] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#f7f7f2]">
          {overview?.recentEvents && overview.recentEvents.length > 0 ? (
            overview.recentEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between py-3.5 transition hover:bg-[#f7f7f2]/50 px-2 rounded-xl"
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#17211b]">{evt.name}</p>
                  <div className="flex items-center gap-3 text-xs text-[#6d766d]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(evt.startsAt).toLocaleDateString()}
                    </span>
                    <span>&bull;</span>
                    <span className="uppercase font-semibold">
                      {evt.eventType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      evt.status === 'PUBLISHED'
                        ? 'bg-[#d6f94a] text-[#17211b]'
                        : 'bg-[#f7f7f2] text-[#6d766d] border border-[#dce1d5]'
                    }`}
                  >
                    {evt.status}
                  </span>

                  <Link
                    href={`/dashboard/organizer/events/${evt.id}/dashboard`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#17211b] hover:underline"
                  >
                    <span>Analytics</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#6d766d] py-4">
              No experiences created yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
