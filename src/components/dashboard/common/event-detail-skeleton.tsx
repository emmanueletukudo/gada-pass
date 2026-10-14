'use client';

export function EventDetailSkeleton() {
  return (
    <div className="space-y-8 mt-10 animate-pulse">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded-full bg-[#e8ede0]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#e8ede0]" />
            </div>
            <div className="h-8 w-32 rounded-xl bg-[#e8ede0]" />
            <div className="h-3 w-28 rounded-full bg-[#e8ede0]" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4 shadow-sm"
          >
            <div className="h-10 w-10 rounded-xl bg-[#e8ede0]" />
            <div className="space-y-2">
              <div className="h-5 w-48 rounded-lg bg-[#e8ede0]" />
              <div className="h-3.5 w-full rounded-md bg-[#e8ede0]" />
              <div className="h-3.5 w-3/4 rounded-md bg-[#e8ede0]" />
            </div>
            <div className="h-4 w-36 rounded-full bg-[#e8ede0] pt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
