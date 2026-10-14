'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { flushOfflineScans, queueOfflineScan } from '@/lib/offline-scans';
import { CheckCircle2, XCircle, WifiOff, Camera } from 'lucide-react';

type ScanStatus = 'idle' | 'success' | 'error' | 'queued';

interface QrScannerProps {
  onScanSuccess?: (payload: string) => void;
  onScanError?: (error: Error) => void;
}

export function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  const elementId = 'eventsgada-qr-reader';
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);

  const [result, setResult] = useState('Point camera at a ticket QR code');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let active = true;

    const sync = () => {
      void flushOfflineScans()
        .then((count) => {
          if (count) {
            setResult(`${count} queued scan${count === 1 ? '' : 's'} synced`);
            setStatus('success');
          }
        })
        .catch(() => {
          setResult('Sync failed · queued scans retained');
          setStatus('error');
        });
    };

    window.addEventListener('online', sync);

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
                await queueOfflineScan({
                  ticketCode: payload,
                  scannedAt: new Date().toISOString(),
                  agentId: 'current-agent',
                });
                setResult('Queued offline · reconnect to sync');
                setStatus('queued');
              } else {
                const res = await api<{
                  valid: boolean;
                  attendeeName?: string;
                  tierName?: string;
                }>('/events/check-in', {
                  method: 'POST',
                  body: JSON.stringify({ qrPayload: payload }),
                });

                setResult(
                  res.attendeeName
                    ? `Checked in: ${res.attendeeName} (${res.tierName})`
                    : 'Valid ticket · Check-in confirmed',
                );
                setStatus('success');
                onScanSuccess?.(payload);
              }
            } catch (error) {
              setResult(
                error instanceof Error ? error.message : 'Invalid ticket',
              );
              onScanError?.(error as Error);
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
      window.removeEventListener('online', sync);
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => undefined);
      }
    };
  }, []);

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
        className={`flex items-center gap-3 rounded-2xl border p-4 transition-all duration-200 ${
          status === 'success'
            ? 'border-[#d6f94a] bg-[#d6f94a]/20 text-[#17211b]'
            : status === 'error'
              ? 'border-[#ff765f] bg-[#ff765f]/15 text-[#c34837]'
              : status === 'queued'
                ? 'border-[#17211b] bg-[#17211b] text-white'
                : 'border-[#dce1d5] bg-[#fffef9] text-[#17211b]'
        }`}
      >
        {status === 'success' && (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#17211b]" />
        )}
        {status === 'error' && (
          <XCircle className="h-5 w-5 shrink-0 text-[#c34837]" />
        )}
        {status === 'queued' && (
          <WifiOff className="h-5 w-5 shrink-0 text-[#d6f94a]" />
        )}
        {status === 'idle' && (
          <Camera className="h-5 w-5 shrink-0 text-[#6d766d]" />
        )}

        <p className="text-xs font-bold tracking-tight">{result}</p>
      </div>
    </div>
  );
}
