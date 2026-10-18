'use client';

import { use, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Loader2,
  Save,
} from 'lucide-react';

import { api } from '@/lib/api';
import { PaymentSettingsStep } from '@/components/dashboard/events/payment';
import { EventFormDataPreview } from '@/components/dashboard/events/preview/types';
import { StepIndicator } from '@/components/dashboard/events/create/StepIndicator';
import { Step1Details } from '@/components/dashboard/events/create/Step1Details';
import { Step2DateLocation } from '@/components/dashboard/events/create/Step2DateLocation';
import { Step3Tickets } from '@/components/dashboard/events/create/Step3Tickets';
import { EventPreviewStep } from '@/components/dashboard/events/preview';

import {
  eventFormSchema,
  EventFormValues,
  STEP_FIELDS,
} from '@/components/dashboard/events/create/schema';
import { updateEvent } from '@/lib/event';
import { EditEventSkeleton } from '@/components/dashboard/common/edit-event-skeleton';
import { EVENT_TYPES } from '@/components/dashboard/events/create/types';

const STEP_LABELS = [
  'Event Type',
  'Details',
  'Date & Location',
  'Tickets',
  'Payment Settings',
  'Review & Save',
];

interface EditEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = use(params);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onTouched',
    defaultValues: {
      coverImageUrl: '',
      coverImageFiles: [],
      title: '',
      description: '',
      eventType: 'PARTY_SCENES',
      slug: '',
      coverFees: false,
      categoryId: '',
      city: '',
      startDate: '',
      endDate: '',
      venue: '',
      isOnline: false,
      meetingLink: '',
      virtualPlatform: 'ZOOM',
      meetingPasscode: '',
      capacity: 100,
      instagram: '',
      x: '',
      website: '',
      ticketTiers: [
        {
          name: 'Regular Pass',
          price: 0,
          quantity: 100,
          isMultiDay: false,
          maxScansPerDay: 1,
          validDate: '',
        },
      ],
      settlementAccountId: '',
      settlementAccount: {},
    },
  });

  const { trigger, handleSubmit, watch, reset, setValue } = form;

  const fetchEventDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api<any>(`/organizer/events/${eventId}`);

      const existingCoverUrl =
        data.banner ||
        (Array.isArray(data.images) && data.images.length > 0
          ? data.images[0].url
          : '') ||
        '';

      reset({
        title: data.name || '',
        description: data.description || '',
        eventType: data.eventType || 'PARTY_SCENES',
        slug: data.slug || '',
        coverFees: data.coverFees ?? false,
        categoryId: data.categoryId || '',
        city: data.city || '',
        venue: data.venue || '',
        startDate: data.startsAt
          ? new Date(data.startsAt).toISOString().slice(0, 16)
          : '',
        endDate: data.endsAt
          ? new Date(data.endsAt).toISOString().slice(0, 16)
          : '',
        isOnline: data.isOnline ?? false,
        meetingLink: data.meetingLink || '',
        virtualPlatform: data.virtualPlatform || 'ZOOM',
        meetingPasscode: data.meetingPasscode || '',
        capacity: data.capacity || 100,
        instagram: data.instagram || '',
        x: data.twitter || data.x || '',
        website: data.website || '',
        coverImageUrl: existingCoverUrl,
        coverImageFiles: [],
        settlementAccountId: data.settlementAccountId || '',
        settlementAccount: data.settlementAccount || {},
        ticketTiers: data.ticketTiers?.length
          ? data.ticketTiers.map((tier: any) => ({
              id: tier.id,
              name: tier.name,
              price: Number(tier.price),
              quantity: Number(tier.quantity),
              isMultiDay: tier.isMultiDay ?? false,
              maxScansPerDay: tier.maxScansPerDay
                ? Number(tier.maxScansPerDay)
                : 1,
              validDate: tier.validDate
                ? new Date(tier.validDate).toISOString().slice(0, 10)
                : '',
            }))
          : [
              {
                name: 'Regular Pass',
                price: 0,
                quantity: 100,
                isMultiDay: false,
                maxScansPerDay: 1,
                validDate: '',
              },
            ],
      });
    } catch (err) {
      toast.error('Failed to fetch event parameters.');
      console.error('Error fetching event:', err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, reset]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[step];
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setStep((prev) => prev + 1);
    } else {
      toast.error('Please fix highlighted errors before continuing.');
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onFinalSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
      const imageFiles: File[] = values.coverImageFiles ?? [];
      const isOnline =
        values.eventType === 'ONLINE_EVENT' || Boolean(values.isOnline);

      await updateEvent(eventId, {
        name: values.title,
        description: values.description,
        eventType: values.eventType,
        slug: values.slug,
        coverFees: values.coverFees ?? false,
        categoryId: values.categoryId,
        city: values.city,
        venue: values.venue,
        startsAt: values.startDate,
        endsAt: values.endDate,
        capacity:
          values.capacity ||
          values.ticketTiers.reduce((acc, cur) => acc + cur.quantity, 0),
        isOnline,
        meetingLink: isOnline ? values.meetingLink : undefined,
        virtualPlatform: isOnline ? values.virtualPlatform : undefined,
        meetingPasscode: isOnline ? values.meetingPasscode : undefined,
        settlementAccountId:
          values.eventType === 'FREE_EVENT'
            ? undefined
            : values.settlementAccountId,
        instagram: values.instagram || undefined,
        x: values.x || undefined,
        website: values.website || undefined,
        images: imageFiles,
        banner: values.coverImageUrl || undefined,
        ticketTiers: values.ticketTiers.map((tier) => ({
          id: tier.id,
          name: tier.name,
          price: values.eventType === 'FREE_EVENT' ? 0 : Number(tier.price),
          quantity: Number(tier.quantity),
          isMultiDay: Boolean(tier.isMultiDay),
          maxScansPerDay: tier.maxScansPerDay ? Number(tier.maxScansPerDay) : 1,
          validDate: tier.validDate || undefined,
        })),
      });

      toast.success('Event updated successfully!');
      router.push(`/dashboard/organizer/events/${eventId}`);
    } catch (err) {
      toast.error('Failed to update event parameters.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFormValues = watch();

  const effectiveCoverImage = useMemo(() => {
    if (
      currentFormValues.coverImageFiles &&
      currentFormValues.coverImageFiles.length > 0
    ) {
      const file = currentFormValues.coverImageFiles[0];
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }
    }
    return currentFormValues.coverImageUrl || '';
  }, [currentFormValues.coverImageFiles, currentFormValues.coverImageUrl]);

  const previewDataAdapter: EventFormDataPreview = {
    title: currentFormValues.title || 'Untitled Event',
    category: currentFormValues.categoryId || 'General',
    description: currentFormValues.description || '',
    coverImageUrl: effectiveCoverImage,
    startDate: currentFormValues.startDate,
    endDate: currentFormValues.endDate || currentFormValues.startDate,
    slug: currentFormValues.slug,
    locationType:
      currentFormValues.eventType === 'ONLINE_EVENT' ||
      currentFormValues.isOnline
        ? 'ONLINE'
        : 'VENUE',
    settlementAccountId: currentFormValues.settlementAccountId,
    venueName: currentFormValues.venue,
    venueAddress: currentFormValues.venue,
    ticketTiers: (currentFormValues.ticketTiers || []).map((tier, idx) => ({
      id: tier.id || String(idx),
      name: tier.name,
      price:
        currentFormValues.eventType === 'FREE_EVENT' ? 0 : Number(tier.price),
      quantity: Number(tier.quantity),
      isMultiDay: Boolean(tier.isMultiDay),
      maxScansPerDay: tier.maxScansPerDay ? Number(tier.maxScansPerDay) : 1,
      validDate: tier.validDate || undefined,
    })),
    settlementAccount: currentFormValues.settlementAccount && {
      bankName: currentFormValues.settlementAccount.bankName,
      accountName: currentFormValues.settlementAccount.accountName,
      accountNumber: currentFormValues.settlementAccount.accountNumber,
    },
    isPublic: true,
  };

  if (isLoading) {
    return <EditEventSkeleton />;
  }

  return (
    <div className="mx-auto mt-6 px-4 pb-16">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#dce1d5] pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-[#17211b]">
            Modify Event Information
          </h1>
          <p className="text-sm font-semibold text-[#6d766d]">
            Update event type, ticket tiers, virtual links, dates, or settlement
            account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/organizer/events/${eventId}`)
            }
            className="inline-flex items-center gap-2 rounded-full border border-[#dce1d5] bg-[#fffef9] px-4 py-2 text-xs font-bold text-[#17211b] transition hover:border-[#17211b]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit(onFinalSubmit)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-[#17211b] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Quick Save</span>
          </button>
        </div>
      </div>

      <StepIndicator currentStep={step} stepLabels={STEP_LABELS} />
      <form onSubmit={handleSubmit(onFinalSubmit)} className="mt-6 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#17211b]">
                Select Experience Type
              </h2>
              <p className="text-sm text-[#6d766d]">
                Choose the format that best fits your event.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EVENT_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = watch('eventType') === type.id;

                return (
                  <div
                    key={type.id}
                    onClick={() => {
                      setValue('eventType', type.id, { shouldValidate: true });
                      setStep(2);
                    }}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-6 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#17211b] bg-[#17211b]/5 shadow-md ring-2 ring-[#17211b]'
                        : 'border-[#dce1d5] bg-[#fffef9] hover:border-[#17211b] hover:shadow-sm'
                    }`}
                  >
                    <div className="space-y-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${type.accent}`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#17211b]">
                          {type.title}
                        </h3>
                        <p className="mt-1 text-xs text-[#6d766d]">
                          {type.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end text-xs font-bold text-[#17211b]">
                      <span className="opacity-0 transition group-hover:opacity-100">
                        Select
                      </span>
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {step === 2 && <Step1Details form={form} />}
        {step === 3 && <Step2DateLocation form={form} />}
        {step === 4 && <Step3Tickets form={form} />}
        {step === 5 && <PaymentSettingsStep form={form} />}
        {step === 6 && (
          <EventPreviewStep
            formData={previewDataAdapter}
            onBack={handlePrev}
            onPublish={handleSubmit(onFinalSubmit)}
            onSaveDraft={() => toast.info('Changes stored in draft state.')}
            isSubmitting={isSubmitting}
          />
        )}

        {step < 6 && (
          <div className="mt-10 flex items-center justify-between border-[#dce1d5] pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-2 rounded-full border border-[#dce1d5] bg-[#fffef9] px-5 py-3 text-xs font-bold text-[#17211b] transition hover:border-[#17211b]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-full bg-[#17211b] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#25332b]"
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}