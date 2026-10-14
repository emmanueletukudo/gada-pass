'use client';

export function EditEventSkeleton() {
  return (
    <div className="mx-auto mt-6 px-4 pb-16 animate-pulse">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#dce1d5] pb-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="h-6 w-56 rounded-lg bg-[#e8ede0]" />
          <div className="h-4 w-80 rounded-full bg-[#e8ede0]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 rounded-full bg-[#e8ede0]" />
          <div className="h-10 w-32 rounded-full bg-[#e8ede0]" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#e8ede0]" />
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-8 space-y-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded-full bg-[#e8ede0]" />
          <div className="h-12 w-full rounded-2xl bg-[#e8ede0]" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-full bg-[#e8ede0]" />
          <div className="h-32 w-full rounded-2xl bg-[#e8ede0]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-12 w-full rounded-2xl bg-[#e8ede0]" />
          <div className="h-12 w-full rounded-2xl bg-[#e8ede0]" />
        </div>
      </div>
    </div>
  );
}
