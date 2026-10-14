export function AgentScannerSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-8 px-3 sm:px-0 animate-pulse">
      <div className="flex flex-col gap-4 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-[#e8ede0] rounded-full" />
            <div className="h-6 w-64 bg-[#e8ede0] rounded-lg" />
            <div className="h-3 w-40 bg-[#e8ede0] rounded-md" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-11 w-32 bg-[#e8ede0] rounded-full" />
            <div className="h-11 w-48 bg-[#e8ede0] rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 sm:p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-[#e8ede0] rounded-full" />
              <div className="h-4 w-4 bg-[#e8ede0] rounded-full" />
            </div>
            <div className="h-7 w-16 bg-[#e8ede0] rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-3 w-36 bg-[#e8ede0] rounded-full" />
            <div className="h-6 w-20 bg-[#e8ede0] rounded-full" />
          </div>
          <div className="rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] h-70 flex items-center justify-center">
            <div className="h-10 w-10 bg-[#e8ede0] rounded-full animate-bounce" />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 sm:p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-32 bg-[#e8ede0] rounded-full" />
              <div className="h-12 w-full bg-[#e8ede0] rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-36 bg-[#e8ede0] rounded-full" />
              <div className="h-16 w-full bg-[#e8ede0] rounded-2xl" />
            </div>
          </div>
          <div className="border-t border-[#dce1d5] pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-36 bg-[#e8ede0] rounded-full" />
              <div className="h-6 w-6 bg-[#e8ede0] rounded-full" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-12 w-full bg-[#f7f7f2] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
