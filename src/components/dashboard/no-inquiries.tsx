'use client';

import { MessageSquareOff, RefreshCw, Sparkles } from 'lucide-react';

interface NoInquiriesStateProps {
  isFiltered?: boolean;
  onResetSearch?: () => void;
}

export function NoInquiriesState({
  isFiltered = false,
  onResetSearch,
}: NoInquiriesStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce1d5] bg-[#fffef9]/50 py-12 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17211b]/5 text-[#6d766d]">
          <MessageSquareOff className="h-6 w-6" />
        </div>
        <h4 className="mt-4 text-sm font-bold text-[#17211b]">
          No matching inquiries found
        </h4>
        <p className="mt-1 text-xs text-[#6d766d] max-w-sm">
          We couldn't find any ticket holder requests matching your search term.
          Try resetting your search filter.
        </p>
        {onResetSearch && (
          <button
            onClick={onResetSearch}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#dce1d5] bg-white px-4 py-2 text-xs font-bold text-[#17211b] transition hover:bg-[#17211b]/5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Clear Search</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce1d5] bg-[#fffef9]/50 py-16 px-4 text-center">
      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d6f94a]/20 text-[#17211b]">
          <Sparkles className="h-7 w-7 text-[#17211b]" />
        </div>
      </div>
      <h4 className="mt-4 text-base font-bold text-[#17211b]">
        No guest inquiries yet
      </h4>
      <p className="mt-1.5 max-w-md text-xs text-[#6d766d]">
        When ticket holders request support from their order dashboard, their
        queries and ticket badges will automatically appear here.
      </p>
    </div>
  );
}
