'use client';

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  Clock,
  Calendar,
  ChevronDown,
  CameraOff,
  Camera,
  AlertTriangle,
  DownloadCloud,
  LogIn,
  LogOut,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { QrScanner } from '@/components/qr-scanner';
import { sound } from '@/lib/audio';
import {
  saveManifestToCache,
  verifyTicketOffline,
  markTicketCheckedInOffline,
  queueOfflineCheckIn,
  getPendingSyncCount,
  CachedTicket,
} from '@/lib/offline-db';
import { syncOfflineOutbox } from '@/lib/sync-manager';
import { AgentScannerSkeleton } from '@/components/dashboard/agent/skeletons/loading-skeleton';
import {
  useAssignedEvents,
  useEventAttendees,
  useCheckInMutation,
  CheckInResult,
} from '@/lib/hooks-new/useAgentEvents';
import { api } from '@/lib/api';

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const DUPLICATE_SCAN_WINDOW_MS = 4000;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17211b]/40 focus-visible:ring-offset-2';

type ScanMode = 'IN' | 'OUT';
type LastResult = CheckInResult & {
  message?: string;
  offline?: boolean;
  debug?: { sent: string; scanned: string; eventId: string; mode: ScanMode };
};



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

const formatTime = (iso?: string | Date | null) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

const vibrate = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
  }
};

function extractTicketCandidate(raw: string): string | null {
  const text = raw.trim();

  try {
    const obj = JSON.parse(text);
    const v = obj?.ticketId ?? obj?.ticket_id ?? obj?.qrPayload ?? obj?.id;
    if (typeof v === 'string' && v && v !== text) return v;
  } catch {
  }

  try {
    const url = new URL(text);
    const q =
      url.searchParams.get('ticketId') ??
      url.searchParams.get('ticket') ??
      url.searchParams.get('t');
    if (q) return q;
    const last = url.pathname.split('/').filter(Boolean).pop();
    if (last && last !== text) return last;
  } catch {
  }

  return null;
}


