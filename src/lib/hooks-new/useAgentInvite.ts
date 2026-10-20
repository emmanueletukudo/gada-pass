import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from './useApi';

export type InviteInfo = {
  email: string;
  eventName: string;
  isExistingUser: boolean;
};

interface AcceptInviteInput {
  token: string;
  password?: string;
}

interface AcceptInviteResponse {
  message: string;
  eventId: string;
  userId: string;
}

export function useInviteInfo(token: string | null) {
  return useQuery({
    queryKey: ['agent-invite-info', token],
    queryFn: () => api<InviteInfo>(`/agents/invite-info?token=${token}`),
    enabled: Boolean(token && token.trim().length > 0),
    retry: false,
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (body: AcceptInviteInput) =>
      api<AcceptInviteResponse>('/agents/accept', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
}
