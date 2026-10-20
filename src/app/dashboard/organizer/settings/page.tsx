'use client';

import { useForm } from 'react-hook-form';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GadaInput } from '@/components/common/gada-inputs';
import { PaymentSettingsStep } from '@/components/dashboard/events/payment';
import { SettingsSkeleton } from '@/components/dashboard/common/settings-skeleton';
import { OrganizationLogoSettings } from '@/components/common/organization-logo-settings';
import { useSettlementStore } from '@/stores/use-settlement-store';

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
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const resetBanner = useSettlementStore((s) => s.resetBanner);

  const [isSaving, setIsSaving] = useState(false);

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
    }
  }, [user, resetProfileForm]);

  const onSettingsSubmit = async (values: SettingsFormValues) => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Workspace preferences updated successfully.');
    } catch {
      toast.error('Failed to commit workspace modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = async (newLogoUrl: string | null) => {
    await updateSession({
      ...session,
      user: {
        ...session?.user,
        logoUrl: newLogoUrl,
      },
    });

    void queryClient.invalidateQueries({ queryKey: ['current-user'] });
  };

  const handleSettlementAccountUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['settlement-accounts'] });
    resetBanner();
  };

  if (isUserLoading || !user) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-0">
      <div className="mt-6 flex flex-col items-center justify-center gap-10 lg:mt-10 lg:flex-row lg:items-start">
        <div className="w-full max-w-lg lg:max-w-none">
          <h2 className="text-xl font-bold tracking-tight">Settings</h2>
          <form
            onSubmit={handleSubmit(onSettingsSubmit)}
            className="mt-5 space-y-6 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm"
          >
            <OrganizationLogoSettings
              key={user.email || 'logo-settings'}
              currentLogoUrl={user.logoUrl as string}
              onLogoChange={handleLogoChange}
            />
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

            <div className="flex justify-end pt-4 border-[#dce1d5]">
              <button
                disabled={isSaving}
                className="w-full rounded-full bg-[#17211b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#25332b] disabled:opacity-40 sm:w-auto"
              >
                {isSaving ? 'Saving Configurations...' : 'Update Settings'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-0 w-full max-w-lg lg:mt-10">
          <PaymentSettingsStep
            mode="settings"
            form={settlementForm}
            onSuccess={handleSettlementAccountUpdated}
          />
        </div>
      </div>
    </div>
  );
}
