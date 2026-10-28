'use client';

import {
  useState,
  use,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import {
  UserPlus,
  RefreshCw,
  X,
  Radio,
  Clock,
  Mail,
  Search,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { EventAgentsSkeleton } from '@/components/dashboard/common/event-agents-skeleton';
import {
  useEventAgents,
  useInviteAgent,
  useRevokeAgentAccess,
  useCancelAgentInvitation,
} from '@/lib/hooks-new/useEventAgents';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17211b]/40 focus-visible:ring-offset-2';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- helpers ---------- */

const getMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const humanize = (value?: string | null, fallback = '') => {
  if (!value) return fallback;
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const initialsOf = (name: string, email?: string) => {
  const source = name && name !== 'Gate agent' ? name : email || '?';
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (
    (parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[1][0] : '')
  ).toUpperCase();
};

function timeAgo(iso?: string) {
  if (!iso) return 'N/A';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}


function Avatar({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ${
        muted ? 'bg-[#f0f2ea] text-[#6d766d]' : 'bg-[#17211b] text-[#d6f94a]'
      }`}
    >
      {label}
    </span>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: 'active' | 'inactive' | 'pending';
  children: ReactNode;
}) {
  const styles = {
    active: 'bg-[#d6f94a]/40 text-[#17211b]',
    inactive: 'bg-[#c34837]/10 text-[#a63a2b]',
    pending: 'bg-amber-100 text-amber-800',
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {tone === 'pending' ? (
        <Clock className="h-3 w-3" aria-hidden="true" />
      ) : (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            tone === 'active' ? 'bg-emerald-600' : 'bg-[#c34837]'
          }`}
        />
      )}
      {children}
    </span>
  );
}

