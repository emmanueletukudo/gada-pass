'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useAssignedEvents } from '@/lib/hooks-new/useAgentEvents';
import {
  saveManifestToCache,
  getPendingSyncCount,
  CachedTicket,
} from '@/lib/offline-db';
import { syncOfflineOutbox } from '@/lib/sync-manager';
import { api } from '@/lib/hooks-new/api';

interface AttendeeRecord {
  ticketId: string;
  guestFullName?: string;
  tierName?: string;
  status: string;
  checkedInAt?: string;
  tier?: { isMultiDay?: boolean; validDate?: string };
}

type RowStatus = 'idle' | 'syncing' | 'done' | 'error';
interface RowState {
  status: RowStatus;
  count?: number;
  at?: string;
}

const STORAGE_KEY = 'gadapass:manifest-sync';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17211b]/40 focus-visible:ring-offset-2';

function readStored(): Record<string, { count: number; at: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeStored(eventId: string, value: { count: number; at: string }) {
  try {
    const all = readStored();
    all[eventId] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
  }
}

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

const formatWhen = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

const formatRole = (role?: string) => {
  if (!role) return '—';
  const text = role.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

async function cacheEventManifest(eventId: string): Promise<number> {
  const attendees = await api<AttendeeRecord[]>(
    `/agents/events/${eventId}/attendees`,
  );

  const tickets: CachedTicket[] = (attendees || []).map(
    (a) =>
      ({
        ticketId: a.ticketId,
        guestFullName: a.guestFullName || 'Guest Attendee',
        tierName: a.tierName || 'Standard',
        status: a.status,
        eventId,
        checkedInAt: a.checkedInAt,
        isMultiDay: a.tier?.isMultiDay || false,
        validDate: a.tier?.validDate,
      }) as CachedTicket,
  );

  await saveManifestToCache(tickets);
  return tickets.length;
}


export default function AgentSettingsPage() {
  const { user } = useCurrentUser();
  const { data: events = [], isLoading: isLoadingEvents } = useAssignedEvents();
  const isOnline = useOnlineStatus();

  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [pendingCount, setPendingCount] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  const refreshPending = useCallback(async () => {
    try {
      setPendingCount(await getPendingSyncCount());
    } catch {
    }
  }, []);

  useEffect(() => {
    void refreshPending();
  }, [refreshPending]);


  useEffect(() => {
    const stored = readStored();
    setRows((prev) => {
      const next = { ...prev };
      for (const [id, v] of Object.entries(stored)) {
        if (!next[id]) next[id] = { status: 'done', count: v.count, at: v.at };
      }
      return next;
    });
  }, []);

  const setRow = (id: string, patch: RowState) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const syncEvent = useCallback(async (eventId: string): Promise<boolean> => {
    setRow(eventId, { status: 'syncing' });
    try {
      const count = await cacheEventManifest(eventId);
      const at = new Date().toISOString();
      writeStored(eventId, { count, at });
      setRow(eventId, { status: 'done', count, at });
      return true;
    } catch {
      setRow(eventId, { status: 'error' });
      return false;
    }
  }, []);

  const flushOutbox = useCallback(async (): Promise<boolean> => {
    try {
      await syncOfflineOutbox();
      return true;
    } catch {
      return false;
    } finally {
      await refreshPending();
    }
  }, [refreshPending]);

  const handleSyncAll = async () => {
    if (!navigator.onLine) {
      toast.error('You are offline. Connect to the internet to sync.');
      return;
    }

    setIsBusy(true);
    try {
      const outboxOk = await flushOutbox();
      if (!outboxOk) {
        toast.warning(
          'Some offline scans could not be uploaded. They are still saved on this device.',
        );
      }

      let failed = 0;
      for (const evt of events) {
        const ok = await syncEvent(evt.id);
        if (!ok) failed += 1;
      }

      if (events.length === 0) {
        toast.info('No assigned events to sync.');
      } else if (failed === 0) {
        toast.success(
          `Offline data updated for ${events.length} event${events.length === 1 ? '' : 's'}.`,
        );
      } else {
        toast.error(
          `${failed} of ${events.length} events failed to sync. Try again.`,
        );
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleSyncOne = async (eventId: string, name: string) => {
    if (!navigator.onLine) {
      toast.error('You are offline. Connect to the internet to sync.');
      return;
    }
    setIsBusy(true);
    try {
      const ok = await syncEvent(eventId);
      if (ok) toast.success(`Offline list updated for ${name}.`);
      else toast.error(`Could not update ${name}. Try again.`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleUploadPending = async () => {
    if (!navigator.onLine) {
      toast.error('You are offline. Connect to the internet to upload scans.');
      return;
    }
    setIsBusy(true);
    try {
      const ok = await flushOutbox();
      if (ok) toast.success('Offline scans uploaded.');
      else
        toast.error(
          'Upload failed. Your scans are still saved on this device.',
        );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 lg:mx-0 lg:px-0">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#17211b] sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-[#6d766d]">
          Manage your profile and keep this device ready for offline scanning.
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-[#17211b]">Agent profile</h2>

        <dl className="divide-y divide-[#f0f1e9] text-sm">
          {[
            { label: 'Full name', value: user?.name || 'Gate agent' },
            { label: 'Email address', value: user?.email || '—' },
            { label: 'Assigned role', value: formatRole(user?.role) },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <dt className="text-[#6d766d]">{row.label}</dt>
              <dd className="break-all font-semibold text-[#17211b] sm:text-right">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-5 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#17211b]">
              Offline data sync
            </h2>
            <p className="text-sm text-[#6d766d]">
              Save ticket lists on this device so you can keep scanning when the
              venue connection drops.
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isOnline
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-[#17211b] text-white'
            }`}
          >
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-[#d6f94a]" />
            )}
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div
          className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
            pendingCount > 0
              ? 'border-amber-300 bg-amber-50'
              : 'border-[#dce1d5] bg-[#f7f7f2]'
          }`}
        >
          <div>
            <p className="text-sm font-bold text-[#17211b]">
              {pendingCount > 0
                ? `${pendingCount} scan${pendingCount === 1 ? '' : 's'} waiting to upload`
                : 'All scans uploaded'}
            </p>
            <p className="text-xs text-[#6d766d]">
              {pendingCount > 0
                ? 'Saved on this device from offline check-ins.'
                : 'Nothing is waiting on this device.'}
            </p>
          </div>
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={() => void handleUploadPending()}
              disabled={isBusy || !isOnline}
              className={`h-10 shrink-0 rounded-full bg-[#17211b] px-5 text-sm font-semibold text-white transition hover:bg-[#25332b] disabled:opacity-50 ${focusRing}`}
            >
              Upload now
            </button>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#6d766d]">
            Offline ticket lists
          </h3>

          {isLoadingEvents ? (
            <div className="space-y-2" aria-busy="true">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-2xl bg-[#f0f2ea]"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-4 text-center text-sm text-[#6d766d]">
              No assigned events to sync.
            </p>
          ) : (
            <ul className="space-y-2">
              {events.map((evt) => {
                const row = rows[evt.id] ?? { status: 'idle' as RowStatus };
                return (
                  <li
                    key={evt.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-3 sm:p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#17211b]">
                        {evt.name}
                      </p>
                      <p
                        className={`flex items-center gap-1.5 text-xs ${
                          row.status === 'error'
                            ? 'text-[#c34837]'
                            : 'text-[#6d766d]'
                        }`}
                        aria-live="polite"
                      >
                        {row.status === 'done' && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        )}
                        {row.status === 'error' && (
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">
                          {row.status === 'syncing'
                            ? 'Downloading...'
                            : row.status === 'error'
                              ? 'Sync failed. Try again.'
                              : row.at
                                ? `${row.count ?? 0} tickets · ${formatWhen(row.at)}`
                                : 'Not downloaded on this device'}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleSyncOne(evt.id, evt.name)}
                      disabled={isBusy || !isOnline}
                      aria-label={`Sync ${evt.name}`}
                      className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#dce1d5] bg-[#fffef9] px-4 text-sm font-semibold text-[#17211b] transition hover:bg-[#e8ede0] disabled:opacity-50 ${focusRing}`}
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          row.status === 'syncing' ? 'animate-spin' : ''
                        }`}
                      />
                      <span className="hidden sm:inline">Sync</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={() => void handleSyncAll()}
          disabled={isBusy || !isOnline || events.length === 0}
          className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#17211b] px-6 text-sm font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50 sm:w-auto ${focusRing}`}
        >
          <RefreshCw className={`h-4 w-4 ${isBusy ? 'animate-spin' : ''}`} />
          <span>{isBusy ? 'Syncing...' : 'Sync everything now'}</span>
        </button>

        {!isOnline && (
          <p className="text-xs text-[#6d766d]">
            You are offline. Syncing is paused until the connection returns.
          </p>
        )}
      </section>
    </div>
  );
}
