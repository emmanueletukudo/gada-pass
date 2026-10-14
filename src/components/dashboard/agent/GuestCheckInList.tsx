'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Search,
  UserCheck,
  UserX,
  Clock,
  Filter,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Sparkles,
} from 'lucide-react';

export type AttendeeRecord = {
  id: string;
  ticketId: string;
  guestFullName: string;
  guestEmail: string;
  tierName: string;
  status: 'PAID' | 'CHECKED_IN' | 'CANCELLED';
  checkedInAt?: string;
  orderNumber?: string;
  qrPayload?: string;
};

interface GuestCheckInListProps {
  eventId: string;
}

export function GuestCheckInList({ eventId }: GuestCheckInListProps) {
  const [attendees, setAttendees] = useState<AttendeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'CHECKED_IN' | 'PENDING'
  >('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAttendees = async () => {
    setIsLoading(true);
    try {
      const data = await api<AttendeeRecord[]>(
        `/agents/events/${eventId}/attendees`,
      );
      setAttendees(data || []);
    } catch (err) {
      toast.error('Failed to load guest list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) void fetchAttendees();
  }, [eventId]);

  const handleManualCheckIn = async (attendee: AttendeeRecord) => {
    if (attendee.status === 'CHECKED_IN') {
      toast.info('Attendee is already checked in.');
      return;
    }

    setProcessingId(attendee.id);

    try {
      const payloadToVerify = attendee.qrPayload || attendee.ticketId;

      await api('/check-in', {
        method: 'POST',
        body: JSON.stringify({ qrPayload: payloadToVerify }),
      });

      toast.success(`Checked in: ${attendee.guestFullName}`);

      setAttendees((prev) =>
        prev.map((item) =>
          item.id === attendee.id
            ? {
                ...item,
                status: 'CHECKED_IN',
                checkedInAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Check-in failed';
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAttendees = useMemo(() => {
    return attendees.filter((item) => {
      const matchesSearch =
        item.guestFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.orderNumber &&
          item.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === 'CHECKED_IN') return item.status === 'CHECKED_IN';
      if (statusFilter === 'PENDING') return item.status === 'PAID';

      return true;
    });
  }, [attendees, searchQuery, statusFilter]);

  const checkedInCount = attendees.filter(
    (a) => a.status === 'CHECKED_IN',
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dce1d5] pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#17211b]">
            Guest Roster & Gate Check-in
          </h2>
          <p className="text-xs font-semibold text-[#6d766d]">
            Search, inspect, and manually check in registered attendees.
          </p>
        </div>

        <button
          onClick={fetchAttendees}
          disabled={isLoading}
          className="flex items-center gap-2 self-start rounded-full border border-[#dce1d5] bg-[#fffef9] px-4 py-2 text-xs font-bold text-[#17211b] transition hover:bg-[#f7f7f2]"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
          />
          <span>Refresh Roster</span>
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-7">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Guest Name, Email, Ticket ID or Order Ref..."
            className="w-full rounded-full border border-[#dce1d5] bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-[#17211b] outline-none focus:border-[#17211b]"
          />
        </div>
        <div className="flex rounded-full border border-[#dce1d5] bg-[#f7f7f2] p-1 sm:col-span-5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`flex-1 rounded-full py-1.5 text-[11px] font-extrabold transition ${
              statusFilter === 'ALL'
                ? 'bg-[#17211b] text-white shadow-sm'
                : 'text-[#6d766d] hover:text-[#17211b]'
            }`}
          >
            All ({attendees.length})
          </button>
          <button
            onClick={() => setStatusFilter('CHECKED_IN')}
            className={`flex-1 rounded-full py-1.5 text-[11px] font-extrabold transition ${
              statusFilter === 'CHECKED_IN'
                ? 'bg-[#d6f94a] text-[#17211b] shadow-sm'
                : 'text-[#6d766d] hover:text-[#17211b]'
            }`}
          >
            Checked In ({checkedInCount})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`flex-1 rounded-full py-1.5 text-[11px] font-extrabold transition ${
              statusFilter === 'PENDING'
                ? 'bg-[#17211b] text-white shadow-sm'
                : 'text-[#6d766d] hover:text-[#17211b]'
            }`}
          >
            Pending ({attendees.length - checkedInCount})
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="py-12 text-center text-xs font-bold text-[#6d766d]">
          Syncing event guest list...
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#dce1d5] bg-[#fffef9] p-12 text-center text-xs font-semibold text-[#6d766d]">
          No matching guests found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAttendees.map((attendee) => {
            const isCheckedIn = attendee.status === 'CHECKED_IN';
            const isBusy = processingId === attendee.id;

            return (
              <div
                key={attendee.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                  isCheckedIn
                    ? 'border-[#d6f94a] bg-[#d6f94a]/10'
                    : 'border-[#dce1d5] bg-[#fffef9] hover:border-[#17211b]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#17211b]">
                      {attendee.guestFullName}
                    </h3>
                    <span className="rounded-md bg-[#f7f7f2] border border-[#dce1d5] px-2 py-0.5 text-[10px] font-bold text-[#6d766d]">
                      {attendee.tierName}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#6d766d]">
                    {attendee.guestEmail}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#6d766d] pt-1">
                    <span>ID: {attendee.ticketId.slice(0, 8)}...</span>
                    {attendee.orderNumber && (
                      <span>Ref: {attendee.orderNumber}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {isCheckedIn ? (
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#17211b]">
                      <CheckCircle2 className="h-4 w-4 text-[#17211b]" />
                      <span>
                        Checked In{' '}
                        {attendee.checkedInAt &&
                          `at ${new Date(
                            attendee.checkedInAt,
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleManualCheckIn(attendee)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#17211b] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>
                        {isBusy ? 'Checking In...' : 'Check In Guest'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
