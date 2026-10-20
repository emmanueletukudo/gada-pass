'use client';

import {
  Calendar,
  Landmark,
  ShieldCheck,
  Sparkles,
  Ticket,
  Video,
  Key,
  Link2,
} from 'lucide-react';
import { EventFormDataPreview } from './types';
import { formatVirtualPlatform } from '@/utils/helpers';

interface EventSummaryGridProps {
  formData: EventFormDataPreview;
  onEditSection: (stepIndex: number) => void;
}

export function EventSummaryGrid({
  formData,
  onEditSection,
}: EventSummaryGridProps) {
  const isOnline =
    formData.locationType === 'ONLINE' || formData.eventType === 'ONLINE_EVENT';
  const isFree = formData.eventType === 'FREE_EVENT';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dce1d5] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-[#dce1d5] pb-3">
          <h4 className="font-bold text-sm text-[#17211b] flex items-center gap-2">
            <Link2 className="h-4 w-4 text-[#ff5500]" /> Vanity URL & Event Type
          </h4>
          <button
            type="button"
            onClick={() => onEditSection(2)}
            className="text-xs font-bold text-[#17211b] hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-[#6d766d]">Event Type</p>
            <p className="font-semibold text-[#17211b] mt-0.5 uppercase tracking-wide">
              {formData.eventType
                ? formData.eventType.replace(/_/g, ' ')
                : 'Standard Event'}
            </p>
          </div>

          <div>
            <p className="font-bold text-[#6d766d]">Public Link Slug</p>
            <p className="font-semibold text-[#17211b] mt-0.5 truncate">
              {`${window.location.origin}/events/`}
              <span className="text-[#ff5500]">
                {formData.slug || 'untitled'}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-[#dce1d5] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-[#dce1d5] pb-3">
          <h4 className="font-bold text-sm text-[#17211b] flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#17211b]" /> Schedule & Venue
          </h4>
          <button
            type="button"
            onClick={() => onEditSection(3)}
            className="text-xs font-bold text-[#17211b] hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-[#6d766d]">Date & Time</p>
            <p className="font-semibold text-[#17211b] mt-0.5">
              {formData.startDate} to {formData.endDate}
            </p>
          </div>

          <div>
            <p className="font-bold text-[#6d766d]">
              {isOnline ? 'Virtual Stream Access' : 'Venue Location'}
            </p>
            {isOnline ? (
              <div className="mt-0.5 space-y-1">
                <p className="font-semibold text-[#17211b] flex items-center gap-1.5 truncate">
                  <Video className="h-3.5 w-3.5 text-[#ff5500]" />
                  {formData.meetingLink || 'Meeting Link Provided'}
                </p>
                {formData.virtualPlatform && (
                  <p className="text-[11px] text-[#6d766d]">
                    Platform:{' '}
                    <strong className="text-[#17211b]">
                      {formatVirtualPlatform(formData.virtualPlatform)}
                    </strong>
                  </p>
                )}
                {formData.meetingPasscode && (
                  <p className="text-[11px] text-[#6d766d] flex items-center gap-1">
                    <Key className="h-3 w-3" /> Passcode:{' '}
                    <strong className="text-[#17211b]">
                      {formData.meetingPasscode}
                    </strong>
                  </p>
                )}
              </div>
            ) : (
              <p className="font-semibold text-[#17211b] mt-0.5">
                {formData.venueName ||
                  formData.venueAddress ||
                  'Venue details set'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dce1d5] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between  border-[#dce1d5] pb-3">
          <h4 className="font-bold text-sm text-[#17211b] flex items-center gap-2">
            <Ticket className="h-4 w-4 text-[#17211b]" /> Tickets & Tiers (
            {formData.ticketTiers.length})
          </h4>
          <button
            type="button"
            onClick={() => onEditSection(4)}
            className="text-xs font-bold text-[#17211b] hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="space-y-2">
          {formData.ticketTiers.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl bg-[#f7f7f2] border border-[#dce1d5] p-3 text-xs"
            >
              <div>
                <p className="font-bold text-[#17211b]">{t.name}</p>
                <p className="text-[#6d766d]">{t.quantity} tickets available</p>
              </div>
              <p className="font-bold text-[#17211b]">
                {t.price === 0 || isFree
                  ? 'Free'
                  : `₦${t.price.toLocaleString()}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#dce1d5] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-[#dce1d5] pb-3">
          <h4 className="font-bold text-sm text-[#17211b] flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[#17211b]" /> Payout & Settlement
            Account
          </h4>
          <button
            type="button"
            onClick={() => onEditSection(5)}
            className="text-xs font-bold text-[#17211b] hover:underline"
          >
            Edit
          </button>
        </div>

        {isFree ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#d6f94a]/20 border border-[#d6f94a] p-3 text-xs text-[#17211b]">
            <Sparkles className="h-4 w-4 text-[#17211b]" />
            <span className="font-bold">
              Free Event — Settlement Account Requirement Waived
            </span>
          </div>
        ) : formData.settlementAccount &&
          formData.settlementAccount.bankName ? (
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#ff5500]" />
              <div>
                <p className="font-bold text-[#17211b]">
                  {formData.settlementAccount.bankName} (
                  {formData.settlementAccount.accountNumber})
                </p>
                <p className="text-[#6d766d]">
                  {formData.settlementAccount.accountName}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#f7f7f2] border min-w-25 border-[#dce1d5] px-2.5 py-1 text-[10px] font-bold uppercase text-[#17211b]">
              {formData.coverFees ? 'Organizer Pays Fees' : 'Buyer Pays Fees'}
            </span>
          </div>
        ) : (
          <p className="text-xs text-red-600 font-medium">
            No settlement account assigned!
          </p>
        )}
      </div>
    </div>
  );
}
