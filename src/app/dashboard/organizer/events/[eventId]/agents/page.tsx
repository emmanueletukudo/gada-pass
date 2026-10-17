'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { UserPlus, RefreshCw, X, Radio, Clock, Mail } from 'lucide-react';
import { Agent, AgentInvitation, EventAgentsResponse } from './types';
import { EventAgentsSkeleton } from '@/components/dashboard/common/event-agents-skeleton';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventAgentsPage({ params }: PageProps) {
  const { eventId } = use(params);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [invitations, setInvitations] = useState<AgentInvitation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Separate loading states for revoking active agents vs canceling invites
  const [revokingAgentId, setRevokingAgentId] = useState<string | null>(null);
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);

  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api<EventAgentsResponse>(`/agents/events/${eventId}`);
      setAgents(data.agents || []);
      setInvitations(data.invitations || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load gate operators');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchData();
    }
  }, [eventId, fetchData]);

  const handleInviteAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api('/agents/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, fullName, email }),
      });
      toast.success(`Invitation sent to ${email}`);
      setShowOnboardModal(false);
      setFullName('');
      setEmail('');
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revoke an active assigned agent's access
  const handleRevokeAssignedAgent = async (agentId: string) => {
    try {
      setRevokingAgentId(agentId);
      // Adjust endpoint if your backend route differs (e.g. PATCH or DELETE on event agents)
      await api(`/agents/events/${eventId}/agents/${agentId}`, {
        method: 'DELETE',
      });
      toast.success('Agent access revoked successfully.');
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to revoke agent access.');
    } finally {
      setRevokingAgentId(null);
    }
  };

  // Cancel/Revoke a pending invitation
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      setRevokingInviteId(invitationId);
      await api(`/agents/invitations/${invitationId}`, { method: 'DELETE' });
      toast.success('Invitation cancelled successfully.');
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to cancel invitation.');
    } finally {
      setRevokingInviteId(null);
    }
  };

  const activeAgentsCount = agents.filter((a) => a.isActive).length;
  const pendingInvitesCount = invitations.length;

  if (isLoading && agents.length === 0 && invitations.length === 0) {
    return <EventAgentsSkeleton />;
  }

  return (
    <div className="space-y-6 mt-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center pb-4 border-b border-[#dce1d5]">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Gate Access Operations
          </h2>
          <p className="text-sm text-[#6d766d]">
            Manage authorized scanner terminals and agent permissions for this
            event.
          </p>
        </div>
        <div className="flex flex-row gap-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#dce1d5] bg-white hover:bg-[#17211b]/5 transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw
              className={`h-4 w-4 text-[#17211b] ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={() => setShowOnboardModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#17211b] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#25332b]"
          >
            <UserPlus className="h-4 w-4" />
            <span className="text-sm">Invite Agent</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#d6f94a] bg-[#d6f94a] p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
            Active Terminals
          </p>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-black animate-pulse fill-black" />
            <span className="text-xl font-bold">
              {activeAgentsCount} Active
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
            Total Assigned
          </p>
          <span className="text-xl font-bold text-[#17211b]">
            {agents.length} Agents
          </span>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
            Pending Invitations
          </p>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-black" />
            <span className="text-xl font-bold text-[#17211b]">
              {pendingInvitesCount}
            </span>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6d766d]">
          Assigned Operators ({agents.length})
        </h3>

        {agents.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-[#f7f7f2] border border-[#dce1d5] text-xs font-semibold text-[#6d766d]">
            No operators currently assigned to this event.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-[#dce1d5] text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
                  <th className="pb-3 pr-4">Agent Name</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Clearance</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce1d5]">
                {agents.map((agent) => (
                  <tr
                    key={agent.id}
                    className="hover:bg-[#17211b]/5 transition-colors"
                  >
                    <td className="py-3 pr-4 font-bold text-[#17211b]">
                      {[agent.user?.firstName, agent.user?.lastName]
                        .filter(Boolean)
                        .join(' ') || 'Gate Agent'}
                    </td>
                    <td className="py-3 px-4 text-[#6d766d]">
                      {agent.user?.email || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-[#17211b]">
                      {agent.clearanceLevel || 'Standard'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          agent.isActive
                            ? 'bg-[#d6f94a]/30 text-[#17211b]'
                            : 'bg-[#c34837]/10 text-[#c34837]'
                        }`}
                      >
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      {agent.isActive ? (
                        <button
                          onClick={() => handleRevokeAssignedAgent(agent.id)}
                          disabled={revokingAgentId === agent.id}
                          className="rounded-lg border border-[#c34837]/20 px-3 py-1 text-xs font-bold text-[#c34837] hover:border-[#c34837] hover:bg-[#c34837]/5 transition-colors disabled:opacity-50"
                        >
                          {revokingAgentId === agent.id
                            ? 'Revoking...'
                            : 'Revoke Access'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-[#c34837]">
                          Revoked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {invitations.length > 0 && (
        <section className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6d766d] flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            Pending Invitations ({invitations.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-[#dce1d5] text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
                  <th className="pb-3 pr-4">Invited Email</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Sent Date</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce1d5]">
                {invitations.map((invitation) => (
                  <tr
                    key={invitation.id}
                    className="hover:bg-[#17211b]/5 transition-colors"
                  >
                    <td className="py-3 pr-4 font-bold text-[#17211b]">
                      {invitation.email}
                    </td>
                    <td className="py-3 px-4 text-[#6d766d]">
                      {invitation.role || 'Gate Operator'}
                    </td>
                    <td className="py-3 px-4 text-[#6d766d]">
                      {invitation.createdAt
                        ? new Date(invitation.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700">
                        <Clock className="h-2.5 w-2.5" />
                        {invitation.status}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        disabled={revokingInviteId === invitation.id}
                        className="rounded-lg border border-[#dce1d5] px-3 py-1 text-xs font-bold text-[#6d766d] hover:bg-[#17211b]/5 transition-colors disabled:opacity-50"
                      >
                        {revokingInviteId === invitation.id
                          ? 'Cancelling...'
                          : 'Cancel'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowOnboardModal(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dce1d5] pb-3">
              <h3 className="text-sm font-bold">Invite Gate Agent</h3>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="p-1 rounded-lg border border-[#dce1d5] hover:bg-[#17211b]/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleInviteAgent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17211b] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-xl border border-[#dce1d5] px-3 py-2 text-xs font-medium outline-none focus:border-[#17211b]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17211b] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. agent@domain.com"
                  className="w-full rounded-xl border border-[#dce1d5] px-3 py-2 text-xs font-medium outline-none focus:border-[#17211b]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="rounded-full border border-[#dce1d5] px-4 py-2 text-xs font-bold text-[#17211b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[#17211b] px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
                >
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
