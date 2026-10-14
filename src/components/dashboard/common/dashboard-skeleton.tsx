'use client';

export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6 md:p-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded-full bg-[#e8ede0]" />
          <div className="h-6 w-48 rounded-xl bg-[#e8ede0]" />
          <div className="h-3 w-36 rounded-full bg-[#e8ede0]" />
        </div>
        <div className="h-10 w-36 rounded-full bg-[#e8ede0]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded-full bg-[#e8ede0]" />
              <div className="h-4 w-4 rounded-full bg-[#e8ede0]" />
            </div>
            <div className="h-8 w-20 rounded-xl bg-[#e8ede0]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4">
          <div className="h-4 w-32 rounded-full bg-[#e8ede0]" />
          <div className="h-64 w-full rounded-2xl bg-[#e8ede0]" />
        </div>

        <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4">
          <div className="h-4 w-32 rounded-full bg-[#e8ede0]" />
          <div className="h-12 w-full rounded-full bg-[#e8ede0]" />
          <div className="h-32 w-full rounded-2xl bg-[#e8ede0]" />
        </div>
      </div>
    </div>
  );
}
