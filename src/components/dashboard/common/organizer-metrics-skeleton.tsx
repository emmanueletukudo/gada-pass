'use client';

export function OrganizerMetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 rounded-full bg-[#e8ede0]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#e8ede0]" />
          </div>
          <div className="h-8 w-32 rounded-xl bg-[#e8ede0]" />
          <div className="h-3 w-24 rounded-full bg-[#e8ede0]" />
        </div>
      ))}
    </div>
  );
}
