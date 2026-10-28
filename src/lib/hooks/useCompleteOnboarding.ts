import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { User } from 'next-auth';
import { api } from '../hooks-new/api';

export function useCompleteOnboarding() {
  const { update } = useSession();
  const router = useRouter();

  const submitOnboarding = async (values: any) => {
    try {
      const response = await api<{ accessToken: string; user: User }>(
        '/auth/complete-onboarding',
        {
          method: 'POST',
          body: JSON.stringify({
            phone: values.phone,
            hostName: values.hostName,
            accountType: values.accountType,
            password: values.password,
          }),
        },
      );

      if (response?.accessToken) {
        await update({
          accessToken: response.accessToken,
          user: response.user,
        });

        toast.success('Onboarding completed successfully!');
        const dashboardPath =
          response.user.role === 'ORGANIZER'
            ? '/organizer/dashboard'
            : '/attendee/dashboard';
        router.push(dashboardPath);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete onboarding');
    }
  };

  return { submitOnboarding };
}
