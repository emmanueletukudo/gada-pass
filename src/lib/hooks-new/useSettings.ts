import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './useApi';
import { toast } from 'sonner';

export function useUpdateLogoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logoUrl: string | null) => {
      await api('/users/profile/logo', {
        method: 'PATCH',
        body: JSON.stringify({ logoUrl }),
      });
      return logoUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to update logo';
      toast.error(message);
    },
  });
}

export function useRemoveLogoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api('/users/profile/logo', {
        method: 'PATCH',
        body: JSON.stringify({ logoUrl: null }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}
