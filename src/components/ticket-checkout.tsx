'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Plus,
  Minus,
  TicketPlus,
  Loader2,
  Zap,
  Calendar,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { GadaInput } from './common/gada-inputs';
import { toast } from 'sonner';

const guestCheckoutSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Please select a gender option',
  }),
});

export type GuestCheckoutFormData = z.infer<typeof guestCheckoutSchema>;

export type Tier = {
  id: string;
  name: string;
  description?: string;
  price: string;
  currency: string;
  quantity: number;
  soldCount: number;
  isMultiDay?: boolean;
  maxScansPerDay?: number;
  validDate?: string;
};

interface TicketCheckoutProps {
  eventId: string;
  tiers?: Tier[];
}

type Selection = { tier: Tier; quantity: number };

function OrderSummary({
  selections,
  currencySymbol,
  platformFee,
  total,
}: {
  selections: Selection[];
  currencySymbol: string;
  platformFee: number;
  total: number;
}) {
  return (
    <div className="my-4 rounded-xl border border-[#dce1d5] bg-[#f0f1e9] p-3.5 text-sm">
      <p className="text-lg font-bold text-[#17211b]">Order Summary</p>

      <div className="mt-2 space-y-1.5 text-[#6d766d]">
        {selections.map(({ tier, quantity }) => (
          <div key={tier.id} className="flex justify-between gap-3">
            <span className="min-w-0 wrap-break-word">
              {tier.name} (x{quantity})
            </span>
            <span className="shrink-0 whitespace-nowrap">
              {currencySymbol}
              {(Number(tier.price) * quantity).toLocaleString()}
            </span>
          </div>
        ))}
        <div className="flex justify-between gap-3">
          <span>Platform &amp; service fee</span>
          <span className="shrink-0 whitespace-nowrap">
            {currencySymbol}
            {platformFee.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-3 border-t border-[#dce1d5] pt-2 font-bold text-[#17211b]">
          <span>Total due (inc. fees)</span>
          <span className="shrink-0 whitespace-nowrap">
            {currencySymbol}
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TicketCheckout({ eventId, tiers = [] }: TicketCheckoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCurrentUser();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setTimeout(() => setIsDrawerVisible(true), 10);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => setIsDrawerOpen(false), 300);
  };

  const handleQuantityChange = (
    tierId: string,
    delta: number,
    maxAvailable: number,
  ) => {
    setQuantities((prev) => {
      const current = prev[tierId] || 0;
      const updated = Math.max(0, Math.min(maxAvailable, current + delta));
      return { ...prev, [tierId]: updated };
    });
  };

  const activeSelections: Selection[] = (tiers ?? [])
    .map((tier) => ({
      tier,
      quantity: quantities[tier.id] || 0,
    }))
    .filter((item) => item.quantity > 0);

  const subtotal = activeSelections.reduce((acc, item) => {
    return acc + Number(item.tier.price) * item.quantity;
  }, 0);

  const currencySymbol =
    tiers[0]?.currency === 'NGN' ? '₦' : tiers[0]?.currency || '₦';

  const platformFee = subtotal > 0 ? subtotal * 0.05 + 100 : 0;
  const total = subtotal + platformFee;
  const hasSelection = activeSelections.length > 0;
  const isFree = hasSelection && total === 0;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<GuestCheckoutFormData>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      gender: 'MALE',
    },
  });

  const selectedGender = watch('gender');

  const processCheckout = async (guestData?: GuestCheckoutFormData) => {
    if (isProcessing || activeSelections.length === 0) return;
    const email = (isAuthenticated ? user?.email : guestData?.email)?.trim();

    if (!email) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsProcessing(true);

    try {
      const authenticatedFullName =
        user?.name ||
        [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
        user?.hostName;

      const payload = {
        items: activeSelections.map((item) => ({
          tierId: item.tier.id,
          quantity: item.quantity,
        })),
        email,
        fullName: isAuthenticated
          ? authenticatedFullName
          : guestData?.fullName?.trim(),
        phone: isAuthenticated
          ? user?.phone
          : guestData?.phone?.trim() || undefined,
        gender: isAuthenticated ? user?.gender || undefined : guestData?.gender,
      };

      if (total === 0) {
        await api(`/events/${eventId}/reserve`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        toast.success('Tickets reserved successfully! Check your email.');
        setIsDrawerVisible(false);
        setIsDrawerOpen(false);

        if (isAuthenticated) {
          router.push('/dashboad/attendee/tickets');
        } else {
          reset();
          setQuantities({});

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
        return;
      }

      const initialized = await api<{
        reference: string;
        amount?: number;
        currency?: string;
        authorization_url?: string;
      }>(`/events/${eventId}/checkout/initialize`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (initialized?.authorization_url) {
        window.location.href = initialized.authorization_url;
      } else {
        throw new Error('Failed to obtain payment authorization URL');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Checkout unavailable',
      );
      setIsProcessing(false);
    }
  };

  const handleCheckoutClick = () => {
    if (activeSelections.length === 0) {
      toast.error('Please select at least one ticket.');
      return;
    }

    if (isAuthenticated) {
      processCheckout();
    } else {
      openDrawer();
    }
  };

  return (
    <>
      <div className="space-y-4">
        {(tiers ?? []).map((tier) => {
          const available = tier.quantity - tier.soldCount;
          const currentQty = quantities[tier.id] || 0;
          const isSoldOut = available <= 0;
          const isVip = tier.name.toLowerCase().includes('vip');
          const isFreeTier = Number(tier.price) === 0;

          return (
            <div
              key={tier.id}
              className={`flex flex-col gap-4 rounded-3xl border p-4 shadow-sm transition-all sm:p-5 ${
                tier.isMultiDay
                  ? 'border-[#ff5500]/40 bg-[#fffef9]'
                  : 'border-[#e6e8e3] bg-[#ffffff]'
              }`}
            >
              {/* Top: icon + details. Always stacked from the price row so the
                  narrow sidebar never squeezes the text column. */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl sm:h-14 sm:w-14 ${
                    isVip ? 'bg-[#ff765f]' : 'bg-[#8aa520]'
                  } text-white shadow-md`}
                >
                  <TicketPlus className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <h3 className="wrap-break-word text-lg font-bold leading-tight tracking-tight text-[#1c1926] sm:text-xl">
                    {tier.name}
                  </h3>

                  {(tier.isMultiDay || tier.validDate) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tier.isMultiDay && (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#17211b] px-2.5 py-0.5 text-[10px] font-black text-white">
                          <Zap className="h-3 w-3 text-[#d6f94a]" />
                          MULTI-DAY PASS
                        </span>
                      )}
                      {tier.validDate && (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#d6f94a]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#17211b]">
                          <Calendar className="h-3 w-3" />
                          {new Date(tier.validDate).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric' },
                          )}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs leading-relaxed text-[#73727a]">
                    {tier.description ||
                      `Standard ${tier.name} access to the event.`}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-[#5c5b63]">
                    <span className="inline-flex whitespace-nowrap rounded-full bg-[#f2f4f0] px-3 py-1">
                      {isSoldOut
                        ? 'Sold out'
                        : `${available.toLocaleString()} remaining`}
                    </span>
                    {tier.maxScansPerDay ? (
                      <span className="whitespace-nowrap">
                        Max {tier.maxScansPerDay} scans/day
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Bottom: price + stepper */}
              <div className="flex items-center justify-between gap-4 border-t border-dashed border-[#e6e8e3] pt-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9f9fa8]">
                    Unit price
                  </span>
                  <span className="text-2xl font-extrabold leading-tight text-[#17211b]">
                    {isFreeTier
                      ? 'Free'
                      : `${currencySymbol}${Number(tier.price).toLocaleString()}`}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-[#e3e6df] bg-[#f8f9f6] p-1.5">
                  <button
                    type="button"
                    aria-label={`Remove one ${tier.name} ticket`}
                    disabled={isProcessing || currentQty <= 0}
                    onClick={() => handleQuantityChange(tier.id, -1, available)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f3ed] text-[#8e8d96] transition hover:bg-[#e4e7df] disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span
                    aria-live="polite"
                    className="min-w-5 text-center text-sm font-bold text-[#1c1926]"
                  >
                    {currentQty}
                  </span>

                  <button
                    type="button"
                    aria-label={`Add one ${tier.name} ticket`}
                    disabled={
                      isProcessing || isSoldOut || currentQty >= available
                    }
                    onClick={() => handleQuantityChange(tier.id, 1, available)}
                    className={`grid h-8 w-8 place-items-center rounded-full ${
                      isVip
                        ? 'bg-[#ff765f] hover:bg-[#d2614d]'
                        : 'bg-[#8aa520] hover:bg-[#687c17]'
                    } text-white shadow-sm transition disabled:opacity-30`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {isAuthenticated && hasSelection && total !== 0 && (
          <OrderSummary
            selections={activeSelections}
            currencySymbol={currencySymbol}
            platformFee={platformFee}
            total={total}
          />
        )}

        <button
          type="button"
          disabled={isProcessing || isLoading || !hasSelection}
          onClick={handleCheckoutClick}
          className="w-full rounded-full bg-[#1c1926] py-3.5 text-sm font-bold text-white transition hover:bg-[#2b273b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="mx-auto h-4 w-4 animate-spin text-[#d6f94a]" />
          ) : !hasSelection ? (
            <span>Select tickets</span>
          ) : isFree ? (
            <span>Reserve tickets</span>
          ) : (
            <span>Continue to checkout</span>
          )}
        </button>
      </div>

      {isDrawerOpen && (
        <div
          className={`fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isDrawerVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeDrawer}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Guest checkout"
            onClick={(e) => e.stopPropagation()}
            className={`relative flex h-dvh w-full max-w-md flex-col overflow-y-auto bg-[#fffef9] p-5 shadow-2xl transition-transform duration-300 ease-out sm:p-6 ${
              isDrawerVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between border-b border-[#dce1d5] pb-4">
                <h2 className="text-xl font-bold text-[#17211b]">
                  Guest checkout
                </h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={closeDrawer}
                  className="rounded-full bg-[#f0f1e9] p-1.5 text-[#6d766d] hover:bg-black hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <OrderSummary
                selections={activeSelections}
                currencySymbol={currencySymbol}
                platformFee={platformFee}
                total={total}
              />

              <form
                id="guest-checkout-form"
                onSubmit={handleSubmit(processCheckout)}
                className="mt-6 space-y-4"
              >
                <GadaInput
                  register={register}
                  name="fullName"
                  type="text"
                  placeHolder="Jane Doe"
                  label="Full Name"
                  required
                  error={errors.fullName?.message}
                />

                <GadaInput
                  register={register}
                  name="email"
                  type="email"
                  placeHolder="you@example.com"
                  label="Email Address"
                  required
                  error={errors.email?.message}
                />

                <GadaInput
                  register={register}
                  name="phone"
                  type="tel"
                  placeHolder="+234 800 000 0000"
                  label="Phone / WhatsApp"
                  error={errors.phone?.message}
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#17211b]">
                    Gender <span className="text-[#c34837]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Male', value: 'MALE' },
                      { label: 'Female', value: 'FEMALE' },
                      { label: 'Other', value: 'OTHER' },
                    ].map((item) => {
                      const isActive = selectedGender === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() =>
                            setValue(
                              'gender',
                              item.value as 'MALE' | 'FEMALE' | 'OTHER',
                              { shouldValidate: true },
                            )
                          }
                          className={`rounded-xl border py-2 text-sm transition ${
                            isActive
                              ? 'border-[#17211b] bg-[#17211b] text-white'
                              : 'border-[#dce1d5] bg-white text-[#6d766d] hover:border-[#17211b]'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.gender?.message && (
                    <p className="text-[11px] font-semibold text-[#c34837]">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Sticky footer so the CTA is always reachable on short screens */}
            <div className="sticky bottom-0 -mx-5 mt-6 border-t border-[#dce1d5] bg-[#fffef9] px-5 pb-1 pt-4 sm:-mx-6 sm:px-6">
              <button
                type="submit"
                form="guest-checkout-form"
                disabled={isProcessing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-3.5 text-sm font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#d6f94a]" />
                ) : (
                  <span>{isFree ? 'Reserve now' : 'Pay now'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
