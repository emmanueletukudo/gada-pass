'use client';

export function OrganizerEventsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="flex flex-col justify-between gap-6 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 md:flex-row md:items-center shadow-sm"
        >
          <div className="space-y-3 max-w-md w-full">
            <div className="h-4 w-20 rounded-full bg-[#e8ede0]" />
            <div className="h-6 w-3/4 rounded-xl bg-[#e8ede0]" />
            <div className="flex items-center gap-4 pt-1">
              <div className="h-3.5 w-36 rounded-full bg-[#e8ede0]" />
              <div className="h-3.5 w-24 rounded-full bg-[#e8ede0]" />
            </div>
          </div>

          <div className="flex w-full items-center gap-4 md:max-w-xs">
            <div className="w-full space-y-2">
              <div className="h-2 w-full rounded-full bg-[#e8ede0]" />
              <div className="ml-auto h-2.5 w-16 rounded-full bg-[#e8ede0]" />
            </div>
            <div className="h-10 w-10 shrink-0 rounded-xl border border-[#dce1d5] bg-[#e8ede0]" />
          </div>
        </div>
      ))}
    </div>
  );
}
