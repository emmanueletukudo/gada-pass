'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Loader2, XCircle, PartyPopper } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useCurrentUser();

  const eventId = params.slug as string;
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>(
    'loading',
  );

  console.log('Event ID:', eventId);
  const [message, setMessage] = useState(
    'Verifying your payment and generating tickets...',
  );
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!reference || hasVerified.current) return;
    hasVerified.current = true;

    const verifyAndReservePayment = async () => {
      try {
        await api(`/events/${eventId}/reserve`, {
          method: 'POST',
          body: JSON.stringify({
            paymentReference: reference,
          }),
        });

        setStatus('success');
        setMessage('Payment confirmed! Ticket details sent to your email.');
        toast.success('Payment verified successfully!');

        if (isAuthenticated) {
          setTimeout(() => {
            router.push('/dashboard/attendee');
          }, 2500);
        } else {
          router.push(`/events/${eventId}`);
        }
      } catch (err: any) {
        setStatus('failed');
        setMessage(
          err.message || 'Payment verification or reservation failed.',
        );
        toast.error('Unable to finalize ticket reservation.');
      }
    };

    verifyAndReservePayment();
  }, [reference, eventId, router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-8 shadow-sm">
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#17211b]" />
            <h2 className="text-xl font-bold text-[#17211b]">
              Confirming Payment
            </h2>
            <p className="text-sm text-[#6d766d]">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <PartyPopper className="h-12 w-12 text-[#c34837]" />
            <h2 className="text-xl font-bold text-[#17211b]">
              Payment Successful!
            </h2>
            <p className="text-sm text-[#6d766d]">{message}</p>
            <p className="text-xs text-[#9f9fa8]">
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-[#c34837]" />
            <h2 className="text-xl font-bold text-[#17211b]">
              Verification Failed
            </h2>
            <p className="text-sm text-[#6d766d]">{message}</p>
            <button
              type="button"
              onClick={() => router.push(`/events/${eventId}`)}
              className="mt-4 rounded-full bg-[#17211b] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#25332b]"
            >
              Back to Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
