'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  Globe,
  Instagram,
  X as TwitterIcon,
  Video,
  Key,
  MapPin,
} from 'lucide-react';
import { GadaInput } from '@/components/common/gada-inputs';
import { GadaDateTimePicker } from '@/components/common/gada-datetime-picker';
import { EventFormValues } from './schema';
import { GadaCategories } from './gada-categories';
import { useEventFormStore } from '@/stores/use-event-form-store';

interface Step2Props {
  form: UseFormReturn<EventFormValues>;
}

const VIRTUAL_PLATFORMS = [
  { id: 'ZOOM', label: 'Zoom' },
  { id: 'GOOGLE_MEET', label: 'Google Meet' },
  { id: 'YOUTUBE_LIVE', label: 'YouTube Live' },
  { id: 'TEAMS', label: 'Microsoft Teams' },
  { id: 'CUSTOM', label: 'Custom Stream / Webcast' },
];

export function Step2DateLocation({ form }: Step2Props) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const updateFormData = useEventFormStore((state) => state.updateFormData);

  const eventType = watch('eventType');
  const isOnline = eventType === 'ONLINE_EVENT';
  const selectedPlatform = watch('virtualPlatform') || 'ZOOM';

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <GadaCategories form={form} />
      </div>
      {isOnline ? (
        <div className="space-y-4 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#dce1d5] pb-2">
            <Video className="h-5 w-5 text-[#ff5500]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17211b]">
              Online Meeting Details
            </h4>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#6d766d]">
              Virtual Platform
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {VIRTUAL_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => {
                    setValue('virtualPlatform', platform.id, {
                      shouldValidate: true,
                    });
                    updateFormData({ virtualPlatform: platform.id });
                  }}
                  className={`rounded-xl border p-2.5 text-center text-xs font-bold transition ${
                    selectedPlatform === platform.id
                      ? 'border-[#17211b] bg-[#17211b] text-white'
                      : 'border-[#dce1d5] bg-white text-[#17211b] hover:border-[#17211b]'
                  }`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Globe className="absolute left-3 top-10 h-4 w-4 text-[#ff5500]" />
            <GadaInput
              type="text"
              register={register}
              name="meetingLink"
              label="Meeting / Stream URL"
              placeHolder="https://zoom.us/j/123456789 or YouTube Live URL"
              styles="pl-9"
              required
              onChange={(e) => updateFormData({ meetingLink: e.target.value })}
              error={errors.meetingLink?.message}
            />
          </div>

          <div className="relative">
            <Key className="absolute left-3 top-10 h-4 w-4 text-[#6d766d]" />
            <GadaInput
              type="text"
              register={register}
              name="meetingPasscode"
              label="Passcode / Key (Optional)"
              placeHolder="e.g. 884920"
              styles="pl-9"
              onChange={(e) =>
                updateFormData({ meetingPasscode: e.target.value })
              }
              error={errors.meetingPasscode?.message}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-12 h-4 w-4 text-[#6d766d]" />
            <GadaInput
              register={register}
              name="city"
              label="City"
              type="text"
              placeHolder="e.g. Lagos, Abuja, Uyo"
              styles="pl-9"
              required
              onChange={(e) => updateFormData({ city: e.target.value })}
              error={errors.city?.message}
            />
          </div>

          <GadaInput
            register={register}
            name="venue"
            label="Venue Address / Name"
            type="text"
            placeHolder="e.g. Eko Hotel, Victoria Island"
            required
            onChange={(e) => updateFormData({ venue: e.target.value })}
            error={errors.venue?.message}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <GadaDateTimePicker
          control={control}
          name="startDate"
          label="Start Date"
          minDate={new Date()}
          required
          error={errors.startDate?.message}
        />

        <GadaDateTimePicker
          control={control}
          name="endDate"
          label="End Date"
          minDate={
            watch('startDate') ? new Date(watch('startDate')) : new Date()
          }
          required
          error={errors.endDate?.message}
        />

        <GadaInput
          register={register}
          name="capacity"
          type="number"
          label="Capacity"
          placeHolder="e.g. 500"
          required
          onChange={(e) => updateFormData({ capacity: Number(e.target.value) })}
          error={errors.capacity?.message}
        />
      </div>

      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#6d766d]">
          Social & Portfolio Links (Optional)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <Instagram className="absolute left-3 top-12 h-4 w-4 text-[#c34837]" />
            <GadaInput
              type="text"
              register={register}
              name="instagram"
              label="Instagram Profile"
              placeHolder="https://instagram.com/..."
              styles="pl-9"
              onChange={(e) => updateFormData({ instagram: e.target.value })}
              error={errors.instagram?.message}
            />
          </div>

          <div className="relative">
            <TwitterIcon className="absolute left-3 top-12 h-4 w-4 text-[#c34837]" />
            <GadaInput
              type="text"
              register={register}
              name="x"
              label="X / Twitter Handle"
              placeHolder="https://x.com/..."
              styles="pl-9"
              onChange={(e) => updateFormData({ x: e.target.value })}
              error={errors.x?.message}
            />
          </div>

          <div className="relative">
            <Globe className="absolute left-3 top-12 h-4 w-4 text-[#c34837]" />
            <GadaInput
              type="text"
              register={register}
              name="website"
              label="Portfolio / Website"
              placeHolder="https://yourdomain.com"
              styles="pl-9"
              onChange={(e) => updateFormData({ website: e.target.value })}
              error={errors.website?.message}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
