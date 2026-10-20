'use client';

import { MetricCard } from '@/components/dashboard/mertics-card';
import { EventGraph } from '@/components/dashboard/event-graph';
import { QuickActions } from '@/components/dashboard/quick-action';
import { useAdminMetrics } from '@/lib/hooks-new/useAdminMetrics';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminMetrics();

  const monthlyVolume = stats
    ? `₦${stats.volumeThisMonth.toLocaleString()}`
    : '₦128m';

  const itemsPublished = stats ? String(stats.eventsPublishedCount) : '24';

  const nextUpLabel =
    stats?.upcomingFeaturedEventName || 'The Good Life Brunch';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          Platform Command System
        </h2>
        <p className="text-sm text-[#6d766d]">
          Review transactional volumes, network status, and operational audits.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          accent="#d6f94a"
          metric={isLoading ? 'Loading...' : monthlyVolume}
          metricLabel="volume this month"
          title="Live now"
        />

        <MetricCard
          metric={isLoading ? '...' : itemsPublished}
          metricLabel="events published"
          title="This week"
        />

        <MetricCard metric="Sat 18" metricLabel={nextUpLabel} title="Next up" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <EventGraph isGate={false} />
        <QuickActions role="ADMIN" />
      </div>
    </div>
  );
}
