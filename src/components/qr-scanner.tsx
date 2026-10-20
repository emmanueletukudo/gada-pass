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

const ELEMENT_ID = 'persistent-eventsgada-qr-reader';
const START_ATTEMPTS = 3;
let lifecycle: Promise<void> = Promise.resolve();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function releaseCamera(host: HTMLElement | null) {
  if (!host) return;
  host.querySelectorAll('video').forEach((video) => {
    const stream = video.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {}
    });
    video.srcObject = null;
  });
}

export function QrScanner({
  eventId,
  scanMode = 'IN',
  onScanSuccess,
  onScanError,
}: QrScannerProps) {
  const [result, setResult] = useState('Point camera at a ticket QR code');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [isScanning, setIsScanning] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef({ eventId, scanMode, onScanSuccess, onScanError });
  propsRef.current = { eventId, scanMode, onScanSuccess, onScanError };

  const processingRef = useRef(false);
  const runningRef = useRef(false);

  const restartCamera = useCallback(() => setCameraKey((k) => k + 1), []);

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
    } catch {
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
    const handleOnline = () => void triggerSync();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [triggerSync]);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) restartCamera();
    };
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const video = hostRef.current?.querySelector('video');
      if (video && video.paused) void video.play().catch(() => {});
    };
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [restartCamera]);

  useEffect(() => {
    const id = setInterval(() => {
      if (
        document.visibilityState !== 'visible' ||
        !runningRef.current ||
        processingRef.current
      ) {
        return;
      }
      const video = hostRef.current?.querySelector('video');
      const stream = (video?.srcObject as MediaStream | null) ?? null;
      const live =
        !!stream &&
        stream.getVideoTracks().some((t) => t.readyState === 'live');

      if (!video || !live) {
        runningRef.current = false;
        restartCamera();
        return;
      }
      if (video.paused) void video.play().catch(() => {});
    }, 3000);
    return () => clearInterval(id);
  }, [restartCamera]);


  useEffect(() => {
    let cancelled = false;
    let scanner: any = null;
    const host = hostRef.current;

    runningRef.current = false;
    processingRef.current = false;
    setCameraFailed(false);
    setIsScanning(true);

    const handleDecode = async (payload: string) => {
      if (cancelled || processingRef.current) return;
      processingRef.current = true;
      setIsScanning(false);

      const { eventId, scanMode, onScanSuccess, onScanError } =
        propsRef.current;

      try {
        if (!navigator.onLine) {
          if (eventId && !onScanSuccess) {
            await queueOfflineCheckIn(payload, eventId, scanMode);
          }
          setResult(`[OFFLINE ${scanMode}] Queued locally · reconnect to sync`);
          setStatus('queued');
          await onScanSuccess?.(payload);
        } else {
          if (onScanSuccess) {
            await onScanSuccess(payload);
            setResult('Scan processed · see result below');
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
          processingRef.current = false;
          if (cancelled) return;
          setStatus('idle');
          setIsScanning(true);
        }, 1200);
      }
    };

    const startTask = lifecycle.then(async () => {
      if (cancelled) return;

      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        let started = false;
        let lastError: unknown = null;

        for (let attempt = 0; attempt < START_ATTEMPTS; attempt++) {
          if (cancelled) return;

          if (host) host.innerHTML = '';

          try {
            scanner = new Html5Qrcode(ELEMENT_ID);
            await scanner.start(
              { facingMode: 'environment' },
              { fps: 15, qrbox: { width: 220, height: 220 } },
              handleDecode,
              () => undefined,
            );
            started = true;
            break;
          } catch (err) {
            lastError = err;
            try {
              scanner?.clear();
            } catch {}
            scanner = null;
            releaseCamera(host);
            await sleep(500 * (attempt + 1));
          }
        }

        if (!started) throw lastError ?? new Error('Camera failed to start');

        if (!cancelled) {
          runningRef.current = true;
          setResult('Point camera at a ticket QR code');
          setStatus('idle');
        }
      } catch {
        if (!cancelled) {
          setResult('Camera access unavailable · tap Restart camera');
          setStatus('error');
          setIsScanning(false);
          setCameraFailed(true);
        }
      }
    });

    lifecycle = startTask.catch(() => {});

    return () => {
      cancelled = true;
      runningRef.current = false;
      lifecycle = lifecycle.then(async () => {
        if (scanner) {
          try {
            if (scanner.isScanning) await scanner.stop();
          } catch {}
          try {
            scanner.clear();
          } catch {}
          scanner = null;
        }
        releaseCamera(host);
        if (host) host.innerHTML = '';
      });
    };
  }, [cameraKey]);

  return (
    <div className="w-full space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-[#dce1d5] bg-[#17211b]">
        <div
          ref={hostRef}
          id={ELEMENT_ID}
          className="w-full min-h-70 sm:min-h-80 [&_video]:w-full! [&_video]:object-cover"
        />

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

        {cameraFailed ? (
          <button
            type="button"
            onClick={restartCamera}
            className="flex items-center gap-1.5 rounded-full bg-[#17211b] px-3 py-1 text-[11px] font-bold text-white transition hover:bg-[#25332b]"
          >
            <Camera className="h-3 w-3" />
            <span>Restart camera</span>
          </button>
        ) : (
          status === 'error' && (
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
          )
        )}
      </div>
    </div>
  );
}
