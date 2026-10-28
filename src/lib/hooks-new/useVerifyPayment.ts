import { useMutation } from '@tanstack/react-query';
import { api } from './api';

interface VerifyPaymentInput {
  eventId: string;
  paymentReference: string;
}

interface VerifyPaymentResponse {
  message?: string;
  [key: string]: unknown;
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: ({ eventId, paymentReference }: VerifyPaymentInput) =>
      api<VerifyPaymentResponse>(`/events/${eventId}/reserve`, {
        method: 'POST',
        body: JSON.stringify({ paymentReference }),
      }),
  });
}
