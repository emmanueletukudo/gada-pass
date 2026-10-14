'use client';

import { useEffect } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Plus, Trash2, Sparkles, Tag } from 'lucide-react';
import { GadaInput } from '@/components/common/gada-inputs';
import { EventFormValues } from './schema';

interface Step3Props {
  form: UseFormReturn<EventFormValues>;
}

export function Step3Tickets({ form }: Step3Props) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const eventType = watch('eventType');
  const isFreeEvent = eventType === 'FREE_EVENT';

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'ticketTiers',
  });

  // Handle Free Event mode defaults
  useEffect(() => {
    if (isFreeEvent) {
      // For free events, lock existing tiers to ₦0 price
      fields.forEach((_, idx) => {
        setValue(`ticketTiers.${idx}.price`, 0, { shouldValidate: true });
      });
    }
  }, [isFreeEvent, fields.length, setValue]);

  // Preset generator for fast tier creation
  const addPresetTier = (name: string, price: number, quantity: number) => {
    append({ name, price: isFreeEvent ? 0 : price, quantity });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h6 className="display text-lg font-bold tracking-tight text-[#17211b]">
              Ticket Tiers & Allocation
            </h6>
            {isFreeEvent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#d6f94a] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#17211b]">
                <Sparkles className="h-3 w-3" /> Free Event
              </span>
            )}
          </div>
          <p className="text-xs text-[#6d766d]">
            {isFreeEvent
              ? 'Free events automatically set ticket prices to ₦0. Define pass titles and allocations.'
              : 'Define the pricing structure and available quantity for each ticket type.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            append({
              name: isFreeEvent ? 'Free Access Pass' : '',
              price: 0,
              quantity: 100,
            })
          }
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#17211b] px-4 py-2 text-xs font-bold text-[#17211b] transition hover:bg-[#17211b]/5 sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Tier</span>
        </button>
      </div>

      {!isFreeEvent && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d766d] flex items-center gap-1 pr-2 border-r border-[#dce1d5]">
            <Tag className="h-3.5 w-3.5 text-[#ff5500]" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => addPresetTier('Early Bird', 5000, 50)}
            className="rounded-full bg-[#f7f7f2] border border-[#dce1d5] px-3 py-1 text-[11px] font-bold text-[#17211b] hover:border-[#17211b]"
          >
            + Early Bird (₦5k)
          </button>
          <button
            type="button"
            onClick={() => addPresetTier('VIP Pass', 20000, 30)}
            className="rounded-full bg-[#f7f7f2] border border-[#dce1d5] px-3 py-1 text-[11px] font-bold text-[#17211b] hover:border-[#17211b]"
          >
            + VIP Pass (₦20k)
          </button>
          <button
            type="button"
            onClick={() => addPresetTier('VVIP Table (Group of 5)', 150000, 5)}
            className="rounded-full bg-[#f7f7f2] border border-[#dce1d5] px-3 py-1 text-[11px] font-bold text-[#17211b] hover:border-[#17211b]"
          >
            + VVIP Table (₦150k)
          </button>
        </div>
      )}

      {errors.ticketTiers?.root && (
        <p className="text-xs text-[#c34837]">
          {errors.ticketTiers.root.message}
        </p>
      )}

      {/* TIER LIST */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-4 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 sm:flex-row sm:items-start"
          >
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              <GadaInput
                type="text"
                register={register}
                name={`ticketTiers.${index}.name`}
                label="Tier Title"
                placeHolder={isFreeEvent ? 'e.g. Free Pass' : 'e.g. VIP Pass'}
                required
                error={errors.ticketTiers?.[index]?.name?.message}
              />

              <div className="relative">
                <GadaInput
                  register={register}
                  name={`ticketTiers.${index}.price`}
                  type="number"
                  label="Price (₦)"
                  placeHolder="0"
                  disabled={isFreeEvent}
                  required
                  error={errors.ticketTiers?.[index]?.price?.message}
                />
                {isFreeEvent && (
                  <span className="absolute right-3 top-9 text-[10px] font-extrabold uppercase text-[#6d766d]">
                    FREE
                  </span>
                )}
              </div>

              <GadaInput
                register={register}
                name={`ticketTiers.${index}.quantity`}
                type="number"
                label="Volume Allocation"
                placeHolder="100"
                required
                error={errors.ticketTiers?.[index]?.quantity?.message}
              />
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-6 self-end rounded-xl border border-[#c34837]/20 p-3 text-[#c34837] transition hover:bg-[#c34837]/5 sm:self-auto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
