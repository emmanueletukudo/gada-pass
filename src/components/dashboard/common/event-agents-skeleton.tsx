'use client';

export function EventAgentsSkeleton() {
  return (
    <div className="space-y-6 mt-10 animate-pulse">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center pb-4 border-b border-[#dce1d5]">
        <div className="space-y-2">
          <div className="h-5 w-48 rounded-lg bg-[#e8ede0]" />
          <div className="h-3.5 w-72 rounded-full bg-[#e8ede0]" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-xl bg-[#e8ede0]" />
          <div className="h-10 w-32 rounded-full bg-[#e8ede0]" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 space-y-2 shadow-sm"
          >
            <div className="h-3 w-24 rounded-full bg-[#e8ede0]" />
            <div className="h-6 w-28 rounded-xl bg-[#e8ede0]" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4 shadow-sm">
        <div className="h-4 w-40 rounded-full bg-[#e8ede0]" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="flex items-center justify-between py-2">
              <div className="h-4 w-36 rounded-md bg-[#e8ede0]" />
              <div className="h-4 w-48 rounded-md bg-[#e8ede0]" />
              <div className="h-4 w-24 rounded-md bg-[#e8ede0]" />
              <div className="h-5 w-16 rounded-full bg-[#e8ede0]" />
              <div className="h-7 w-24 rounded-lg bg-[#e8ede0]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