export default function AgentScannerPage() {
  const { data: assignedEvents = [], isLoading: isLoadingEvents } =
    useAssignedEvents();
  const isOnline = useOnlineStatus();

  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [scanMode, setScanMode] = useState<ScanMode>('IN');
  const [isCameraActive, setIsCameraActive] = useState(true);

  const [isDownloadingManifest, setIsDownloadingManifest] = useState(false);
  const [manifestInfo, setManifestInfo] = useState<{
    count: number;
    at: Date;
  } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const [manualTicketId, setManualTicketId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [guestQuery, setGuestQuery] = useState('');

  const checkInMutation = useCheckInMutation();

  const {
    data: allAttendees = [],
    isLoading: isLoadingHistory,
    refetch: refetchAttendees,
  } = useEventAttendees(selectedEventId);

  const syncingRef = useRef(false);
  const lastScanRef = useRef<{ id: string; at: number } | null>(null);
  const wasOfflineRef = useRef(false);
  const checkedInGuests = useMemo(
    () =>
      allAttendees
        .filter((a) => a.status === 'CHECKED_IN')
        .sort(
          (a, b) =>
            new Date(b.checkedInAt || 0).getTime() -
            new Date(a.checkedInAt || 0).getTime(),
        ),
    [allAttendees],
  );

  const visibleGuests = useMemo(() => {
    const q = guestQuery.trim().toLowerCase();
    if (!q) return checkedInGuests;
    return checkedInGuests.filter(
      (g) =>
        (g.guestFullName || '').toLowerCase().includes(q) ||
        (g.ticketId || '').toLowerCase().includes(q),
    );
  }, [checkedInGuests, guestQuery]);

  const totalAttendees = allAttendees.length;
  const progressPct =
    totalAttendees > 0
      ? Math.min(
          100,
          Math.round((checkedInGuests.length / totalAttendees) * 100),
        )
      : 0;

  const selectedEvent = useMemo(
    () => assignedEvents.find((e) => e.id === selectedEventId),
    [assignedEvents, selectedEventId],
  );

  const isMultiDayEvent = useMemo(() => {
    if (!selectedEvent?.startsAt || !selectedEvent?.endsAt) return false;
    return (
      new Date(selectedEvent.startsAt).toDateString() !==
      new Date(selectedEvent.endsAt).toDateString()
    );
  }, [selectedEvent]);

  const isEntryMode = !isMultiDayEvent || scanMode === 'IN';

  const checkInWindowStatus = useMemo(() => {
    if (!selectedEvent?.startsAt) return { isOpen: true, opensAt: null };
    const opensAt = new Date(
      new Date(selectedEvent.startsAt).getTime() - TWELVE_HOURS_MS,
    );
    return { isOpen: Date.now() >= opensAt.getTime(), opensAt };
  }, [selectedEvent]);

  useEffect(() => {
    if (assignedEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(assignedEvents[0].id);
    }
  }, [assignedEvents, selectedEventId]);

  useEffect(() => {
    if (!isMultiDayEvent) setScanMode('IN');
  }, [isMultiDayEvent]);

  useEffect(() => {
    setLastResult(null);
    setGuestQuery('');
    lastScanRef.current = null;
  }, [selectedEventId]);

  const refreshPendingCount = useCallback(async () => {
    try {
      setPendingCount(await getPendingSyncCount());
    } catch (err) {
      console.error('Failed to get outbox count:', err);
    }
  }, []);

  useEffect(() => {
    void refreshPendingCount();
  }, [refreshPendingCount]);

  const cacheManifestForEvent = useCallback(
    async (eventId: string, showToast = false) => {
      if (!navigator.onLine || !eventId) return;

      setIsDownloadingManifest(true);
      try {
        const attendees = await api<typeof allAttendees>(
          `/agents/events/${eventId}/attendees`,
        );

        const formattedTickets: CachedTicket[] = (attendees || []).map((a) => ({
          ticketId: a.ticketId,
          guestFullName: a.guestFullName || 'Guest Attendee',
          tierName: a.tierName || 'Standard',
          status: a.status,
          eventId,
          checkedInAt: a.checkedInAt,
          isMultiDay: a.tier?.isMultiDay || false,
          validDate: a.tier?.validDate,
        }));

        await saveManifestToCache(formattedTickets);
        setManifestInfo({ count: formattedTickets.length, at: new Date() });

        if (showToast) {
          toast.success(
            `Cached ${formattedTickets.length} tickets for offline use.`,
          );
        }
      } catch {
        if (showToast) toast.error('Failed to download ticket manifest.');
      } finally {
        setIsDownloadingManifest(false);
      }
    },
    [],
  );

  const runSync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      await syncOfflineOutbox();
    } catch (err) {
      console.error('Outbox sync failed:', err);
    } finally {
      syncingRef.current = false;
      await refreshPendingCount();
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      return;
    }

    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      toast.success('Back online. Syncing scans and updating the manifest.');
    }

    let active = true;
    void (async () => {
      await runSync();
      if (!active || !selectedEventId) return;
      await cacheManifestForEvent(selectedEventId, false);
      if (active) void refetchAttendees();
    })();

    return () => {
      active = false;
    };
  }, [
    isOnline,
    selectedEventId,
    runSync,
    cacheManifestForEvent,
    refetchAttendees,
  ]);

  
  const handleScanResult = useCallback(
    async (scannedTicketId: string, source: 'camera' | 'manual' = 'camera') => {
      if (!selectedEventId) {
        toast.error('Select an event before scanning.');
        throw new Error('No event selected');
      }

      if (source === 'camera') {
        const last = lastScanRef.current;
        const now = Date.now();
        if (
          last &&
          last.id === scannedTicketId &&
          now - last.at < DUPLICATE_SCAN_WINDOW_MS
        ) {
          return; 
        }
        lastScanRef.current = { id: scannedTicketId, at: now };
      }

      const online = navigator.onLine;

      if (online) {
        let sentPayload = scannedTicketId.trim();
        try {
          const attempt = (qrPayload: string) =>
            checkInMutation.mutateAsync({
              qrPayload,
              eventId: selectedEventId,
              mode: scanMode,
            });

          let result: Awaited<ReturnType<typeof attempt>>;
          try {
            result = await attempt(sentPayload);
          } catch (firstError) {
            const firstMessage =
              firstError instanceof Error ? firstError.message : '';
            const candidate = extractTicketCandidate(sentPayload);
            if (
              candidate &&
              candidate !== sentPayload &&
              /not found|invalid/i.test(firstMessage)
            ) {
              sentPayload = candidate;
              result = await attempt(sentPayload);
            } else {
              throw firstError;
            }
          }

          setLastResult({
            valid: true,
            totalProcessed: result.totalProcessed || 1,
            ticketId: scannedTicketId,
            attendeeName: result.attendeeName || 'Attendee',
            tierName: result.tierName,
            orderNumber: result.orderNumber,
            checkedInAt: result.checkedInAt || new Date().toISOString(),
            processedTickets: result.processedTickets || [],
            mode: scanMode,
          });
          sound.playSuccess();
          vibrate(60);
          toast.success(
            isEntryMode
              ? `Entry approved: ${result.attendeeName}`
              : `Exit logged: ${result.attendeeName}`,
          );
          void refetchAttendees();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Invalid ticket';
          const debug = {
            sent: sentPayload,
            scanned: scannedTicketId,
            eventId: selectedEventId,
            mode: scanMode,
          };
          console.error('[check-in failed]', { message, ...debug });
          setLastResult({
            valid: false,
            ticketId: scannedTicketId,
            mode: scanMode,
            message,
            debug,
          });
          sound.playError();
          vibrate([120, 60, 120]);
          toast.error(message);
          throw error instanceof Error ? error : new Error(message);
        }
        return;
      }

      if (!checkInWindowStatus.isOpen) {
        toast.warning('Early offline scan: verifying against local manifest.');
      }

      const localTicket = await verifyTicketOffline(
        scannedTicketId,
        selectedEventId,
      );

      if (!localTicket) {
        const message = 'Ticket not found in offline manifest.';
        setLastResult({
          valid: false,
          ticketId: scannedTicketId,
          mode: scanMode,
          message,
          offline: true,
        });
        sound.playError();
        vibrate([120, 60, 120]);
        toast.error(message);
        throw new Error(message);
      }

      if (scanMode === 'IN') {
        await markTicketCheckedInOffline(scannedTicketId);
      }
      await queueOfflineCheckIn(scannedTicketId, selectedEventId, scanMode);
      await refreshPendingCount();

      setLastResult({
        valid: true,
        totalProcessed: 1,
        ticketId: scannedTicketId,
        attendeeName: localTicket.guestFullName,
        tierName: localTicket.tierName,
        checkedInAt: new Date().toISOString(),
        mode: scanMode,
        offline: true,
      });
      sound.playSuccess();
      vibrate(60);
      toast.success(
        `[Offline ${scanMode}] Logged: ${localTicket.guestFullName}`,
      );
    },
    [
      selectedEventId,
      scanMode,
      isEntryMode,
      checkInWindowStatus,
      checkInMutation,
      refreshPendingCount,
      refetchAttendees,
    ],
  );

  const handleCameraScan = useCallback(
    (payload: string) => handleScanResult(payload, 'camera'),
    [handleScanResult],
  );

  const handleManualCheckIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const ticketId = manualTicketId.trim();
    if (!ticketId) {
      toast.error('Enter a ticket ID or reference.');
      return;
    }
    if (!selectedEventId) {
      toast.error('Select an event first.');
      return;
    }

    setIsVerifying(true);
    try {
      await handleScanResult(ticketId, 'manual');
      setManualTicketId('');
    } catch {
    } finally {
      setIsVerifying(false);
    }
  };


  if (isLoadingEvents) return <AgentScannerSkeleton />;

  if (assignedEvents.length === 0) {
    return (
      <div className="mx-3 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-8 text-center sm:mx-0 sm:p-12">
        <Calendar className="mx-auto h-12 w-12 text-[#6d766d]" />
        <h2 className="mt-4 text-lg font-bold text-[#17211b]">
          No assigned events
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-[#6d766d]">
          You are not assigned to any active event gates. Contact your organizer
          to get access.
        </p>
      </div>
    );
  }

  const accent = isEntryMode
    ? 'bg-[#17211b] hover:bg-[#25332b]'
    : 'bg-[#ff5500] hover:bg-[#e04c00]';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3 py-3 sm:space-y-5 sm:px-4 sm:py-6 lg:px-0">
      <section className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f0f2ea] px-2.5 py-1 text-[11px] font-semibold text-[#4d564d]">
                {isMultiDayEvent ? 'Multi-day event' : 'Single-day event'}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isOnline
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#17211b] text-white'
                }`}
              >
                {isOnline ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3 text-[#d6f94a]" />
                )}
                {isOnline ? 'Online' : 'Offline'}
              </span>

              {pendingCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void runSync()}
                  disabled={!isOnline}
                  title={isOnline ? 'Sync now' : 'Waiting for connection'}
                  className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 disabled:cursor-not-allowed ${focusRing}`}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-600" />
                  {pendingCount} pending sync{pendingCount > 1 ? 's' : ''}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d6f94a]/30 px-2.5 py-1 text-[11px] font-semibold text-[#17211b]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  All synced
                </span>
              )}
            </div>

            <h1 className="truncate text-xl font-bold text-[#17211b] sm:text-2xl">
              {selectedEvent?.name || 'Select event'}
            </h1>
            <p className="truncate text-sm text-[#6d766d]">
              {[selectedEvent?.venue, selectedEvent?.city]
                .filter(Boolean)
                .join(', ')}
            </p>
            <p className="text-xs text-[#6d766d]">
              {manifestInfo
                ? `Offline manifest: ${manifestInfo.count} tickets · updated ${formatTime(manifestInfo.at)}`
                : 'Offline manifest not downloaded yet'}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center lg:w-auto">
            <div className="relative w-full sm:w-64">
              <label htmlFor="event-select" className="sr-only">
                Active event
              </label>
              <select
                id="event-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className={`h-12 w-full appearance-none rounded-full border border-[#dce1d5] bg-[#f7f7f2] pl-4 pr-10 text-sm font-semibold text-[#17211b] ${focusRing}`}
              >
                {assignedEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
            </div>

            <button
              type="button"
              onClick={() => void cacheManifestForEvent(selectedEventId, true)}
              disabled={isDownloadingManifest || !isOnline}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#dce1d5] bg-[#f7f7f2] px-5 text-sm font-semibold text-[#17211b] transition hover:bg-[#e8ede0] disabled:opacity-50 ${focusRing}`}
            >
              <DownloadCloud
                className={`h-4 w-4 ${isDownloadingManifest ? 'animate-bounce' : ''}`}
              />
              <span>
                {isDownloadingManifest ? 'Caching...' : 'Update offline list'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {!checkInWindowStatus.isOpen && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm">
            <span className="font-bold">Early scanning mode.</span> Gate
            check-in normally opens 12 hours before the start time (
            {checkInWindowStatus.opensAt?.toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
            ). Scans made now are for testing.
          </p>
        </div>
      )}

      <section
        aria-label="Gate summary"
        className="grid grid-cols-3 gap-2 sm:gap-4"
      >
        <div className="col-span-3 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:col-span-1">
          <div className="flex items-center justify-between text-[#6d766d]">
            <span className="text-xs font-semibold">Checked in</span>
            <UserCheck className="h-4 w-4 text-[#17211b]" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-[#17211b] sm:text-3xl">
            {checkedInGuests.length}
            <span className="ml-1 text-sm font-semibold text-[#6d766d]">
              / {totalAttendees}
            </span>
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8ede0]"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Check-in progress"
          >
            <div
              className="h-full rounded-full bg-[#17211b] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="col-span-3 grid grid-cols-2 gap-2 sm:col-span-2 sm:gap-4">
          <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm">
            <div className="flex items-center justify-between text-[#6d766d]">
              <span className="text-xs font-semibold">Connection</span>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-[#17211b]" />
              ) : (
                <WifiOff className="h-4 w-4 text-[#c34837]" />
              )}
            </div>
            <p className="mt-1.5 text-sm font-bold text-[#17211b]">
              {isOnline ? 'Live sync' : 'Offline mode'}
            </p>
            <p className="mt-0.5 text-xs text-[#6d766d]">
              {isOnline
                ? 'Scans are verified instantly'
                : 'Scans are saved on this device'}
            </p>
          </div>

          <div
            className={`rounded-2xl border p-4 shadow-sm ${
              isEntryMode
                ? 'border-[#d6f94a] bg-[#d6f94a]/60'
                : 'border-[#ff5500]/40 bg-[#ff5500]/10'
            }`}
          >
            <div className="flex items-center justify-between text-[#17211b]">
              <span className="text-xs font-semibold">Mode</span>
              {isEntryMode ? (
                <LogIn className="h-4 w-4 text-[#17211b]" />
              ) : (
                <LogOut className="h-4 w-4 text-[#ff5500]" />
              )}
            </div>
            <p
              className={`mt-1.5 text-sm font-bold ${isEntryMode ? 'text-[#17211b]' : 'text-[#c24100]'}`}
            >
              {!isMultiDayEvent
                ? 'Entry'
                : scanMode === 'IN'
                  ? 'Entry (IN)'
                  : 'Exit (OUT)'}
            </p>
            <p className="mt-0.5 text-xs text-[#4d564d]">
              {isEntryMode ? 'Scans admit guests' : 'Scans log re-entry exits'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
        <section className="space-y-4 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:p-6 lg:col-span-3">
          {isMultiDayEvent && (
            <div
              role="radiogroup"
              aria-label="Scan mode"
              className="grid grid-cols-2 gap-1.5 rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-1.5"
            >
              {(['IN', 'OUT'] as const).map((mode) => {
                const active = scanMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setScanMode(mode)}
                    className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${focusRing} ${
                      active
                        ? mode === 'IN'
                          ? 'bg-[#17211b] text-white shadow-sm'
                          : 'bg-[#ff5500] text-white shadow-sm'
                        : 'text-[#6d766d] hover:text-[#17211b]'
                    }`}
                  >
                    {mode === 'IN' ? (
                      <LogIn className="h-4 w-4" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    {mode === 'IN' ? 'Entry (IN)' : 'Exit (OUT)'}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#17211b]">
              QR scanner{isMultiDayEvent ? ` · ${scanMode}` : ''}
            </h2>

            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold ${
                  isCameraActive ? 'text-[#4d564d]' : 'text-[#c34837]'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isCameraActive
                      ? isEntryMode
                        ? 'animate-pulse bg-emerald-500'
                        : 'animate-pulse bg-[#ff5500]'
                      : 'bg-[#c34837]'
                  }`}
                />
                {isCameraActive ? 'Camera on' : 'Camera off'}
              </span>

              <button
                type="button"
                onClick={() => setIsCameraActive((prev) => !prev)}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition ${focusRing} ${
                  isCameraActive
                    ? 'border border-[#dce1d5] bg-[#f7f7f2] text-[#17211b] hover:bg-[#e8ede0]'
                    : 'bg-[#17211b] text-white hover:bg-[#25332b]'
                }`}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="h-4 w-4 text-[#c34837]" />
                    <span>Turn off</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 text-[#d6f94a]" />
                    <span>Turn on</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isCameraActive && selectedEventId ? (
            <QrScanner
              eventId={selectedEventId}
              scanMode={scanMode}
              onScanSuccess={handleCameraScan}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsCameraActive(true)}
              disabled={!selectedEventId}
              className={`flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-8 text-center transition hover:bg-[#e8ede0] sm:min-h-80 ${focusRing}`}
            >
              <CameraOff className="mb-3 h-10 w-10 text-[#6d766d]" />
              <span className="text-sm font-bold text-[#17211b]">
                Camera is off
              </span>
              <span className="mt-1 text-xs text-[#6d766d]">
                Tap here to turn the camera back on.
              </span>
            </button>
          )}

          <div aria-live="polite">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#6d766d]">
                Last result
              </h3>
              {isMultiDayEvent && lastResult?.mode && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white ${
                    lastResult.mode === 'IN' ? 'bg-[#17211b]' : 'bg-[#ff5500]'
                  }`}
                >
                  {lastResult.mode}
                </span>
              )}
            </div>

            {lastResult ? (
              <ResultPanel result={lastResult} isMultiDay={isMultiDayEvent} />
            ) : (
              <div className="rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-6 text-center text-sm text-[#6d766d]">
                No scans yet. Results appear here.
              </div>
            )}
          </div>
        </section>

  
        <section className="space-y-6 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-4 shadow-sm sm:p-6 lg:col-span-2">
          <form onSubmit={handleManualCheckIn} className="space-y-3">
            <label
              htmlFor="manual-ticket"
              className="text-sm font-bold text-[#17211b]"
            >
              Manual lookup
              {isMultiDayEvent
                ? ` · ${scanMode === 'IN' ? 'Entry' : 'Exit'}`
                : ''}
            </label>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
                <input
                  id="manual-ticket"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={manualTicketId}
                  onChange={(e) => setManualTicketId(e.target.value)}
                  placeholder="Ticket ID or reference"
                  className={`h-12 w-full rounded-full border border-[#dce1d5] bg-white pl-10 pr-4 text-base font-medium text-[#17211b] sm:text-sm ${focusRing}`}
                />
              </div>
              <button
                type="submit"
                disabled={
                  isVerifying ||
                  checkInMutation.isPending ||
                  !manualTicketId.trim()
                }
                className={`h-12 rounded-full px-6 text-sm font-bold text-white transition disabled:opacity-50 ${accent} ${focusRing}`}
              >
                {isVerifying || checkInMutation.isPending
                  ? 'Verifying...'
                  : isEntryMode
                    ? 'Check in'
                    : 'Check out'}
              </button>
            </div>
          </form>
          <div className="border-t border-[#dce1d5] pt-6">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#17211b]" />
                <h3 className="text-sm font-bold text-[#17211b]">
                  Checked-in guests
                </h3>
                <span className="rounded-full bg-[#f0f2ea] px-2 py-0.5 text-[11px] font-semibold text-[#4d564d]">
                  {checkedInGuests.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void refetchAttendees()}
                aria-label="Refresh guest list"
                className={`grid h-9 w-9 place-items-center rounded-full text-[#6d766d] hover:bg-[#f7f7f2] ${focusRing}`}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            {checkedInGuests.length > 0 && (
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
                <input
                  type="search"
                  value={guestQuery}
                  onChange={(e) => setGuestQuery(e.target.value)}
                  placeholder="Search name or ticket"
                  aria-label="Search checked-in guests"
                  className={`h-10 w-full rounded-full border border-[#dce1d5] bg-white pl-10 pr-4 text-base text-[#17211b] sm:text-sm ${focusRing}`}
                />
              </div>
            )}

            {isLoadingHistory ? (
              <div className="space-y-2" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-2xl bg-[#f0f2ea]"
                  />
                ))}
              </div>
            ) : visibleGuests.length > 0 ? (
              <ul className="max-h-80 space-y-2 overflow-y-auto pr-1 lg:max-h-[28rem]">
                {visibleGuests.map((guest) => (
                  <li
                    key={guest.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#17211b]">
                        {guest.guestFullName || 'Guest'}
                      </p>
                      <p className="font-mono text-[11px] text-[#6d766d]">
                        {guest.ticketId.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#17211b]">
                      <Clock className="h-3.5 w-3.5 text-[#6d766d]" />
                      <span>
                        {guest.checkedInAt
                          ? formatTime(guest.checkedInAt)
                          : 'Checked in'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-5 text-center text-sm text-[#6d766d]">
                {guestQuery
                  ? 'No guests match your search.'
                  : 'No guests have checked in yet.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- result panel ---------- */

function ResultPanel({
  result,
  isMultiDay,
}: {
  result: LastResult;
  isMultiDay: boolean;
}) {
  const isEntry = !isMultiDay || result.mode === 'IN';

  const tone = !result.valid
    ? 'border-[#ff765f] bg-[#ff765f]/15 text-[#a63a2b]'
    : isEntry
      ? 'border-[#d6f94a] bg-[#d6f94a]/25 text-[#17211b]'
      : 'border-[#ff5500] bg-[#ff5500]/10 text-[#b33b00]';

  const headline = !result.valid
    ? 'Check-in failed'
    : isEntry
      ? 'Entry approved'
      : 'Exit logged';

  const passes = result.totalProcessed ?? 1;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${tone}`}>
      <div className="flex items-start gap-3">
        {result.valid ? (
          <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0" />
        ) : (
          <XCircle className="mt-0.5 h-7 w-7 shrink-0 text-[#c34837]" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold">{headline}</h4>
            {result.offline && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#17211b] px-2 py-0.5 text-[11px] font-semibold text-white">
                <WifiOff className="h-3 w-3 text-[#d6f94a]" />
                Saved offline
              </span>
            )}
          </div>

          {result.valid ? (
            <>
              <p className="mt-1 truncate text-lg font-extrabold">
                {result.attendeeName}
              </p>
              <p className="text-sm font-medium opacity-80">
                {[
                  result.tierName,
                  result.orderNumber && `Order ${result.orderNumber}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold opacity-80">
                <span>
                  {passes} pass{passes === 1 ? '' : 'es'} processed
                </span>
                {result.checkedInAt && (
                  <span>{formatTime(result.checkedInAt)}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm font-medium">
                {result.message ||
                  'Invalid, early, or already checked-in ticket.'}
              </p>
              {result.debug && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer font-semibold underline-offset-2 hover:underline">
                    Scan details
                  </summary>
                  <dl className="mt-1.5 space-y-1 break-all rounded-lg bg-white/60 p-2 font-mono text-[11px] text-[#17211b]">
                    <div>
                      <dt className="inline font-bold">Scanned: </dt>
                      <dd className="inline">
                        {result.debug.scanned.slice(0, 200)}
                      </dd>
                    </div>
                    {result.debug.sent !== result.debug.scanned && (
                      <div>
                        <dt className="inline font-bold">Sent: </dt>
                        <dd className="inline">
                          {result.debug.sent.slice(0, 200)}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="inline font-bold">Event: </dt>
                      <dd className="inline">{result.debug.eventId}</dd>
                    </div>
                    <div>
                      <dt className="inline font-bold">Mode: </dt>
                      <dd className="inline">{result.debug.mode}</dd>
                    </div>
                  </dl>
                </details>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
