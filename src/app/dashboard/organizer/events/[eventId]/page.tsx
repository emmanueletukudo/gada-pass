'use client';

import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/mertics-card';
import { toast } from 'sonner';
import {
  ShieldCheck,
  ArrowUpRight,
  Percent,
  Users,
  Ticket,
  TrendingUp,
  QrCode,
  Clock,
  Calendar,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { EventDetailSkeleton } from '@/components/dashboard/common/event-detail-skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DashboardData {
  eventId: string;
  eventName: string;
  eventType: string;
  startsAt: string;
  endsAt: string;
  orders: number;
  attendees: number;
  checkedIn: number;
  checkInRatePercentage: number;
  ticketTierCount: number;
  revenue: string | number;
  capacity: number | null;
  tierBreakdown: Array<{
    tierId: string;
    name: string;
    price: string;
    currency: string;
    quantityAllocated: number;
    soldCount: number;
    checkedInCount: number;
    isMultiDay: boolean;
    revenueGenerated: string;
    occupancyRate: number;
  }>;
  dailyFootTraffic: Array<{
    date: string;
    totalScans: number;
    uniqueAttendees: number;
  }>;
  hourlyVelocity: Array<{
    hour: string;
    scanCount: number;
  }>;
  agentPerformance: Array<{
    operatorId: string;
    operatorName: string;
    scansProcessed: number;
  }>;
}

interface EditEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default function OrganizerTicketsAccessPage({
  params,
}: EditEventPageProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { eventId } = use(params);

  useEffect(() => {
    setIsLoading(true);
    api<DashboardData>(`/organizer/events/${eventId}/dashboard`, {
      method: 'GET',
    })
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'Failed to load event data';
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const formattedRevenue = data
    ? `₦${Number(data.revenue).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : '₦0.00';

  if (isLoading || !data) {
    return <EventDetailSkeleton />;
  }

  return (
    <div className="space-y-8 mt-10 pb-16">
      {/* Top Metric Cards Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          accent="#ff765f"
          metric={formattedRevenue}
          metricLabel="settled revenue pipeline"
          title="Gross Revenue"
        />
        <MetricCard
          metric={String(data.checkedIn ?? 0)}
          metricLabel={`Verified of ${data.attendees} tickets sold`}
          title="Gate Clearances"
        />
        <MetricCard
          metric={`${data.checkInRatePercentage ?? 0}%`}
          metricLabel="overall turnout rate"
          title="Turnout Rate"
        />
        <MetricCard
          metric={String(data.ticketTierCount ?? 0)}
          metricLabel="configured operational tiers"
          title="Ticket Varieties"
        />
      </div>

      {/* Visualizations Section: Daily Foot Traffic & Hourly Velocity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Foot Traffic Chart */}
        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#17211b]">
                Daily Foot-Traffic & Re-Entry
              </h3>
              <p className="text-xs text-[#6d766d]">
                Total gate scans vs. unique attendee entries per day
              </p>
            </div>
            <Users className="h-5 w-5 text-[#6d766d]" />
          </div>

          <div className="h-72 w-full">
            {data.dailyFootTraffic?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.dailyFootTraffic}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e8ede0"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#6d766d' }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6d766d' }}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17211b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar
                    dataKey="totalScans"
                    name="Total Gate Scans"
                    fill="#17211b"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="uniqueAttendees"
                    name="Unique Attendees"
                    fill="#ff5500"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#6d766d]">
                No check-in scan data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Hourly Check-In Velocity Chart */}
        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#17211b]">
                Hourly Peak Check-In Velocity
              </h3>
              <p className="text-xs text-[#6d766d]">
                Scan frequency distribution to identify door throughput
              </p>
            </div>
            <Clock className="h-5 w-5 text-[#6d766d]" />
          </div>

          <div className="h-72 w-full">
            {data.hourlyVelocity?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.hourlyVelocity}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e8ede0"
                  />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: '#6d766d' }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6d766d' }}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17211b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scanCount"
                    name="Scans / Hour"
                    stroke="#17211b"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#d6f94a' }}
                    activeDot={{ r: 6, fill: '#ff5500' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#6d766d]">
                No hourly scan data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier Performance & Gate Operator Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tier Breakdown Table */}
        <div className="lg:col-span-2 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#17211b] mb-4">
            Ticket Tier Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#dce1d5] text-[#6d766d] uppercase font-bold text-[10px]">
                <tr>
                  <th className="pb-3">Tier Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Sales</th>
                  <th className="pb-3">Checked In</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7f7f2]">
                {data.tierBreakdown?.map((tier, idx) => (
                  <tr key={idx} className="hover:bg-[#f7f7f2]/50">
                    <td className="py-3 font-bold text-[#17211b]">
                      {tier.name}
                    </td>
                    <td className="py-3">
                      {tier.isMultiDay ? (
                        <span className="rounded-full bg-[#d6f94a] px-2 py-0.5 text-[9px] font-extrabold text-[#17211b]">
                          Multi-Day
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#f7f7f2] border border-[#dce1d5] px-2 py-0.5 text-[9px] font-bold text-[#6d766d]">
                          Single Day
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-medium">
                      {tier.soldCount} / {tier.quantityAllocated} (
                      {tier.occupancyRate}%)
                    </td>
                    <td className="py-3 font-medium text-[#ff5500]">
                      {tier.checkedInCount}
                    </td>
                    <td className="py-3 text-right font-bold text-[#17211b]">
                      ₦{Number(tier.revenueGenerated).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gate Agent Performance */}
        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#17211b] mb-4">
            Terminal Throughput
          </h3>
          <div className="space-y-4">
            {data.agentPerformance?.length > 0 ? (
              data.agentPerformance.map((agent, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-[#f7f7f2] pb-3"
                >
                  <div>
                    <p className="text-xs font-bold text-[#17211b]">
                      {agent.operatorName}
                    </p>
                    <p className="text-[10px] text-[#6d766d]">Gate Terminal</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-lg bg-[#17211b] px-2.5 py-1 text-xs font-bold text-white">
                      {agent.scansProcessed} scans
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#6d766d]">
                No operator activity logged yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Cards Row */}
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
