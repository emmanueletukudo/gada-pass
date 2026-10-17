'use client';

import { useEffect } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Plus, Trash2, Sparkles, Tag, Calendar, RefreshCw } from 'lucide-react';
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTiers',
  });

  useEffect(() => {
    if (isFreeEvent) {
      fields.forEach((_, idx) => {
        setValue(`ticketTiers.${idx}.price`, 0, { shouldValidate: true });
      });
    }
  }, [isFreeEvent, fields.length, setValue]);

  const addPresetTier = (
    name: string,
    price: number,
    quantity: number,
    isMultiDay = false,
  ) => {
    append({
      name,
      price: isFreeEvent ? 0 : price,
      quantity,
      isMultiDay,
      maxScansPerDay: 1,
    });
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
              : 'Define pricing, quantities, and multi-day access rules for each ticket tier.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            append({
              name: isFreeEvent ? 'Free Access Pass' : '',
              price: 0,
              quantity: 100,
              isMultiDay: false,
              maxScansPerDay: 1,
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
            onClick={() =>
              addPresetTier('3-Day All Access Pass', 45000, 100, true)
            }
            className="rounded-full bg-[#f7f7f2] border border-[#dce1d5] px-3 py-1 text-[11px] font-bold text-[#17211b] hover:border-[#17211b]"
          >
            + 3-Day All Access (₦45k)
          </button>
        </div>
      )}

      {errors.ticketTiers?.root && (
        <p className="text-xs text-[#c34837]">
          {errors.ticketTiers.root.message}
        </p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const isMultiDay = watch(`ticketTiers.${index}.isMultiDay`);

          return (
            <div
              key={field.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

              {/* Advanced Trade Fair / Multi-Day Controls */}
              <div className="mt-2 flex flex-col gap-4 rounded-xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`isMultiDay-${index}`}
                    {...register(`ticketTiers.${index}.isMultiDay`)}
                    className="h-4 w-4 rounded border-[#dce1d5] text-[#17211b] focus:ring-[#17211b]"
                  />
                  <label
                    htmlFor={`isMultiDay-${index}`}
                    className="text-xs font-bold text-[#17211b] cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#ff5500]" />
                    Multi-Day All-Access Pass (Valid across all event dates)
                  </label>
                </div>

                {!isMultiDay && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#6d766d]">
                      Valid Date:
                    </span>
                    <input
                      type="date"
                      {...register(`ticketTiers.${index}.validDate`)}
                      className="rounded-lg border border-[#dce1d5] bg-white px-2.5 py-1 text-xs text-[#17211b]"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#6d766d] flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Max Scans/Day:
                  </span>
                  <input
                    type="number"
                    min={1}
                    {...register(`ticketTiers.${index}.maxScansPerDay`)}
                    className="w-16 rounded-lg border border-[#dce1d5] bg-white px-2.5 py-1 text-xs text-[#17211b]"
                  />
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-lg border border-[#c34837]/20 p-2 text-[#c34837] transition hover:bg-[#c34837]/5"
                    title="Remove Tier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
