'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Loader2, XCircle, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useVerifyPayment } from '@/lib/hooks-new/useVerifyPayment';

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { isAuthenticated } = useCurrentUser();

  const eventId = params.slug as string;
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const {
    mutate: verifyPayment,
    isPending,
    isSuccess,
    isError,
    error,
  } = useVerifyPayment();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!reference || !eventId || hasTriggered.current) return;
    hasTriggered.current = true;

    verifyPayment(
      { eventId, paymentReference: reference },
      {
        onSuccess: () => {
          toast.success('Payment verified successfully!');
          setTimeout(() => {
            if (isAuthenticated) {
              router.push('/dashboard/attendee');
            } else {
              router.push(`/events/${eventId}`);
            }
          }, 2500);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : 'Unable to finalize ticket reservation.',
          );
        },
      },
    );
  }, [reference, eventId, isAuthenticated, router, verifyPayment]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : 'Payment verification or reservation failed.';

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-8 shadow-sm">
        {isPending && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#17211b]" />
            <h2 className="text-xl font-bold text-[#17211b]">
              Confirming Payment
            </h2>
            <p className="text-sm text-[#6d766d]">
              Verifying your payment and generating tickets...
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="flex flex-col items-center space-y-4">
            <PartyPopper className="h-12 w-12 text-[#c34837]" />
            <h2 className="text-xl font-bold text-[#17211b]">
              Payment Successful!
            </h2>
            <p className="text-sm text-[#6d766d]">
              Payment confirmed! Ticket details sent to your email.
            </p>
            <p className="text-xs text-[#9f9fa8]">
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-[#c34837]" />
            <h2 className="text-xl font-bold text-[#17211b]">
              Verification Failed
            </h2>
            <p className="text-sm text-[#6d766d]">{errorMessage}</p>
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
