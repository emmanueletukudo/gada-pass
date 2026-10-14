'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  UserCheck,
  Zap,
  Users,
  Clock,
  Calendar,
  ChevronDown,
  Loader2,
  Camera,
  CameraOff,
  AlertTriangle,
  DownloadCloud,
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

type AssignedEvent = {
  id: string;
  name: string;
  startsAt: string;
  venue: string;
  city: string;
};

type ProcessedTicket = {
  ticketId: string;
  attendeeName: string;
  tierName: string;
};

type CheckInResult = {
  valid: boolean;
  totalProcessed?: number;
  ticketId: string;
  attendeeName?: string;
  tierName?: string;
  orderNumber?: string;
  checkedInAt?: string;
  processedTickets?: ProcessedTicket[];
};

type BackendAttendee = {
  id: string;
  ticketId: string;
  guestFullName: string;
  guestEmail: string;
  tierName: string;
  status: 'PAID' | 'CHECKED_IN' | 'CANCELLED';
  checkedInAt?: string;
  orderNumber?: string;
};

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export default function AgentScannerPage() {
  const [assignedEvents, setAssignedEvents] = useState<AssignedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isDownloadingManifest, setIsDownloadingManifest] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const [manualTicketId, setManualTicketId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastManualResult, setLastManualResult] =
    useState<CheckInResult | null>(null);
  const [checkedInGuests, setCheckedInGuests] = useState<BackendAttendee[]>([]);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    } catch (err) {
      console.error('Failed to get outbox count:', err);
    }
  }, []);

  useEffect(() => {
    async function loadAssignedEvents() {
      setIsLoadingEvents(true);
      try {
        const events = await api<AssignedEvent[]>('/agents/assigned-events');
        setAssignedEvents(events || []);

        if (events && events.length > 0) {
          setSelectedEventId(events[0].id);
        }
      } catch (err) {
        toast.error('Failed to load assigned events.');
      } finally {
        setIsLoadingEvents(false);
      }
    }

    void loadAssignedEvents();
    void refreshPendingCount();
  }, [refreshPendingCount]);

  const selectedEvent = useMemo(
    () => assignedEvents.find((e) => e.id === selectedEventId),
    [assignedEvents, selectedEventId],
  );

  const checkInWindowStatus = useMemo(() => {
    if (!selectedEvent?.startsAt) return { isOpen: true, opensAt: null };

    const eventStartDate = new Date(selectedEvent.startsAt).getTime();
    const checkInOpenTime = eventStartDate - TWELVE_HOURS_MS;
    const now = Date.now();

    return {
      isOpen: now >= checkInOpenTime,
      opensAt: new Date(checkInOpenTime),
    };
  }, [selectedEvent]);

  const fetchCheckedInGuests = useCallback(async () => {
    if (!selectedEventId) return;
    setIsLoadingHistory(true);
    try {
      const data = await api<BackendAttendee[]>(
        `/agents/events/${selectedEventId}/attendees`,
      );

      const checkedInList = (data || [])
        .filter((a) => a.status === 'CHECKED_IN')
        .sort(
          (a, b) =>
            new Date(b.checkedInAt || 0).getTime() -
            new Date(a.checkedInAt || 0).getTime(),
        );

      setCheckedInGuests(checkedInList);
    } catch {
      toast.error('Failed to sync checked-in guest roster.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedEventId) {
      setLastManualResult(null);
      void fetchCheckedInGuests();
    }
  }, [selectedEventId, fetchCheckedInGuests]);

  useEffect(() => {
    const handleOnline = async () => {
      toast.success('Connection restored! Syncing offline scans...');
      await syncOfflineOutbox();
      await refreshPendingCount();
      if (selectedEventId) void fetchCheckedInGuests();
    };

    window.addEventListener('online', handleOnline);

    if (navigator.onLine) {
      void syncOfflineOutbox().then(() => refreshPendingCount());
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [selectedEventId, fetchCheckedInGuests, refreshPendingCount]);

  const handleDownloadManifest = async () => {
    if (!selectedEventId) return;
    setIsDownloadingManifest(true);
    try {
      const attendees = await api<any[]>(
        `/agents/events/${selectedEventId}/attendees`,
      );

      const formattedTickets: CachedTicket[] = (attendees || []).map((a) => ({
        ticketId: a.ticketId,
        guestFullName: a.guestFullName || 'Guest Attendee',
        tierName: a.tierName || 'Standard',
        status: a.status,
        eventId: selectedEventId,
        checkedInAt: a.checkedInAt,
      }));

      await saveManifestToCache(formattedTickets);
      toast.success(
        `Successfully cached ${formattedTickets.length} tickets for offline scanning!`,
      );
    } catch (err) {
      toast.error('Failed to download ticket manifest.');
    } finally {
      setIsDownloadingManifest(false);
    }
  };

  const handleScanResult = useCallback(
    async (scannedTicketId: string) => {
      if (!checkInWindowStatus.isOpen && !navigator.onLine) {
        toast.warning('Early offline scan: Local verification active.');
      }

      const isOnline = navigator.onLine;

      if (isOnline) {
        try {
          const result = await api<CheckInResult>('/events/check-in', {
            method: 'POST',
            body: JSON.stringify({
              qrPayload: scannedTicketId,
              eventId: selectedEventId,
            }),
          });

          const processedResult: CheckInResult = {
            valid: true,
            totalProcessed: result.totalProcessed || 1,
            ticketId: scannedTicketId,
            attendeeName: result.attendeeName || 'Attendee',
            tierName: result.tierName,
            orderNumber: result.orderNumber,
            checkedInAt: result.checkedInAt || new Date().toISOString(),
            processedTickets: result.processedTickets || [],
          };

          setLastManualResult(processedResult);
          sound.playSuccess();
          toast.success(
            !checkInWindowStatus.isOpen
              ? `Early Check-in Approved: ${result.attendeeName}`
              : 'Check-in successful!',
          );
          void fetchCheckedInGuests();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Invalid ticket';
          sound.playError();

          if (message.toLowerCase().includes('opens 8 hours')) {
            toast.error(
              'Early scan rejected: Requires Organizer clearance level.',
            );
          } else {
            toast.error(message);
          }

          setLastManualResult({ valid: false, ticketId: scannedTicketId });
        }
      } else {
        const localTicket = await verifyTicketOffline(
          scannedTicketId,
          selectedEventId,
        );

        if (!localTicket) {
          sound.playError();
          toast.error('Ticket not found in offline manifest.');
          setLastManualResult({ valid: false, ticketId: scannedTicketId });
          return;
        }

        if (localTicket.status === 'CHECKED_IN') {
          sound.playError();
          toast.error(
            `Ticket already checked in at ${localTicket.checkedInAt}`,
          );
          setLastManualResult({ valid: false, ticketId: scannedTicketId });
          return;
        }

        if (localTicket.status !== 'PAID') {
          sound.playError();
          toast.error('Ticket is invalid, pending, or cancelled.');
          setLastManualResult({ valid: false, ticketId: scannedTicketId });
          return;
        }

        await markTicketCheckedInOffline(scannedTicketId);
        await queueOfflineCheckIn(scannedTicketId, selectedEventId);
        await refreshPendingCount();

        sound.playSuccess();
        toast.success(`[OFFLINE] Checked in: ${localTicket.guestFullName}`);
        setLastManualResult({
          valid: true,
          totalProcessed: 1,
          ticketId: scannedTicketId,
          attendeeName: localTicket.guestFullName,
          tierName: localTicket.tierName,
          checkedInAt: new Date().toISOString(),
        });
      }
    },
    [
      checkInWindowStatus,
      selectedEventId,
      fetchCheckedInGuests,
      refreshPendingCount,
    ],
  );

  const handleManualCheckIn = async () => {
    const ticketId = manualTicketId.trim();
    if (!ticketId) {
      toast.error('Please enter a ticket ID or reference.');
      return;
    }
    if (!selectedEventId) {
      toast.error('Please select an active event context.');
      return;
    }

    setIsVerifying(true);
    await handleScanResult(ticketId);
    setManualTicketId('');
    setIsVerifying(false);
  };

  if (isLoadingEvents) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#17211b]" />
        <p className="mt-4 text-xs font-bold text-[#6d766d]">
          Loading event assignments...
        </p>
      </div>
    );
  }

  if (assignedEvents.length === 0) {
    return (
      <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-[#6d766d]" />
        <h2 className="mt-4 text-lg font-bold text-[#17211b]">
          No Assigned Events
        </h2>
        <p className="mt-1 text-xs font-medium text-[#6d766d]">
          You are currently not assigned to any active event gates. Contact your
          organizer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#6d766d]">
              Active Gate Context
            </span>

            {pendingCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                {pendingCount} Pending Sync{pendingCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d6f94a]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#17211b]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Synced
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold text-[#17211b] mt-1">
            {selectedEvent?.name || 'Select Event'}
          </h1>
          <p className="text-xs font-semibold text-[#6d766d]">
            {selectedEvent?.venue}, {selectedEvent?.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadManifest}
            disabled={isDownloadingManifest}
            className="inline-flex items-center gap-2 rounded-full border border-[#dce1d5] bg-[#f7f7f2] px-4 py-3 text-xs font-bold text-[#17211b] transition hover:bg-[#e8ede0] disabled:opacity-50"
            title="Download ticket manifest for offline scanning"
          >
            <DownloadCloud
              className={`h-4 w-4 ${isDownloadingManifest ? 'animate-bounce' : ''}`}
            />
            <span>
              {isDownloadingManifest ? 'Caching...' : 'Cache Manifest'}
            </span>
          </button>

          <div className="relative min-w-55">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full appearance-none rounded-full border border-[#dce1d5] bg-[#f7f7f2] py-3 pl-4 pr-10 text-xs font-bold text-[#17211b] outline-none focus:border-[#17211b]"
            >
              {assignedEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
          </div>
        </div>
      </div>

      {!checkInWindowStatus.isOpen && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-xs">
              <span className="font-bold">Early Scanning Mode Active.</span>{' '}
              Standard gate check-in opens 12 hours before start time (
              <span className="font-bold">
                {checkInWindowStatus.opensAt?.toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
              ).
            </div>
          </div>
          <span className="rounded-full bg-amber-200/80 px-2.5 py-1 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
            Early Access / Test Mode
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6d766d]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Checked In Total
            </span>
            <UserCheck className="h-4 w-4 text-[#17211b]" />
          </div>
          <p className="mt-2 text-3xl font-bold text-[#17211b]">
            {checkedInGuests.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6d766d]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Gate Clearance
            </span>
            <Zap className="h-4 w-4 text-[#17211b]" />
          </div>
          <p className="mt-2 text-sm font-bold text-[#17211b]">
            {navigator.onLine ? 'Online Sync Active' : 'Offline Mode Active'}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-5 shadow-sm ${
            checkInWindowStatus.isOpen
              ? 'border-[#dce1d5] bg-[#d6f94a]'
              : 'border-amber-200 bg-amber-100'
          }`}
        >
          <div className="flex items-center justify-between text-[#17211b]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Check-In Status
            </span>
            <QrCode className="h-4 w-4 text-[#17211b]" />
          </div>
          <p className="mt-2 text-sm font-bold text-[#17211b]">
            {checkInWindowStatus.isOpen ? 'Gate Open' : 'Early Scan Mode'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#17211b]">
              Live QR Camera Scanner
            </h2>

            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1.5 text-[11px] font-bold ${
                  isCameraActive ? 'text-[#6d766d]' : 'text-[#c34837]'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isCameraActive
                      ? 'bg-[#d6f94a] animate-ping'
                      : 'bg-[#c34837]'
                  }`}
                />
                {isCameraActive ? 'Camera Active' : 'Camera Paused'}
              </span>

              <button
                type="button"
                onClick={() => setIsCameraActive((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  isCameraActive
                    ? 'border border-[#dce1d5] bg-[#f7f7f2] text-[#17211b] hover:bg-[#e8ede0]'
                    : 'bg-[#17211b] text-white hover:bg-[#25332b]'
                }`}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="h-3.5 w-3.5 text-[#c34837]" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5 text-[#d6f94a]" />
                    <span>Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isCameraActive ? (
            <QrScanner key={selectedEventId} onScanSuccess={handleScanResult} />
          ) : (
            <div
              onClick={() => setIsCameraActive(true)}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-12 text-center cursor-pointer transition hover:bg-[#e8ede0] min-h-70"
            >
              <CameraOff className="h-10 w-10 text-[#6d766d] mb-3" />
              <p className="text-sm font-extrabold text-[#17211b]">
                Camera Feed Paused
              </p>
              <p className="mt-1 text-xs text-[#6d766d]">
                Recording mode is turned off. Click anywhere or press resume to
                enable camera.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#17211b]">
                Manual Ticket Lookup
              </h2>

              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
                  <input
                    type="text"
                    value={manualTicketId}
                    onChange={(e) => setManualTicketId(e.target.value)}
                    placeholder="Enter Ticket ID / Ref"
                    className="w-full rounded-full border border-[#dce1d5] bg-white py-3 pl-10 pr-4 text-sm font-semibold text-[#17211b] outline-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={isVerifying || !manualTicketId.trim()}
                  onClick={handleManualCheckIn}
                  className="rounded-full bg-[#17211b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Check In'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6d766d]">
                Last Verification Result
              </h3>

              {lastManualResult ? (
                <div className="mt-3 space-y-3">
                  <div
                    className={`flex items-center gap-3 rounded-2xl p-4 border ${
                      lastManualResult.valid
                        ? 'border-[#d6f94a] bg-[#d6f94a]/20 text-[#17211b]'
                        : 'border-[#ff765f] bg-[#ff765f]/15 text-[#c34837]'
                    }`}
                  >
                    {lastManualResult.valid ? (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-[#17211b]" />
                    ) : (
                      <XCircle className="h-6 w-6 shrink-0 text-[#c34837]" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {lastManualResult.valid
                          ? `CHECK-IN PASSED (${lastManualResult.totalProcessed} PASSES)`
                          : 'VERIFICATION FAILED'}
                      </h4>
                      <p className="text-xs font-medium">
                        {lastManualResult.valid
                          ? `Primary Guest: ${lastManualResult.attendeeName}`
                          : 'Invalid, early, or already checked-in ticket'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-6 text-center text-xs font-medium text-[#6d766d]">
                  No active scan recorded.
                </div>
              )}
            </div>

            <div className="border-t border-[#dce1d5] pt-6">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#17211b]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#17211b]">
                    Live Checked-in Guests
                  </h3>
                </div>
                <button
                  onClick={() => void fetchCheckedInGuests()}
                  className="rounded-full p-1 hover:bg-[#f7f7f2] text-[#6d766d]"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isLoadingHistory ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="py-6 text-center text-xs font-medium text-[#6d766d]">
                  Syncing roster...
                </div>
              ) : checkedInGuests.length > 0 ? (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {checkedInGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-3 text-xs font-semibold"
                    >
                      <div>
                        <span className="font-bold text-[#17211b]">
                          {guest.guestFullName}
                        </span>
                        <p className="font-mono text-[10px] text-[#6d766d]">
                          {guest.ticketId.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#17211b]">
                        <Clock className="h-3 w-3 text-[#6d766d]" />
                        <span>
                          {guest.checkedInAt
                            ? new Date(guest.checkedInAt).toLocaleTimeString(
                                [],
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )
                            : 'Checked in'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-4 text-center text-xs font-medium text-[#6d766d]">
                  No checked-in guests recorded yet for this event.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
