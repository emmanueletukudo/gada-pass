'use client';

import { ArrowUpRight, Copy, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

interface PublishSuccessModalProps {
  isOpen: boolean;
  eventTitle: string;
  eventSlug: string;
  onClose: () => void;
}

export function PublishSuccessModal({
  isOpen,
  eventTitle,
  eventSlug,
  onClose,
}: PublishSuccessModalProps) {
  if (!isOpen) return null;

  const eventUrl = `${window.location.origin}/events/${eventSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    toast.success('Event link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-[#dce1d5] bg-white p-6 shadow-2xl text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ff765f]">
          <PartyPopper className="h-10 w-10 text-[#17211b]" />
        </div>

        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="display text-md  font-bold text-[#6d766d]">
            Your Event is Live!
          </h3>
          <p className="mt-1 text-md text-[#6d766d]">
            <span className="font-bold text-[#17211b] text-lg">
              {eventTitle}
            </span>{' '}
            has been published successfully.
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-[#f7f7f2] border border-[#dce1d5] p-3 text-md">
          <span className="truncate text-[#17211b] font-medium max-w-55">
            {eventUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 rounded-lg bg-[#17211b] px-3 py-1.5 text-white font-bold hover:bg-[#25332a]"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <a
            href={eventUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#17211b] py-3 text-md font-bold text-white hover:bg-[#25332a]"
          >
            View Live Event <ArrowUpRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => {
              onClose()
              window.location.href = '/dashboard/organizer/events';
            }}
            className="w-full rounded-xl border border-[#dce1d5] bg-white py-3 text-md font-bold text-[#17211b] hover:bg-[#f7f7f2]"
          >
            Go to Organizer Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
