'use client';

import { useEffect } from 'react';
import Image from 'next/image';
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
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { GadaInput } from '@/components/common/gada-inputs';
import { toast } from 'sonner';
import { useCheckoutStore, Tier } from '@/stores/use-checkout-store';
import { Logo } from '../logo';
import { formatDate } from '@/utils/helpers';

const guestCheckoutSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Please select a gender option',
  }),
});

export type GuestCheckoutFormData = z.infer<typeof guestCheckoutSchema>;

interface Organizer {
  hostName: string;
  phone: string;
  logoUrl: string;
}
export interface EmbedEventProps {
  event: {
    id: string;
    name: string;
    coverImage?: string;
    startsAt: string;
    endsAt: string;
    venue?: string;
    banner: string;
    organizer: Organizer;
    isVirtual?: boolean;
    ticketTiers: Tier[];
  };
}

export default function EmbedEventCard({ event }: EmbedEventProps) {
  const initCheckout = useCheckoutStore((state) => state.initCheckout);
  const quantities = useCheckoutStore((state) => state.quantities);
  const setQuantity = useCheckoutStore((state) => state.setQuantity);
  const resetQuantities = useCheckoutStore((state) => state.resetQuantities);
  const isDrawerOpen = useCheckoutStore((state) => state.isDrawerOpen);
  const isDrawerVisible = useCheckoutStore((state) => state.isDrawerVisible);
  const openDrawer = useCheckoutStore((state) => state.openDrawer);
  const closeDrawer = useCheckoutStore((state) => state.closeDrawer);
  const isProcessing = useCheckoutStore((state) => state.isProcessing);
  const setIsProcessing = useCheckoutStore((state) => state.setIsProcessing);
  const getActiveSelections = useCheckoutStore(
    (state) => state.getActiveSelections,
  );
  const getPlatformFee = useCheckoutStore((state) => state.getPlatformFee);
  const getTotal = useCheckoutStore((state) => state.getTotal);
  const getCurrencySymbol = useCheckoutStore(
    (state) => state.getCurrencySymbol,
  );

  useEffect(() => {
    initCheckout(event.id, event.ticketTiers || []);
  }, [event, initCheckout]);

  console.log(event);

  const activeSelections = getActiveSelections();
  const platformFee = getPlatformFee();
  const total = getTotal();
  const currencySymbol = getCurrencySymbol();
  const foramtedStartDate = formatDate(event.startsAt);
  const formatedEndDate = formatDate(event.endsAt);

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

  const processCheckout = async (guestData: GuestCheckoutFormData) => {
    if (isProcessing || activeSelections.length === 0) return;

    const email = guestData.email?.trim();
    if (!email) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        items: activeSelections.map((item) => ({
          tierId: item.tier.id,
          quantity: item.quantity,
        })),
        email,
        fullName: guestData.fullName.trim(),
        phone: guestData.phone?.trim() || undefined,
        gender: guestData.gender,
      };

      if (total === 0) {
        await api(`/events/${event.id}/reserve`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        toast.success('Tickets reserved successfully! Check your email.');
        closeDrawer();
        reset();
        resetQuantities();
        return;
      }

      const initialized = await api<{
        reference: string;
        amount?: number;
        currency?: string;
        authorization_url?: string;
      }>(`/events/${event.id}/checkout/initialize`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (initialized?.authorization_url) {
        window.top
          ? (window.top.location.href = initialized.authorization_url)
          : (window.location.href = initialized.authorization_url);
      } else {
        throw new Error('Failed to obtain payment authorization URL');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Checkout unavailable',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutClick = () => {
    if (activeSelections.length === 0) {
      toast.error('Please select at least one ticket.');
      return;
    }
    openDrawer();
  };

  return (
    <div className="relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl border border-[#dce1d5] bg-[#ffffff] shadow-md font-sans text-[#17211b]">
      {event.banner && (
        <div className="relative h-44 w-full bg-[#17211b]">
          <Image
            src={event.banner}
            alt={event.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 inline-flex items-center gap-2">
            <span className="inline-block rounded-full bg-[#d6f94a] px-3 py-1 text-[10px] font-black uppercase text-[#17211b]">
              Hosted by {event.organizer.hostName}
            </span>
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#17211b] line-clamp-1">
            {event.name}
          </h2>
          <div className="mt-2 space-y-1 text-xs text-[#6d766d]">
            <div className="inline-flex items-center gap-2  text-xs font-bold text-[#17211b]">
              <Calendar className="h-4 w-4 text-[#ff5500] shrink-0" />
              <span>
                {foramtedStartDate === formatedEndDate ? (
                  foramtedStartDate
                ) : (
                  <>
                    <span className="text-[10px] uppercase font-semibold text-[#6d766d] tracking-wider mr-1">
                      From
                    </span>
                    {foramtedStartDate}
                    <span className="text-[10px] uppercase font-semibold text-[#6d766d] tracking-wider mx-1">
                      to
                    </span>
                    {formatedEndDate}
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#ff5500]" />
              <span className="truncate">
                {event.isVirtual
                  ? 'Online Event'
                  : event.venue || 'Location TBA'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-[#dce1d5]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
            Select Tickets
          </span>

          {(event.ticketTiers ?? []).map((tier) => {
            const available = tier.quantity - tier.soldCount;
            const currentQty = quantities[tier.id] || 0;
            const isSoldOut = available <= 0;

            return (
              <div
                key={tier.id}
                className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-sm transition-all sm:flex-row sm:items-center ${
                  tier.isMultiDay
                    ? 'border-[#ff5500]/40 bg-[#fffef9]'
                    : 'border-[#e6e8e3] bg-[#ffffff]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      tier.name.toLowerCase().includes('vip')
                        ? 'bg-[#ff765f]'
                        : 'bg-[#8aa520]'
                    } text-white shadow-sm`}
                  >
                    <TicketPlus className="h-5 w-5" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-[#17211b]">
                        {tier.name}
                      </h4>
                      {tier.isMultiDay && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-[#17211b] px-2 py-0.5 text-[9px] font-black text-white">
                          <Zap className="h-2.5 w-2.5 text-[#d6f94a]" />{' '}
                          MULTI-DAY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6d766d] line-clamp-1">
                      {tier.description || `Standard ${tier.name} ticket.`}
                    </p>
                    <span className="text-[10px] text-[#5c5b63]">
                      {isSoldOut ? 'Sold Out' : `${available} left`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span className="text-sm font-extrabold text-[#17211b]">
                    {currencySymbol}
                    {Number(tier.price).toLocaleString()}
                  </span>

                  <div className="flex items-center gap-2 rounded-full border border-[#e3e6df] bg-[#f8f9f6] p-1">
                    <button
                      type="button"
                      disabled={isProcessing || currentQty <= 0}
                      onClick={() => setQuantity(tier.id, -1, available)}
                      className="grid h-6 w-6 place-items-center rounded-full bg-[#f1f3ed] text-[#8e8d96] transition hover:bg-[#e4e7df] disabled:opacity-30"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    <span className="w-4 text-center text-xs font-bold text-[#17211b]">
                      {currentQty}
                    </span>

                    <button
                      type="button"
                      disabled={
                        isProcessing || isSoldOut || currentQty >= available
                      }
                      onClick={() => setQuantity(tier.id, 1, available)}
                      className={`grid h-6 w-6 place-items-center rounded-full ${
                        tier.name.toLowerCase().includes('vip')
                          ? 'bg-[#ff765f] hover:bg-[#d2614d]'
                          : 'bg-[#8aa520] hover:bg-[#687c17]'
                      } text-white shadow-sm transition disabled:opacity-30`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-[#dce1d5] space-y-3">
          {activeSelections.length > 0 && (
            <div className="rounded-xl border border-[#dce1d5] bg-[#f0f1e9] p-3 text-xs space-y-1.5 text-[#6d766d]">
              <div className="flex justify-between font-bold text-[#17211b]">
                <span>Order Total (inc. fees)</span>
                <span>
                  {currencySymbol} {total.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={isProcessing || activeSelections.length === 0}
            onClick={handleCheckoutClick}
            className="w-full rounded-full bg-[#17211b] py-3.5 text-xs font-bold text-white transition hover:bg-[#25332b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#d6f94a] mx-auto" />
            ) : total === 0 ? (
              <span>Reserve a Spot</span>
            ) : (
              <span>Continue to Checkout</span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 text-[10px] text-[#6d766d]">
          <span className="inline-flex items-center justify-center gap-1">
            Powered by{' '}
            <div className="text-[#17211b]">
              <Logo width={50} />
            </div>
          </span>
          <a
            href={`${typeof window !== 'undefined' ? window.location.origin : ''}/events/${event.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 text-[#ff5500]"
          >
            View Event Page <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>

      {isDrawerOpen && (
        <div
          className={`absolute inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isDrawerVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeDrawer}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative flex h-full w-full flex-col justify-between overflow-y-auto bg-[#fffef9] p-5 shadow-2xl transition-transform duration-300 ease-out ${
              isDrawerVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#dce1d5] pb-3">
                <h3 className="text-base font-bold text-[#17211b]">
                  Guest Checkout
                </h3>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full p-1 text-[#6d766d] bg-[#f0f1e9] hover:bg-black hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="my-3 rounded-xl border border-[#dce1d5] bg-[#f0f1e9] p-3 text-xs">
                <p className="font-bold text-[#17211b]">Order Summary</p>
                <div className="mt-1.5 space-y-1 text-[#6d766d]">
                  {activeSelections.map(({ tier, quantity }) => (
                    <div key={tier.id} className="flex justify-between">
                      <span>
                        {tier.name} (x{quantity})
                      </span>
                      <span>
                        {currencySymbol}{' '}
                        {(Number(tier.price) * quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>Platform fee</span>
                    <span>
                      {currencySymbol} {Number(platformFee).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#dce1d5] pt-1.5 font-bold text-[#17211b]">
                    <span>Total Due</span>
                    <span>
                      {currencySymbol} {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <form
                id="embed-guest-form"
                onSubmit={handleSubmit(processCheckout)}
                className="space-y-3 mt-4"
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
                  label="Phone Number"
                  error={errors.phone?.message}
                />

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#17211b]">
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
                          onClick={() =>
                            setValue(
                              'gender',
                              item.value as 'MALE' | 'FEMALE' | 'OTHER',
                              { shouldValidate: true },
                            )
                          }
                          className={`rounded-xl border py-1.5 text-xs font-bold transition ${
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
                </div>
              </form>
            </div>

            <div className="border-t border-[#dce1d5] pt-3 mt-4">
              <button
                type="submit"
                form="embed-guest-form"
                disabled={isProcessing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-3 text-xs font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#d6f94a]" />
                ) : (
                  <span>{total === 0 ? 'Reserve Ticket' : 'Pay Now'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
