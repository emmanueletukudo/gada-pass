'use client';

import {
  Calendar,
  MapPin,
  Share2,
  Ticket,
  Video,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { EventFormDataPreview } from './types';
import { formatVirtualPlatform } from '@/utils/helpers';

interface EventCardPreviewProps {
  formData: EventFormDataPreview;
  deviceMode: 'mobile' | 'desktop';
}

export function EventCardPreview({
  formData,
  deviceMode,
}: EventCardPreviewProps) {
  const isOnline =
    formData.locationType === 'ONLINE' || formData.eventType === 'ONLINE_EVENT';
  const isFree = formData.eventType === 'FREE_EVENT';

  const minPrice = formData.ticketTiers?.length
    ? Math.min(...formData.ticketTiers.map((t) => Number(t.price) || 0))
    : 0;

  return (
    <div
      className={`mx-auto transition-all ${
        deviceMode === 'mobile' ? 'max-w-md' : 'w-full'
      }`}
    >
      <div className="overflow-hidden rounded-3xl border border-[#dce1d5] bg-white shadow-lg">
        <div className="relative h-56 w-full bg-[#17211b]/10 sm:h-72">
          {formData.coverImageUrl ? (
            <img
              src={formData.coverImageUrl}
              alt={formData.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-linear-to-br from-[#17211b] to-[#2e4236] p-6 text-center text-white">
              <span className="rounded-full bg-[#d6f94a] px-3 py-1 text-[10px] font-extrabold uppercase text-[#17211b]">
                {formData.category || formData.eventType || 'General Event'}
              </span>
              <h2 className="display mt-3 text-2xl font-black">
                {formData.title || 'Untitled Event'}
              </h2>
            </div>
          )}

          {formData.eventType && (
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#17211b]/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase text-white shadow-sm">
              {isFree ? (
                <Sparkles className="h-3 w-3 text-[#d6f94a]" />
              ) : isOnline ? (
                <Video className="h-3 w-3 text-[#ff5500]" />
              ) : null}
              <span>{formData.eventType.replace(/_/g, ' ')}</span>
            </div>
          )}

          <div className="absolute right-4 top-4 rounded-full bg-white/90 backdrop-blur-md p-2 text-[#17211b] shadow-md">
            <Share2 className="h-4 w-4" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#6d766d]">
            <span className="flex items-center gap-1.5 text-[#17211b]">
              <Calendar className="h-4 w-4 text-[#17211b]" />
              {new Date(formData.startDate).toLocaleString('en-NG', {
                dateStyle: 'full',
                timeStyle: 'short',
              }) || 'Date TBD'}{' '}
            </span>
            <span className="rounded-full bg-[#f7f7f2] border border-[#dce1d5] px-2.5 py-1 text-[10px] uppercase text-[#17211b]">
              {isOnline ? 'VIRTUAL' : 'IN-PERSON'}
            </span>
          </div>

          <h3 className="display text-xl font-bold text-[#17211b]">
            {formData.title || 'Event Title Goes Here'}
          </h3>

          <p className="line-clamp-2 text-xs text-[#6d766d]">
            {formData.description || 'No description provided yet.'}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-[#6d766d]">
            {isOnline ? (
              <>
                <Video className="h-4 w-4 text-[#ff5500]" />
                <span>
                  {formData.virtualPlatform
                    ? `${formatVirtualPlatform(formData.virtualPlatform)} Access Link`
                    : 'Online Event (Access details shared upon registration)'}
                </span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-[#17211b]" />
                <span>
                  {formData.venueName ||
                    formData.venueAddress ||
                    'Location TBD'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[#f7f7f2] p-4 border border-[#dce1d5] mt-4">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-bold uppercase text-[#6d766d]">
                  Price Starting At
                </p>
                {formData.coverFees && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-[#17211b] bg-[#d6f94a] px-1.5 py-0.5 rounded-full">
                    <ShieldCheck className="h-2.5 w-2.5" /> Fees Included
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-[#17211b]">
                {minPrice === 0 || isFree
                  ? 'Free'
                  : `₦${minPrice.toLocaleString()}`}
              </p>
            </div>

            <button
              type="button"
              disabled
              className="flex items-center gap-1.5 rounded-full bg-[#d6f94a] px-5 py-2.5 text-xs font-bold text-[#17211b] cursor-not-allowed opacity-90"
            >
              <Ticket className="h-4 w-4" />
              Get Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
