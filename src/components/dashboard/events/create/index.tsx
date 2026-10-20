'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, ArrowRight } from 'lucide-react';

import { PaymentSettingsStep } from '@/components/dashboard/events/payment';
import { eventFormSchema, EventFormValues, STEP_FIELDS } from './schema';
import { Step1Details } from './Step1Details';
import { Step2DateLocation } from './Step2DateLocation';
import { Step3Tickets } from './Step3Tickets';
import { StepIndicator } from './StepIndicator';
import { EventFormDataPreview } from '../preview/types';
import { EventPreviewStep } from '../preview';

import { useEventFormStore } from '@/stores/use-event-form-store';
import { useCreateEvent, usePublishEvent } from '@/lib/hooks-new/useEvents';
import { EVENT_TYPES } from './types';

const STEP_LABELS = [
  'Event Type',
  'Details',
  'Date & Location',
  'Tickets',
  'Payment Settings',
  'Review',
];

export default function CreateEventMultiStepPage() {
  const router = useRouter();
  const { step, setStep, nextStep, prevStep, resetForm } = useEventFormStore();
  const createEventMutation = useCreateEvent();
  const publishEventMutation = usePublishEvent();

  const isSubmitting =
    createEventMutation.isPending || publishEventMutation.isPending;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onTouched',
    defaultValues: {
      eventType: '',
      coverImageUrl: '',
      title: '',
      slug: '',
      coverFees: false,
      description: '',
      categoryId: '',
      city: '',
      startDate: '',
      endDate: '',
      venue: '',
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
        },
      ],
      settlementAccountId: '',
      settlementAccount: {},
    },
  });

  const { trigger, handleSubmit, watch, setValue } = form;
  const selectedEventType = watch('eventType');

  const handleNext = async () => {
    if (step === 1 && !selectedEventType) {
      toast.error('Please select an event type to continue.');
      return;
    }

    const fieldsToValidate = STEP_FIELDS[step];
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid || step === 1) {
      nextStep();
    } else {
      toast.error('Please fix highlighted errors before continuing.');
    }
  };

  const onFinalSubmit = async (values: EventFormValues) => {
    try {
      const imageFiles: File[] = values.coverImageFiles ?? [];

      const createdEvent = await createEventMutation.mutateAsync({
        name: values.title,
        description: values.description,
        categoryId: values.categoryId as string,
        city: values.city,
        venue: values.venue,
        startsAt: values.startDate,
        endsAt: values.endDate,
        capacity: values.capacity,
        isOnline: values.eventType === 'ONLINE_EVENT',
        meetingLink: values.meetingLink,
        virtualPlatform: values.virtualPlatform,
        meetingPasscode: values.meetingPasscode,
        settlementAccountId:
          values.eventType === 'FREE_EVENT'
            ? undefined
            : values.settlementAccountId,
        instagram: values.instagram,
        x: values.x,
        website: values.website,
        images: imageFiles,
        ticketTiers: values.ticketTiers,
        slug: values.slug,
        coverFees: values.coverFees,
        eventType: values.eventType,
      });

      if (createdEvent?.id) {
        await publishEventMutation.mutateAsync(createdEvent.id);
        toast.success('Your experience is now live on Gada Pass!');
        resetForm();
        router.push('/dashboard/organizer/events');
      }
    } catch (err) {
      console.error('Failed to create and publish event:', err);
    }
  };

  const currentFormValues = watch();
  const previewDataAdapter: EventFormDataPreview = {
    title: currentFormValues.title || 'Untitled Event',
    category:
      currentFormValues.categoryId || currentFormValues.eventType || 'General',
    description: currentFormValues.description || '',
    coverImageUrl: currentFormValues.coverImageUrl,
    startDate: currentFormValues.startDate,
    endDate: currentFormValues.endDate || currentFormValues.startDate,
    locationType:
      currentFormValues.eventType === 'ONLINE_EVENT' ? 'ONLINE' : 'VENUE',
    eventType: currentFormValues.eventType,
    slug: currentFormValues.slug,
    coverFees: currentFormValues.coverFees,
    meetingLink: currentFormValues.meetingLink,
    virtualPlatform: currentFormValues.virtualPlatform,
    meetingPasscode: currentFormValues.meetingPasscode,
    settlementAccountId: currentFormValues.settlementAccountId,
    venueName: currentFormValues.venue,
    venueAddress: currentFormValues.venue,
    ticketTiers: (currentFormValues.ticketTiers || []).map((tier, idx) => ({
      id: String(idx),
      name: tier.name,
      price: Number(tier.price),
      quantity: Number(tier.quantity),
    })),
    settlementAccount: currentFormValues.settlementAccount && {
      bankName: currentFormValues.settlementAccount.bankName,
      accountName: currentFormValues.settlementAccount.accountName,
      accountNumber: currentFormValues.settlementAccount.accountNumber,
    },
    isPublic: true,
  };

  return (
    <div className="mx-auto mt-10 max-w-5xl px-4 pb-16">
      <StepIndicator currentStep={step} stepLabels={STEP_LABELS} />

      <form onSubmit={handleSubmit(onFinalSubmit)} className="mt-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#17211b]">
                What kind of event are you creating?
              </h2>
              <p className="text-sm text-[#6d766d]">
                We'll optimize the process based on your selection.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EVENT_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedEventType === type.id;

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
            onBack={prevStep}
            onPublish={handleSubmit(onFinalSubmit)}
            onSaveDraft={() => toast.info('Draft saved locally.')}
            isSubmitting={isSubmitting}
          />
        )}

        {step < 6 && (
          <div className="mt-10 flex items-center justify-between border-[#dce1d5] pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
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
              <span> Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
