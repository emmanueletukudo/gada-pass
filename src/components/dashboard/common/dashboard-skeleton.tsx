'use client';

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#fffef9]">
      {/* <aside className="fixed bottom-0 left-0 top-0 hidden w-64 flex-col justify-between border-r border-[#dce1d5] bg-[#fffef9] p-6 lg:flex animate-pulse z-20">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#dce1d5]" />
            <div className="h-5 w-24 rounded-md bg-[#dce1d5]" />
          </div>

          <div className="space-y-4">
            <div className="h-3 w-28 rounded bg-[#dce1d5]/60" />

            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex h-12 w-full items-center gap-3 rounded-xl bg-[#dce1d5]/40 px-4"
                >
                  <div className="h-5 w-5 rounded-md bg-[#dce1d5]/70" />
                  <div className="h-3 w-28 rounded bg-[#dce1d5]/70" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#dce1d5] pt-4 space-y-4">
          <div className="px-4 space-y-2">
            <div className="h-4 w-32 rounded bg-[#dce1d5]/70" />
            <div className="h-3 w-40 rounded bg-[#dce1d5]/50" />
          </div>

          <div className="h-12 w-full rounded-xl border border-[#dce1d5] bg-[#dce1d5]/30" />
        </div>
      </aside> */}

      <main className="w-full lg:pl-64">
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
      </main>
    </div>
  );
}