// Accessible modal: Escape to close, focus trap, scroll lock, focus restore.
// Bottom sheet on phones, centred dialog from sm up.
function Modal({
  titleId,
  onClose,
  children,
}: {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusables = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
            ),
          )
        : [];

    (
      panel?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0]
    )?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        onClick={() => closeRef.current()}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[#dce1d5] bg-[#fffef9] p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6"
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

type Confirm = { kind: 'revoke' | 'cancel'; id: string; label: string } | null;

export default function EventAgentsPage({ params }: PageProps) {
  const { eventId } = use(params);

  const { data, isLoading, refetch, isRefetching } = useEventAgents(eventId);
  const rawAgents = data?.agents;
  const rawInvitations = data?.invitations;
  const invitations = useMemo(() => rawInvitations || [], [rawInvitations]);

  const inviteAgentMutation = useInviteAgent();
  const revokeAgentMutation = useRevokeAgentAccess();
  const cancelInviteMutation = useCancelAgentInvitation();

  const [revokingAgentId, setRevokingAgentId] = useState<string | null>(null);
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const [confirm, setConfirm] = useState<Confirm>(null);
  const [query, setQuery] = useState('');

  /* ----- derived ----- */

  const agents = useMemo(() => {
    return (rawAgents || [])
      .map((a) => {
        const name =
          [a.user?.firstName, a.user?.lastName].filter(Boolean).join(' ') ||
          'Gate agent';
        return {
          id: a.id,
          name,
          email: a.user?.email || '',
          clearance: humanize(a.clearanceLevel, 'Standard'),
          isActive: !!a.isActive,
        };
      })
      .sort((x, y) =>
        x.isActive === y.isActive
          ? x.name.localeCompare(y.name)
          : x.isActive
            ? -1
            : 1,
      );
  }, [rawAgents]);

  const visibleAgents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
    );
  }, [agents, query]);

  const activeAgentsCount = agents.filter((a) => a.isActive).length;

  /* ----- actions ----- */

  const closeInvite = useCallback(() => {
    setShowInvite(false);
    setInviteError('');
  }, []);

  const handleInviteAgent = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');

    const name = fullName.trim();
    const address = email.trim().toLowerCase();

    if (!name) {
      setInviteError('Enter the agent’s full name.');
      return;
    }
    if (!EMAIL_RE.test(address)) {
      setInviteError('Enter a valid email address.');
      return;
    }
    if (agents.some((a) => a.email.toLowerCase() === address)) {
      setInviteError('This person is already assigned to the event.');
      return;
    }
    if (invitations.some((i) => i.email.toLowerCase() === address)) {
      setInviteError('This email already has a pending invitation.');
      return;
    }

    inviteAgentMutation.mutate(
      { eventId, fullName: name, email: address },
      {
        onSuccess: () => {
          toast.success(`Invitation sent to ${address}`);
          closeInvite();
          setFullName('');
          setEmail('');
        },
        onError: (error: unknown) => {
          const message = getMessage(error, 'Failed to send invitation.');
          setInviteError(message);
          toast.error(message);
        },
      },
    );
  };

  const revokeAgent = (agentId: string) => {
    setRevokingAgentId(agentId);
    revokeAgentMutation.mutate(
      { eventId, agentId },
      {
        onSuccess: () => toast.success('Agent access revoked.'),
        onError: (error: unknown) =>
          toast.error(getMessage(error, 'Failed to revoke agent access.')),
        onSettled: () => setRevokingAgentId(null),
      },
    );
  };

  const cancelInvitation = (invitationId: string) => {
    setRevokingInviteId(invitationId);
    cancelInviteMutation.mutate(
      { eventId, invitationId },
      {
        onSuccess: () => toast.success('Invitation cancelled.'),
        onError: (error: unknown) =>
          toast.error(getMessage(error, 'Failed to cancel invitation.')),
        onSettled: () => setRevokingInviteId(null),
      },
    );
  };

  const runConfirmed = () => {
    if (!confirm) return;
    if (confirm.kind === 'revoke') revokeAgent(confirm.id);
    else cancelInvitation(confirm.id);
    setConfirm(null);
  };

  if (isLoading && agents.length === 0 && invitations.length === 0) {
    return <EventAgentsSkeleton />;
  }

  /* ----- render ----- */

  return (
    <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-[#dce1d5] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[#17211b]">
            Gate access
          </h2>
          <p className="max-w-xl text-sm text-[#6d766d]">
            Invite gate agents, review who can scan tickets for this event, and
            remove access when a shift ends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isRefetching}
            aria-label="Refresh list"
            title="Refresh list"
            className={`grid h-11 w-11 place-items-center rounded-full border border-[#dce1d5] bg-white transition hover:bg-[#f0f2ea] disabled:opacity-50 ${focusRing}`}
          >
            <RefreshCw
              className={`h-4 w-4 text-[#17211b] ${isRefetching ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#17211b] px-5 text-sm font-bold text-white transition hover:bg-[#25332b] sm:flex-none ${focusRing}`}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Invite agent
          </button>
        </div>
      </header>

      {/* Stats */}
      <section aria-label="Summary" className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-2xl border border-[#d6f94a] bg-[#d6f94a] p-3 sm:p-4">
          <p className="truncate text-xs font-semibold text-[#3d4a25]">
            Active now
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Radio
              className={`h-4 w-4 shrink-0 text-[#17211b] sm:h-5 sm:w-5 ${activeAgentsCount > 0 ? 'animate-pulse' : ''}`}
              aria-hidden="true"
            />
            <span className="text-xl font-bold text-[#17211b] sm:text-2xl">
              {activeAgentsCount}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-3 sm:p-4">
          <p className="truncate text-xs font-semibold text-[#6d766d]">
            Assigned
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Users
              className="h-4 w-4 shrink-0 text-[#17211b] sm:h-5 sm:w-5"
              aria-hidden="true"
            />
            <span className="text-xl font-bold text-[#17211b] sm:text-2xl">
              {agents.length}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-3 sm:p-4">
          <p className="truncate text-xs font-semibold text-[#6d766d]">
            Pending invites
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Mail
              className="h-4 w-4 shrink-0 text-[#17211b] sm:h-5 sm:w-5"
              aria-hidden="true"
            />
            <span className="text-xl font-bold text-[#17211b] sm:text-2xl">
              {invitations.length}
            </span>
          </div>
        </div>
      </section>

      {/* Assigned agents */}
      <section className="space-y-4 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold text-[#17211b]">
            Assigned agents{' '}
            <span className="ml-1 rounded-full bg-[#f0f2ea] px-2 py-0.5 text-xs font-semibold text-[#4d564d]">
              {agents.length}
            </span>
          </h3>

          {agents.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email"
                aria-label="Search agents"
                className={`h-10 w-full rounded-full border border-[#dce1d5] bg-white pl-10 pr-4 text-base text-[#17211b] sm:text-sm ${focusRing}`}
              />
            </div>
          )}
        </div>

        {agents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] px-6 py-10 text-center">
            <Users
              className="mx-auto h-10 w-10 text-[#6d766d]"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-bold text-[#17211b]">
              No agents assigned yet
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-[#6d766d]">
              Invite someone by email. They can start scanning once they accept.
            </p>
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className={`mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-[#17211b] px-5 text-sm font-bold text-white hover:bg-[#25332b] ${focusRing}`}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Invite agent
            </button>
          </div>
        ) : visibleAgents.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-6 text-center text-sm text-[#6d766d]">
            No agents match “{query}”.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#dce1d5] text-xs font-semibold text-[#6d766d]">
                    <th scope="col" className="pb-3 pr-4 font-semibold">
                      Agent
                    </th>
                    <th scope="col" className="px-4 pb-3 font-semibold">
                      Clearance
                    </th>
                    <th scope="col" className="px-4 pb-3 font-semibold">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="pb-3 pl-4 text-right font-semibold"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8ede0]">
                  {visibleAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="transition-colors hover:bg-[#f7f7f2]"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            label={initialsOf(agent.name, agent.email)}
                            muted={!agent.isActive}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#17211b]">
                              {agent.name}
                            </p>
                            <p className="truncate text-xs text-[#6d766d]">
                              {agent.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#17211b]">
                        {agent.clearance}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          tone={agent.isActive ? 'active' : 'inactive'}
                        >
                          {agent.isActive ? 'Active' : 'Revoked'}
                        </StatusBadge>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        {agent.isActive && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({
                                kind: 'revoke',
                                id: agent.id,
                                label: agent.name,
                              })
                            }
                            disabled={revokingAgentId === agent.id}
                            className={`h-9 rounded-full border border-[#c34837]/30 px-4 text-sm font-semibold text-[#a63a2b] transition hover:border-[#c34837] hover:bg-[#c34837]/5 disabled:opacity-50 ${focusRing}`}
                          >
                            {revokingAgentId === agent.id
                              ? 'Revoking...'
                              : 'Revoke access'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {visibleAgents.map((agent) => (
                <li
                  key={agent.id}
                  className="rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      label={initialsOf(agent.name, agent.email)}
                      muted={!agent.isActive}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#17211b]">
                        {agent.name}
                      </p>
                      <p className="truncate text-xs text-[#6d766d]">
                        {agent.email || 'No email'}
                      </p>
                    </div>
                    <StatusBadge tone={agent.isActive ? 'active' : 'inactive'}>
                      {agent.isActive ? 'Active' : 'Revoked'}
                    </StatusBadge>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#e8ede0] pt-3">
                    <p className="text-xs text-[#6d766d]">
                      Clearance:{' '}
                      <span className="font-semibold text-[#17211b]">
                        {agent.clearance}
                      </span>
                    </p>
                    {agent.isActive && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirm({
                            kind: 'revoke',
                            id: agent.id,
                            label: agent.name,
                          })
                        }
                        disabled={revokingAgentId === agent.id}
                        className={`h-10 rounded-full border border-[#c34837]/30 bg-white px-4 text-sm font-semibold text-[#a63a2b] disabled:opacity-50 ${focusRing}`}
                      >
                        {revokingAgentId === agent.id
                          ? 'Revoking...'
                          : 'Revoke access'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <section className="space-y-4 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#17211b]">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Pending invitations
            <span className="rounded-full bg-[#f0f2ea] px-2 py-0.5 text-xs font-semibold text-[#4d564d]">
              {invitations.length}
            </span>
          </h3>

          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#dce1d5] text-xs font-semibold text-[#6d766d]">
                  <th scope="col" className="pb-3 pr-4 font-semibold">
                    Invited email
                  </th>
                  <th scope="col" className="px-4 pb-3 font-semibold">
                    Role
                  </th>
                  <th scope="col" className="px-4 pb-3 font-semibold">
                    Sent
                  </th>
                  <th scope="col" className="px-4 pb-3 font-semibold">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="pb-3 pl-4 text-right font-semibold"
                  >
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ede0]">
                {invitations.map((invitation) => (
                  <tr
                    key={invitation.id}
                    className="transition-colors hover:bg-[#f7f7f2]"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          label={initialsOf('', invitation.email)}
                          muted
                        />
                        <span className="truncate font-bold text-[#17211b]">
                          {invitation.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#4d564d]">
                      {humanize(invitation.role, 'Gate operator')}
                    </td>
                    <td
                      className="px-4 py-3 text-[#4d564d]"
                      title={
                        invitation.createdAt
                          ? new Date(invitation.createdAt).toLocaleString()
                          : undefined
                      }
                    >
                      {timeAgo(invitation.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone="pending">
                        {humanize(invitation.status, 'Pending')}
                      </StatusBadge>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setConfirm({
                            kind: 'cancel',
                            id: invitation.id,
                            label: invitation.email,
                          })
                        }
                        disabled={revokingInviteId === invitation.id}
                        className={`h-9 rounded-full border border-[#dce1d5] px-4 text-sm font-semibold text-[#4d564d] transition hover:bg-[#f0f2ea] disabled:opacity-50 ${focusRing}`}
                      >
                        {revokingInviteId === invitation.id
                          ? 'Cancelling...'
                          : 'Cancel invite'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar label={initialsOf('', invitation.email)} muted />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#17211b]">
                      {invitation.email}
                    </p>
                    <p className="text-xs text-[#6d766d]">
                      {humanize(invitation.role, 'Gate operator')} · Sent{' '}
                      {timeAgo(invitation.createdAt)}
                    </p>
                  </div>
                  <StatusBadge tone="pending">
                    {humanize(invitation.status, 'Pending')}
                  </StatusBadge>
                </div>

                <div className="mt-3 flex justify-end border-t border-[#e8ede0] pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setConfirm({
                        kind: 'cancel',
                        id: invitation.id,
                        label: invitation.email,
                      })
                    }
                    disabled={revokingInviteId === invitation.id}
                    className={`h-10 rounded-full border border-[#dce1d5] bg-white px-4 text-sm font-semibold text-[#4d564d] disabled:opacity-50 ${focusRing}`}
                  >
                    {revokingInviteId === invitation.id
                      ? 'Cancelling...'
                      : 'Cancel invite'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Invite modal */}
      {showInvite && (
        <Modal titleId="invite-title" onClose={closeInvite}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3
                id="invite-title"
                className="text-lg font-bold text-[#17211b]"
              >
                Invite gate agent
              </h3>
              <p className="mt-0.5 text-sm text-[#6d766d]">
                They’ll get an email with a link to accept.
              </p>
            </div>
            <button
              type="button"
              onClick={closeInvite}
              aria-label="Close"
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#dce1d5] hover:bg-[#f0f2ea] ${focusRing}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            onSubmit={handleInviteAgent}
            noValidate
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="agent-name"
                className="mb-1.5 block text-sm font-semibold text-[#17211b]"
              >
                Full name
              </label>
              <input
                id="agent-name"
                data-autofocus
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className={`h-12 w-full rounded-xl border border-[#dce1d5] bg-white px-4 text-base text-[#17211b] sm:text-sm ${focusRing}`}
              />
            </div>

            <div>
              <label
                htmlFor="agent-email"
                className="mb-1.5 block text-sm font-semibold text-[#17211b]"
              >
                Email address
              </label>
              <input
                id="agent-email"
                type="email"
                required
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@example.com"
                aria-invalid={!!inviteError}
                aria-describedby={inviteError ? 'invite-error' : undefined}
                className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-[#17211b] sm:text-sm ${focusRing} ${
                  inviteError ? 'border-[#c34837]' : 'border-[#dce1d5]'
                }`}
              />
            </div>

            {inviteError && (
              <p
                id="invite-error"
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-[#c34837]/10 p-3 text-sm font-medium text-[#a63a2b]"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                {inviteError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeInvite}
                className={`h-11 rounded-full border border-[#dce1d5] px-5 text-sm font-semibold text-[#17211b] hover:bg-[#f0f2ea] ${focusRing}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  inviteAgentMutation.isPending ||
                  !fullName.trim() ||
                  !email.trim()
                }
                className={`h-11 rounded-full bg-[#17211b] px-5 text-sm font-bold text-white transition hover:bg-[#25332b] disabled:opacity-40 ${focusRing}`}
              >
                {inviteAgentMutation.isPending
                  ? 'Sending...'
                  : 'Send invitation'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <Modal titleId="confirm-title" onClose={() => setConfirm(null)}>
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#c34837]/10 text-[#c34837]"
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h3
                id="confirm-title"
                className="text-lg font-bold text-[#17211b]"
              >
                {confirm.kind === 'revoke'
                  ? 'Revoke scanner access?'
                  : 'Cancel this invitation?'}
              </h3>
              <p className="mt-1 text-sm text-[#6d766d]">
                {confirm.kind === 'revoke'
                  ? `${confirm.label} will no longer be able to scan tickets for this event. You can invite them again later.`
                  : `The invite sent to ${confirm.label} will stop working.`}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              data-autofocus
              onClick={() => setConfirm(null)}
              className={`h-11 rounded-full border border-[#dce1d5] px-5 text-sm font-semibold text-[#17211b] hover:bg-[#f0f2ea] ${focusRing}`}
            >
              Keep {confirm.kind === 'revoke' ? 'access' : 'invitation'}
            </button>
            <button
              type="button"
              onClick={runConfirmed}
              className={`h-11 rounded-full bg-[#c34837] px-5 text-sm font-bold text-white transition hover:bg-[#a63a2b] ${focusRing}`}
            >
              {confirm.kind === 'revoke'
                ? 'Revoke access'
                : 'Cancel invitation'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
