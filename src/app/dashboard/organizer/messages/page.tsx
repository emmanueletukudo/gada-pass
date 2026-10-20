'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  MessageCircle,
  Send,
  Users,
  Search,
  CheckCircle2,
  RotateCcw,
  Ticket,
} from 'lucide-react';
import { toast } from 'sonner';
import { NoInquiriesState } from '@/components/dashboard/no-inquiries';
import { MessagingHubSkeleton } from '@/components/dashboard/common/messaging-hub-skeleton';
import {
  useSupportInquiries,
  useUpdateInquiryStatus,
  SupportInquiry,
} from '@/lib/hooks-new/useSupportInquiries';

export default function OrganizerMessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tickets = [], isLoading, error } = useSupportInquiries();
  const updateStatusMutation = useUpdateInquiryStatus();

  const handleWhatsAppRedirect = (
    phone: string,
    guestName: string,
    eventName: string,
    orderId: string,
  ) => {
    const baseMessage = `Hello ${guestName}, this is the organizer for "${eventName}". We received your support query regarding Order #${orderId}. How can we assist you?`;
    const encodedText = encodeURIComponent(baseMessage);

    window.open(
      `https://wa.me/${phone}?text=${encodedText}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleToggleStatus = (
    id: string,
    currentStatus: 'OPEN' | 'RESOLVED',
  ) => {
    const newStatus = currentStatus === 'OPEN' ? 'RESOLVED' : 'OPEN';

    updateStatusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            `Inquiry marked as ${newStatus === 'RESOLVED' ? 'Resolved' : 'Open'}`,
          );
        },
        onError: (err) => {
          console.error('Failed to update status:', err);
          toast.error('Failed to update status');
        },
      },
    );
  };

  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const filteredTickets = safeTickets.filter(
    (t) =>
      t.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.ticketTierName &&
        t.ticketTierName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#17211b]">
            Messaging Hub
          </h2>
          <p className="text-sm text-[#6d766d]">
            Engage directly with confirmed ticket holders via WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 md:col-span-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff765f]/10 text-[#ff765f]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17211b]">
              Broadcast Direct Update
            </h3>
            <p className="mt-1 text-xs text-[#6d766d]">
              Need to announce a venue change or timing adjustment? Export
              active phone lists or trigger bulk notifications.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-[#17211b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#25332b]">
            <span>Coming soon</span>
            <Send className="h-3 w-3" />
          </button>
        </div>

        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6">
          <div className="space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6f94a]/20 text-[#17211b]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17211b]">
                WhatsApp Gateway
              </h3>
              <p className="mt-1 text-xs text-[#6d766d]">
                Verified guest tickets automatically log inquiries into your
                support dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-6 rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6d766d]">
              Ticket Holder Support Inquiries
            </h3>
            <p className="mt-0.5 text-xs text-[#6d766d]">
              Click any record to open direct WhatsApp conversation.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
            <input
              type="text"
              placeholder="Search guest, tier, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#dce1d5] bg-[#fffef9] py-2.5 pl-10 pr-4 text-xs font-semibold placeholder-[#6d766d] outline-none transition focus:border-[#17211b]"
            />
          </div>
        </div>

        {isLoading ? (
          <MessagingHubSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-[#ffb3a7] bg-[#fff0ed] p-6 text-center text-sm font-bold text-[#a13c2d]">
            Failed to load guest inquiries
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="divide-y divide-[#dce1d5]">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="my-2.5 flex flex-col justify-between gap-4 rounded-xl px-2 py-5 transition hover:bg-[#17211b]/5 sm:flex-row sm:items-center"
              >
                <div className="max-w-xl space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#17211b]">
                      {ticket.guestName}
                    </span>

                    {ticket.ticketTierName && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#17211b]/5 px-2 py-0.5 text-[11px] font-bold text-[#17211b]">
                        <Ticket className="h-3 w-3 text-[#ff765f]" />
                        <span>
                          {ticket.ticketQuantity}x {ticket.ticketTierName}
                        </span>
                      </span>
                    )}

                    <span className="rounded bg-[#17211b]/5 px-2 py-0.5 text-xs font-medium text-[#6d766d]">
                      {ticket.eventName}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        ticket.status === 'OPEN'
                          ? 'bg-[#ff765f]/10 text-[#ff765f]'
                          : 'bg-[#dce1d5] text-[#6d766d]'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm font-medium text-[#6d766d]">
                    "{ticket.lastMessage}"
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <button
                    onClick={() => handleToggleStatus(ticket.id, ticket.status)}
                    disabled={updateStatusMutation.isPending}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
                      ticket.status === 'OPEN'
                        ? 'border-[#dce1d5] bg-transparent text-[#6d766d] hover:bg-[#17211b]/5'
                        : 'border-[#17211b]/10 bg-[#17211b]/5 text-[#17211b] hover:bg-[#17211b]/10'
                    }`}
                  >
                    {ticket.status === 'OPEN' ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Resolved</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reopen</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handleWhatsAppRedirect(
                        ticket.phoneNumber,
                        ticket.guestName,
                        ticket.eventName,
                        ticket.orderId,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-[#17211b] bg-[#17211b] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#25332b]"
                  >
                    <span>Chat on WhatsApp</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#d6f94a]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoInquiriesState
            isFiltered={searchQuery.length > 0}
            onResetSearch={() => setSearchQuery('')}
          />
        )}
      </section>
    </div>
  );
}
