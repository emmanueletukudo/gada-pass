'use client';

import { useForm } from 'react-hook-form';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { GadaInput } from '@/components/common/gada-inputs';
import { PaymentSettingsStep } from '@/components/dashboard/events/payment';
import { SettingsSkeleton } from '@/components/dashboard/common/settings-skeleton';
import { OrganizationLogoSettings } from '@/components/common/organization-logo-settings';

interface SettingsFormValues {
  hostName: string;
  payoutAccount: string;
  supportEmail: string;
}

interface SettlementAccountValues {
  id: string;
  bankName: string;
  accountName: string;
  isDefault: boolean;
}

export default function OrganizerSettingsPage() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [isSaving, setIsSaving] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string>('');

  const {
    register: field,
    handleSubmit,
    reset: resetProfileForm,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    defaultValues: {
      hostName: '',
      payoutAccount: '',
      supportEmail: '',
    },
  });

  const settlementForm = useForm<SettlementAccountValues>({
    defaultValues: {
      id: '',
      accountName: '',
      bankName: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (user) {
      resetProfileForm({
        hostName: user.hostName || '',
        payoutAccount: '',
        supportEmail: user.email || '',
      });

      setCurrentLogoUrl(user.logoUrl as string);
    }
  }, [user, resetProfileForm]);

  const onSettingsSubmit = async (values: SettingsFormValues) => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Workspace preferences updated successfully.');
    } catch {
      toast.error('Failed to commit structural workspace modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-0">
      {/* Responsive layout wrapper: stacks on mobile/tablet, side-by-side on lg+ desktop */}
      <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-10 mt-6 lg:mt-10">
        <div className="w-full max-w-lg lg:max-w-none">
          <h2 className="text-xl font-bold tracking-tight">Settings</h2>
          <form
            onSubmit={handleSubmit(onSettingsSubmit)}
            className="space-y-6 rounded-2xl mt-5 border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm"
          >
            <OrganizationLogoSettings currentLogoUrl={currentLogoUrl} />
            <div className="space-y-4">
              <GadaInput
                register={field}
                name="hostName"
                type="text"
                label="Host Name"
                placeHolder="e.g. Eclipse Entertainment Group"
                required
                error={errors.hostName?.message}
              />

              <GadaInput
                register={field}
                name="supportEmail"
                type="email"
                label="Email Address"
                placeHolder="support@yourstudio.com"
                disabled
                required
                error={errors.supportEmail?.message}
              />
            </div>

            <div className="pt-4 border-[#dce1d5] flex justify-end">
              <button
                disabled={isSaving}
                className="w-full sm:w-auto rounded-full bg-[#17211b] px-6 py-3 text-sm font-bold text-white transition disabled:opacity-40 hover:bg-[#25332b]"
              >
                {isSaving ? 'Saving Configurations...' : 'Update Settings'}
              </button>
            </div>
          </form>
        </div>

        <div className="w-full max-w-lg mt-0 lg:mt-10">
          <PaymentSettingsStep mode="settings" form={settlementForm} />
        </div>
      </div>
    </div>
  );
}
