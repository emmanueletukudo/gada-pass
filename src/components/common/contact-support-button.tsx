'use client';

import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ContactSupportButtonProps {
  organizerPhone: string;
  eventName: string;
  eventId: string;
  orderId: string;
  guestName: string;
  guestPhone: string;
  className?: string;
}

export function ContactSupportButton({
  organizerPhone,
  eventName,
  eventId,
  orderId,
  guestName,
  guestPhone,
  className = '',
}: ContactSupportButtonProps) {
  const [isLogging, setIsLogging] = useState(false);

  const handleContactClick = async () => {
    const prefilledMessage = `Hello, I need assistance with my Order #${orderId} for "${eventName}".`;
    try {
      setIsLogging(true);
      await api('/support-inquiries', {
        method: 'POST',
        body: JSON.stringify({
          eventId,
          orderId,
          guestName,
          phoneNumber: guestPhone,
          lastMessage: prefilledMessage,
        }),
      });
    } catch (error) {
      console.error('Failed to log support inquiry:', error);
    } finally {
      setIsLogging(false);
    }

    const cleanOrganizerPhone = organizerPhone.replace(/\D/g, '');
    const fullWhatsAppText = `*Support Request*\n*Order ID:* ${orderId}\n*Guest:* ${guestName}\n*Event:* ${eventName}\n\n*Message:* ${prefilledMessage}`;
    const encodedText = encodeURIComponent(fullWhatsAppText);

    window.open(
      `https://wa.me/${cleanOrganizerPhone}?text=${encodedText}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <button
      onClick={handleContactClick}
      disabled={isLogging}
      className={`inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#20bd5a] disabled:opacity-50 ${className}`}
    >
      {isLogging ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      <span>Chat Support on WhatsApp</span>
    </button>
  );
}
