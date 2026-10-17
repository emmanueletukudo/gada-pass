'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { queueOfflineCheckIn, getPendingSyncCount } from '@/lib/offline-db';
import { syncOfflineOutbox } from '@/lib/sync-manager';
import {
  CheckCircle2,
  XCircle,
  WifiOff,
  Camera,
  RefreshCw,
} from 'lucide-react';

type ScanStatus = 'idle' | 'success' | 'error' | 'queued' | 'syncing';

interface QrScannerProps {
  eventId?: string;
  scanMode?: 'IN' | 'OUT';
  onScanSuccess?: (payload: string) => Promise<void> | void;
  onScanError?: (error: Error) => void;
}

export function QrScanner({
  eventId,
  scanMode = 'IN',
  onScanSuccess,
  onScanError,
}: QrScannerProps) {
  const elementId = 'eventsgada-qr-reader';
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);

  const [result, setResult] = useState('Point camera at a ticket QR code');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [isScanning, setIsScanning] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    setStatus('syncing');
    setResult('Syncing offline scans...');

    try {
      await syncOfflineOutbox();
      const pending = await getPendingSyncCount().catch(() => 0);

      if (pending === 0) {
        setResult('Queued scans synced successfully!');
        setStatus('success');
      } else {
        setResult(`Sync completed · ${pending} scan(s) still pending`);
        setStatus('idle');
      }
    } catch (err) {
      const pending = await getPendingSyncCount().catch(() => 0);
      setResult(
        pending > 0
          ? `Sync failed · ${pending} queued scan(s) retained`
          : 'Sync failed · check network connection',
      );
      setStatus('error');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const handleOnline = () => {
      void triggerSync();
    };

    window.addEventListener('online', handleOnline);

    void import('html5-qrcode')
      .then(async ({ Html5Qrcode }) => {
        if (!active) return;

        const instance = new Html5Qrcode(elementId);
        scannerRef.current = instance;

        await instance.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 220, height: 220 },
          },
          async (payload) => {
            await instance.pause(true);
            setIsScanning(false);

            try {
              if (!navigator.onLine) {
                if (eventId) {
                  await queueOfflineCheckIn(payload, eventId, scanMode);
                }
                setResult(
                  `[OFFLINE ${scanMode}] Queued locally · reconnect to sync`,
                );
                setStatus('queued');
                if (onScanSuccess) {
                  await onScanSuccess(payload);
                }
              } else {
                if (onScanSuccess) {
                  await onScanSuccess(payload);
                } else {
                  const res = await api<{
                    valid: boolean;
                    attendeeName?: string;
                    tierName?: string;
                  }>('/events/check-in', {
                    method: 'POST',
                    body: JSON.stringify({
                      qrPayload: payload,
                      eventId,
                      mode: scanMode,
                    }),
                  });

                  setResult(
                    res.attendeeName
                      ? `Checked in: ${res.attendeeName} (${res.tierName || 'Standard'})`
                      : 'Valid ticket · Check-in confirmed',
                  );
                }
                setStatus('success');
              }
            } catch (error) {
              const errorObj =
                error instanceof Error ? error : new Error('Invalid ticket');
              setResult(errorObj.message);
              onScanError?.(errorObj);
              setStatus('error');
            } finally {
              setTimeout(() => {
                if (active) {
                  setStatus('idle');
                  setIsScanning(true);
                  void instance.resume();
                }
              }, 1200);
            }
          },
          () => undefined,
        );
      })
      .catch(() => {
        setResult('Camera access unavailable · use manual lookup');
        setStatus('error');
        setIsScanning(false);
      });

    return () => {
      active = false;
      window.removeEventListener('online', handleOnline);
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => undefined);
      }
    };
  }, [eventId, scanMode, onScanSuccess, onScanError, triggerSync]);

  return (
    <div className="w-full space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-[#dce1d5] bg-[#17211b]">
        <div id={elementId} className="w-full min-h-70 sm:min-h-80" />
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="relative h-52 w-52 sm:h-60 sm:w-60 rounded-2xl border-2 border-dashed border-[#d6f94a]/80 shadow-[0_0_0_9999px_rgba(23,33,27,0.55)]">
              <div className="absolute inset-x-0 h-1 bg-[#ff765f] shadow-[0_0_12px_#ff765f] animate-[scan_2s_infinite_ease-in-out]" />
            </div>
            <p className="mt-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/70 text-center">
              Align QR Code in Frame
            </p>
          </div>
        )}
      </div>

      <div
        className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
          status === 'success'
            ? 'border-[#d6f94a] bg-[#d6f94a]/20 text-[#17211b]'
            : status === 'error'
              ? 'border-[#ff765f] bg-[#ff765f]/15 text-[#c34837]'
              : status === 'queued'
                ? 'border-[#17211b] bg-[#17211b] text-white'
                : status === 'syncing'
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-[#dce1d5] bg-[#fffef9] text-[#17211b]'
        }`}
      >
        <div className="flex items-center gap-3">
          {status === 'success' && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#17211b]" />
          )}
          {status === 'error' && (
            <XCircle className="h-5 w-5 shrink-0 text-[#c34837]" />
          )}
          {status === 'queued' && (
            <WifiOff className="h-5 w-5 shrink-0 text-[#d6f94a]" />
          )}
          {(status === 'idle' || status === 'syncing') && (
            <Camera className="h-5 w-5 shrink-0 text-[#6d766d]" />
          )}

          <p className="text-xs font-bold tracking-tight">{result}</p>
        </div>

        {status === 'error' && (
          <button
            type="button"
            onClick={() => void triggerSync()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-full bg-[#17211b] px-3 py-1 text-[11px] font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span>Retry Sync</span>
          </button>
        )}
      </div>
    </div>
  );
}
