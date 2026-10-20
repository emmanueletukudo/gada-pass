'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getDashboardPathForRole, useCompleteOnboarding } from '@/lib/hooks-new/useAuth';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/next-auth';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { GadaInput } from '@/components/common/gada-inputs';

const onboardingSchema = z.object({
  accountType: z.enum(['INDIVIDUAL', 'ORGANIZATION']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(7, 'Phone number is required'),
  hostName: z.string().min(1, 'Host name is required'),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingForm() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [step, setStep] = useState<number>(1);

  const completeOnboardingMutation = useCompleteOnboarding();

  const {
    register: field,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      accountType: 'INDIVIDUAL',
      firstName: '',
      lastName: '',
      phone: '',
      hostName: '',
    },
  });

  const firstNameValue = watch('firstName');

  useEffect(() => {
    if (firstNameValue && !watch('hostName')) {
      setValue('hostName', firstNameValue);
    }
  }, [firstNameValue, setValue, watch]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user) {
      if (!session.user.isNewUser && session.user.hostName) {
        const redirectPath = getDashboardPathForRole(
          session.user.role as UserRole,
        );
        router.push(redirectPath);
      } else {
        if (session.user.name) {
          const parts = session.user.name.split(' ');
          if (parts[0]) setValue('firstName', parts[0]);
          if (parts[1]) setValue('lastName', parts.slice(1).join(' '));
        }
      }
    }
  }, [status, session, router, setValue]);

  const handleNextStep = async () => {
    const isStepValid = await trigger([
      'accountType',
      'firstName',
      'lastName',
      'phone',
    ]);

    if (!isStepValid) {
      toast.error('Please fill in all required fields correctly.');
      return;
    }
    setStep(2);
  };

  const submit = async (values: OnboardingValues) => {
    completeOnboardingMutation.mutate(
      {
        phone: values.phone,
        hostName: values.hostName,
        accountType: values.accountType,
      },
      {
        onSuccess: async (response) => {
          if (response?.user) {
            await update({
              ...session,
              user: {
                ...session?.user,
                role: response.user.role,
                hostName: response.user.hostName,
                isNewUser: false,
              },
            });

            const dashboardPath =
              response.user.role === 'ORGANIZER'
                ? '/dashboard/organizer'
                : '/dashboard/attendee';

            router.push(dashboardPath);
            router.refresh();
          }
        },
      },
    );
  };

  if (status === 'loading') {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-12 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded-2xl" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded-2xl" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded-2xl" />
          </div>

          <div className="h-12 w-full bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6d766d]">
              Step 1 of 2
            </span>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wider text-[#6d766d]">
              Account Type
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['INDIVIDUAL', 'ORGANIZATION'] as const).map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#dce1d5] bg-[#fffef9] py-3 text-xs font-bold has-checked:border-[#17211b] has-checked:bg-[#d6f94a]"
                >
                  <input
                    {...field('accountType')}
                    type="radio"
                    value={type}
                    className="sr-only"
                  />
                  {type === 'INDIVIDUAL' ? 'Individual' : 'Organization'}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <GadaInput
              register={field}
              name="firstName"
              type="text"
              placeHolder="First name"
              label="First Name"
              required
              error={errors.firstName?.message}
            />
            <GadaInput
              register={field}
              name="lastName"
              type="text"
              placeHolder="Last name"
              label="Last Name"
              required
              error={errors.lastName?.message}
            />
          </div>

          <GadaInput
            register={field}
            name="phone"
            type="tel"
            placeHolder="Phone Number"
            label="Phone Number"
            required
            error={errors.phone?.message}
          />

          <button
            type="button"
            onClick={handleNextStep}
            className="w-full rounded-full bg-[#17211b] py-4 font-bold text-white transition hover:bg-[#25332b]"
          >
            Next Step
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#6d766d] hover:text-[#17211b]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <span className="text-xs font-semibold text-[#6d766d]">
              Step 2 of 2
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-[#17211b]">
                Host Name
              </label>
              <div className="group relative flex items-center">
                <Info className="h-3.5 w-3.5 text-[#6d766d] cursor-pointer hover:text-[#17211b]" />
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#17211b] px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  This will be shown on the ticket
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-[#17211b]" />
                </div>
              </div>
            </div>

            <GadaInput
              register={field}
              name="hostName"
              type="text"
              placeHolder="Host / Display Name"
              required
              error={errors.hostName?.message}
            />
          </div>

          <button
            disabled={completeOnboardingMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-4 font-bold text-white disabled:opacity-50 transition hover:bg-[#25332b]"
          >
            {completeOnboardingMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#d6f94a]" />
            ) : (
              <span>Complete Onboarding</span>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
