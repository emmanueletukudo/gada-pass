'use client';

import { useForm } from 'react-hook-form';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useUpdateProfile } from '@/lib/hooks-new/useUpdateProfile';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { GadaInput } from '@/components/common/gada-inputs';
import { SettingsSkeleton } from '@/components/dashboard/common/settings-skeleton';
import { Loader2 } from 'lucide-react';

interface AttendeeSettingsFormValues {
  firstName: string;
  lastName: string;
  hostName: string;
  phone: string;
  email: string;
}

export default function AttendeeSettingsPage() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  const {
    register: field,
    handleSubmit,
    reset: resetProfileForm,
    formState: { errors, isDirty },
  } = useForm<AttendeeSettingsFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      hostName: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        hostName: user.hostName || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user, resetProfileForm]);

  const onSettingsSubmit = (values: AttendeeSettingsFormValues) => {
    updateProfileMutation.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        hostName: values.hostName,
        phone: values.phone,
      },
      {
        onSuccess: () => {
          toast.success('Profile settings updated successfully.');
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to update profile settings.',
          );
        },
      },
    );
  };

  if (isUserLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-10 px-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#17211b]">
          Account Settings
        </h2>
        <p className="text-xs text-[#6d766d] mt-1">
          Manage your personal profile information and display preferences.
        </p>

        <form
          onSubmit={handleSubmit(onSettingsSubmit)}
          className="space-y-6 rounded-3xl mt-5 border border-[#dce1d5] bg-[#fffef9] p-8 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <GadaInput
              register={field}
              name="firstName"
              type="text"
              label="First Name"
              placeHolder="Enter first name"
              required
              error={errors.firstName?.message}
            />
            <GadaInput
              register={field}
              name="lastName"
              type="text"
              label="Last Name"
              placeHolder="Enter last name"
              required
              error={errors.lastName?.message}
            />
          </div>

          <div className="space-y-4">
            <GadaInput
              register={field}
              name="hostName"
              type="text"
              label="Host / Display Name"
              placeHolder="Name shown on tickets and events"
              required
              error={errors.hostName?.message}
            />

            <GadaInput
              register={field}
              name="phone"
              type="tel"
              label="Phone Number"
              placeHolder="Enter phone number"
              required
              error={errors.phone?.message}
            />

            <GadaInput
              register={field}
              name="email"
              type="email"
              label="Email Address"
              placeHolder="your@email.com"
              disabled
              required
              error={errors.email?.message}
            />
          </div>

          <div className="pt-4 border-t border-[#dce1d5] flex justify-end">
            <button
              disabled={updateProfileMutation.isPending || !isDirty}
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#17211b] px-6 py-3 text-sm font-bold text-white transition disabled:opacity-40 hover:bg-[#25332b]"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#d6f94a]" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Update Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
