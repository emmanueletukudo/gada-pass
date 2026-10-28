'use client';

import EventAnalyticsPage from '@/components/dashboard/events/analytics/event-analytic';
import {
  useEventAnalytics,
  useExportEventAuditLog,
} from '@/lib/hooks-new/useEventAnalitics';
import { use } from 'react';

function AnalyticsSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-4 px-3 py-3 sm:space-y-6 sm:px-4 sm:py-6 lg:px-0 animate-pulse"
      aria-busy="true"
    >
      <div className="rounded-3xl border border-[#dce1d5] bg-[#e8ede0] p-6 h-28" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#dce1d5] bg-[#e8ede0] p-4 h-28"
          />
        ))}
      </div>
      <div className="rounded-3xl border border-[#dce1d5] bg-[#e8ede0] p-6 h-64" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#dce1d5] bg-[#e8ede0] p-6 h-60" />
        <div className="rounded-3xl border border-[#dce1d5] bg-[#e8ede0] p-6 h-60" />
      </div>
    </div>
  );
}

interface EventAnalyticsRouteProps {
  params: Promise<{ eventId: string }>;
}


export default function EventAnalyticsRoute({ params }: EventAnalyticsRouteProps) {
   const { eventId } = use(params);

  const { data: analytics, isLoading, error } = useEventAnalytics(eventId);
  const exportMutation = useExportEventAuditLog();
  console.log('error', error);

  console.log('analytics', analytics);
  const handleExportCsv = (eventId: string) => {
    exportMutation.mutate(eventId);
  };

  if (isLoading || !analytics) {
    return <AnalyticsSkeleton />;
  }

  return (
    <EventAnalyticsPage
      analytics={analytics}
      onBack={() => window.history.back()}
      onExportCsv={handleExportCsv}
    />
  );
}
