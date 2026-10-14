'use client';

export function SettingsSkeleton() {
  return (
    <div className="max-w-2xl space-y-8 mt-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-48 rounded-lg bg-[#e8ede0]" />
        <div className="h-4 w-64 rounded-full bg-[#e8ede0]" />
      </div>

      <div className="space-y-6 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
        <div className="h-4 w-36 rounded-full bg-[#e8ede0]" />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-[#e8ede0]" />
            <div className="h-12 w-full rounded-2xl bg-[#e8ede0]" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-[#e8ede0]" />
            <div className="h-12 w-full rounded-2xl bg-[#e8ede0]" />
          </div>
        </div>

        <div className="pt-4 border-t border-[#dce1d5] flex justify-end">
          <div className="h-11 w-36 rounded-full bg-[#e8ede0]" />
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
        <div className="h-4 w-44 rounded-full bg-[#e8ede0]" />
        <div className="h-20 w-full rounded-2xl bg-[#e8ede0]" />
      </div>
    </div>
  );
}
