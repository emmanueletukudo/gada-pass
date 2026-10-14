'use client';

export function MessagingHubSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">

      <div className="divide-y divide-[#dce1d5]">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="my-2.5 flex flex-col justify-between gap-4 rounded-xl px-2 py-5 sm:flex-row sm:items-center"
          >
   
            <div className="max-w-xl space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-4 w-32 rounded-md bg-[#e8ede0]" />
                <div className="h-5 w-28 rounded-md bg-[#e8ede0]" />
                <div className="h-5 w-24 rounded-md bg-[#e8ede0]" />
                <div className="h-4 w-14 rounded-full bg-[#e8ede0]" />
              </div>
              <div className="h-4 w-full sm:w-3/4 rounded-md bg-[#e8ede0]" />
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end shrink-0">
              <div className="h-9 w-28 rounded-xl bg-[#e8ede0]" />
              <div className="h-9 w-36 rounded-xl bg-[#e8ede0]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
