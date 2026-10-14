'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Minus, TicketPlus } from 'lucide-react';
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
};

interface TicketCheckoutProps {
  eventId: string;
  tiers?: Tier[];
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

  const activeSelections = (tiers ?? [])
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
  const currencyCode = tiers[0]?.currency || 'NGN';

  const platformFee = subtotal > 0 ? subtotal * 0.05 + 100 : 0;
  const total = subtotal + platformFee;

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

    const email = user?.email || guestData?.email;

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
        fullName: isAuthenticated ? undefined : guestData?.fullName?.trim(),
        phone: isAuthenticated
          ? undefined
          : guestData?.phone?.trim() || undefined,
        gender: isAuthenticated ? undefined : guestData?.gender,
      };

      if (total === 0) {
        await api(`/events/${eventId}/reserve`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        toast.success('Tickets reserved successfully! Check your email.');
        setIsDrawerOpen(false);

        if (isAuthenticated) {
          router.push('/dashboard/attendee');
        } else {
          reset();
          setQuantities({});
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

      window.location.href = initialized.authorization_url as string;

      // const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      // if (!publicKey) throw new Error('Paystack checkout is not configured');

      // const PaystackPop = (await import('@paystack/inline-js')).default;
      // const popup = new PaystackPop();

      // popup.newTransaction({
      //   key: publicKey,
      //   email,
      //   amount: initialized.amount ?? Math.round(total * 100),
      //   currency: initialized.currency ?? currencyCode,
      //   ref: initialized.reference,
      //   onSuccess: async () => {
      //     try {
      //       await api(`/events/${eventId}/reserve`, {
      //         method: 'POST',
      //         body: JSON.stringify({
      //           ...payload,
      //           paymentReference: initialized.reference,
      //         }),
      //       });

      //       toast.success(
      //         'Payment confirmed! Ticket details sent to your email.',
      //       );
      //       setIsDrawerOpen(false);

      //       if (isAuthenticated) {
      //         router.push('/dashboard/attendee');
      //       } else {
      //         reset();
      //         setQuantities({});
      //       }
      //     } catch (reserveError) {
      //       toast.error(
      //         reserveError instanceof Error
      //           ? reserveError.message
      //           : 'Failed to complete reservation.',
      //       );
      //     } finally {
      //       setIsProcessing(false);
      //     }
      //   },
      //   onCancel: () => {
      //     toast.error('Checkout cancelled');
      //     setIsProcessing(false);
      //   },
      // });
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

          return (
            <div
              key={tier.id}
              className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e6e8e3] bg-[#ffffff] p-5 shadow-sm transition-all sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${tier.name.toLocaleLowerCase().includes('vip') ? 'bg-[#ff765f]' : 'bg-[#8aa520]'}  text-white shadow-md`}
                >
                  <TicketPlus className="h-6 w-6" />
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xl font-bold tracking-tight text-[#1c1926]">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-[#73727a]">
                    {tier.description ||
                      `Standard ${tier.name} access to the event.`}
                  </p>
                  <span className="inline-block rounded-full bg-[#f2f4f0] px-3 py-0.5 text-[11px] font-medium text-[#5c5b63]">
                    {isSoldOut ? 'Sold Out' : `${available} remaining`}
                  </span>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9f9fa8]">
                    UNIT PRICE
                  </span>
                  <span className="text-2xl font-extrabold text-[#17211b]">
                    {currencySymbol}
                    {Number(tier.price).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 rounded-full border border-[#e3e6df] bg-[#f8f9f6] p-1.5">
                  <button
                    type="button"
                    disabled={isProcessing || currentQty <= 0}
                    onClick={() => handleQuantityChange(tier.id, -1, available)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f3ed] text-[#8e8d96] transition hover:bg-[#e4e7df] disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="w-5 text-center text-sm font-bold text-[#1c1926]">
                    {currentQty}
                  </span>

                  <button
                    type="button"
                    disabled={
                      isProcessing || isSoldOut || currentQty >= available
                    }
                    onClick={() => handleQuantityChange(tier.id, 1, available)}
                    className={`grid h-8 w-8 place-items-center rounded-full  ${tier.name.toLocaleLowerCase().includes('vip') ? 'bg-[#ff765f] hover:bg-[#d2614d]' : 'bg-[#8aa520] hover:bg-[#687c17]'} text-white shadow-sm transition disabled:opacity-30`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {isAuthenticated && total !== 0 && (
          <div className="my-4 rounded-xl border border-[#dce1d5] bg-[#f0f1e9] p-3.5 text-xs">
            <p className="font-bold text-lg text-[#17211b]">Order Summary</p>

            <div className="mt-2 space-y-1.5 text-[#6d766d]">
              {activeSelections.map(({ tier, quantity }) => (
                <div key={tier.id} className="flex justify-between">
                  <span className="text-md">
                    {tier.name} (x{quantity})
                  </span>
                  <span className="text-md">
                    {currencySymbol}{' '}
                    {(Number(tier.price) * quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-md">Platform & Service fee</span>
                <span className="text-md">
                  {currencySymbol} {Number(platformFee).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#dce1d5] pt-2 font-bold text-[#17211b]">
                <span className="text-md">Total Due (inc. fees)</span>
                <span className="text-md">
                  {currencySymbol} {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={isProcessing || isLoading || activeSelections.length === 0}
          onClick={handleCheckoutClick}
          className="w-full rounded-full bg-[#1c1926] py-3.5 text-sm font-bold text-white transition hover:bg-[#2b273b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing
            ? 'Processing...'
            : total === 0
              ? 'Reserve Tickets'
              : `Continue to Checkout`}
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
            onClick={(e) => e.stopPropagation()}
            className={`relative flex h-full w-full max-w-md flex-col justify-between overflow-y-auto bg-[#fffef9] p-6 shadow-2xl transition-transform duration-300 ease-out ${
              isDrawerVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div>
              <div className="flex items-center justify-between  border-[#dce1d5] pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#17211b]">
                    Guest Checkout
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full p-1.5 text-[#6d766d] bg-[#f0f1e9] hover:bg-black hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="my-4 rounded-xl border border-[#dce1d5] bg-[#f0f1e9] p-3.5 text-xs">
                <p className="font-bold text-lg text-[#17211b]">
                  Order Summary
                </p>

                <div className="mt-2 space-y-1.5 text-[#6d766d]">
                  {activeSelections.map(({ tier, quantity }) => (
                    <div key={tier.id} className="flex justify-between">
                      <span className="text-md">
                        {tier.name} (x{quantity})
                      </span>
                      <span className="text-md">
                        {currencySymbol}{' '}
                        {(Number(tier.price) * quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-md">Platform & Service fee</span>
                    <span className="text-md">
                      {currencySymbol} {Number(platformFee).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#dce1d5] pt-2 font-bold text-[#17211b]">
                    <span className="text-md">Total Due (inc. fees)</span>
                    <span className="text-md">
                      {currencySymbol} {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <form
                id="guest-checkout-form"
                onSubmit={handleSubmit(processCheckout)}
                className="space-y-4 mt-7"
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
                  <label className="block text-md text-[#17211b]">
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

            <div className=" border-[#dce1d5] pt-4 mt-6">
              <button
                type="submit"
                form="guest-checkout-form"
                disabled={isProcessing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-3.5 text-sm font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
              >
                <span>{isProcessing ? 'Processing...' : 'Pay Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
