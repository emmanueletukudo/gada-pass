'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  UserCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';

type ScanResult = {
  valid: boolean;
  ticketId: string;
  attendeeName: string;
  email: string;
  tierName: string;
  eventName: string;
  checkedInAt?: string;
  message?: string;
};

export default function AgentScannerPage() {
  const [manualTicketId, setManualTicketId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  const handleVerifyTicket = async (ticketIdToVerify?: string) => {
    const ticketId = (ticketIdToVerify || manualTicketId).trim();

    if (!ticketId) {
      toast.error('Please enter or scan a ticket ID.');
      return;
    }

    setIsVerifying(true);

    try {
      const result = await api<ScanResult>('/agents/verify-ticket', {
        method: 'POST',
        body: JSON.stringify({ ticketId }),
      });

      setLastScan(result);

      if (result.valid) {
        toast.success(`Access Granted: ${result.attendeeName}`);
      } else {
        toast.error(result.message || 'Invalid or already used ticket');
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Verification failed';
      toast.error(msg);
      setLastScan({
        valid: false,
        ticketId,
        attendeeName: 'Unknown',
        email: 'N/A',
        tierName: 'N/A',
        eventName: 'N/A',
        message: msg,
      });
    } finally {
      setIsVerifying(false);
      setManualTicketId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6d766d]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Checked In
            </span>
            <UserCheck className="h-4 w-4 text-[#17211b]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#17211b]">142</p>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6d766d]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Expected
            </span>
            <QrCode className="h-4 w-4 text-[#17211b]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#17211b]">350</p>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#d6f94a] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#17211b]">
            <span className="text-xs font-bold uppercase tracking-wider">
              Sync Status
            </span>
            <Zap className="h-4 w-4 text-[#17211b]" />
          </div>
          <p className="mt-2 text-sm font-extrabold text-[#17211b]">
            Live & Synced
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-8 text-center shadow-sm">
            <div className="relative grid h-48 w-48 place-items-center rounded-2xl border-2 border-dashed border-[#17211b] bg-[#f7f7f2]">
              <QrCode className="h-16 w-16 text-[#6d766d]" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#ff765f] animate-pulse" />
            </div>
            <p className="mt-4 text-xs font-bold text-[#6d766d]">
              Point camera at attendee QR pass or enter code below
            </p>
          </div>

          <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17211b]">
              Manual Ticket Lookup
            </label>
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
                <input
                  type="text"
                  value={manualTicketId}
                  onChange={(e) => setManualTicketId(e.target.value)}
                  placeholder="Paste Ticket ID / Ref"
                  className="w-full rounded-full border border-[#dce1d5] bg-white py-3 pl-10 pr-4 text-sm font-semibold text-[#17211b] outline-none focus:border-[#17211b]"
                />
              </div>
              <button
                type="button"
                disabled={isVerifying || !manualTicketId.trim()}
                onClick={() => handleVerifyTicket()}
                className="rounded-full bg-[#17211b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
              >
                {isVerifying ? 'Checking...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#6d766d]">
              Last Verification Result
            </h2>

            {lastScan ? (
              <div className="mt-6 space-y-5">
                <div
                  className={`flex items-center gap-3 rounded-2xl p-4 ${
                    lastScan.valid
                      ? 'bg-[#d6f94a]/30 border border-[#d6f94a] text-[#17211b]'
                      : 'bg-[#ff765f]/10 border border-[#ff765f] text-[#c34837]'
                  }`}
                >
                  {lastScan.valid ? (
                    <CheckCircle2 className="h-8 w-8 shrink-0 text-[#17211b]" />
                  ) : (
                    <XCircle className="h-8 w-8 shrink-0 text-[#c34837]" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold">
                      {lastScan.valid ? 'VALID TICKET' : 'ACCESS DENIED'}
                    </h3>
                    <p className="text-xs font-medium">
                      {lastScan.message ||
                        (lastScan.valid
                          ? 'Pass verified successfully.'
                          : 'Invalid ticket.')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-4 text-sm font-semibold">
                  <div className="flex justify-between text-[#6d766d]">
                    <span>Attendee Name</span>
                    <span className="font-bold text-[#17211b]">
                      {lastScan.attendeeName}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6d766d]">
                    <span>Ticket Tier</span>
                    <span className="font-bold text-[#17211b]">
                      {lastScan.tierName}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6d766d]">
                    <span>Event</span>
                    <span className="font-bold text-[#17211b]">
                      {lastScan.eventName}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6d766d]">
                    <span>Ticket ID</span>
                    <span className="font-mono text-xs text-[#17211b]">
                      {lastScan.ticketId}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-16 flex flex-col items-center justify-center text-center text-[#6d766d]">
                <QrCode className="h-12 w-12 text-[#dce1d5]" />
                <p className="mt-3 text-sm font-bold">No tickets scanned yet</p>
                <p className="text-xs">
                  Scan a QR pass or enter a code to view attendee details.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setLastScan(null)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#dce1d5] bg-[#f7f7f2] py-3 text-xs font-bold text-[#17211b] transition hover:bg-[#dce1d5]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Result View
          </button>
        </div>
      </div>
    </div>
  );
}