import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AgentUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Agent {
  id: string;
  user?: AgentUser;
  clearanceLevel?: string;
  isActive: boolean;
}

export interface AgentInvitation {
  id: string;
  email: string;
  role?: string;
  createdAt?: string;
  status: string;
}

export interface EventAgentsResponse {
  agents: Agent[];
  invitations: AgentInvitation[];
}

interface InviteAgentInput {
  eventId: string;
  fullName: string;
  email: string;
}

export function useEventAgents(eventId: string) {
  return useQuery({
    queryKey: ['event-agents', eventId],
    queryFn: () => api<EventAgentsResponse>(`/agents/events/${eventId}`),
    enabled: Boolean(eventId),
  });
}

export function useInviteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, fullName, email }: InviteAgentInput) =>
      api('/agents/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, fullName, email }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-agents', variables.eventId],
      });
    },
  });
}

export function useRevokeAgentAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, agentId }: { eventId: string; agentId: string }) =>
      api(`/agents/events/${eventId}/agents/${agentId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-agents', variables.eventId],
      });
    },
  });
}

export function useCancelAgentInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      invitationId,
    }: {
      eventId: string;
      invitationId: string;
    }) => api(`/agents/invitations/${invitationId}`, { method: 'DELETE' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['event-agents', variables.eventId],
      });
    },
  });
}
