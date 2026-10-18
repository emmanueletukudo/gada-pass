'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import {
  Calendar,
  MapPin,
  QrCode,
  Download,
  Ticket,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AttendeeTicket {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  ticketCode: string;
  status: 'UPCOMING' | 'USED' | 'EXPIRED';
  qrCodeUrl?: string;
}

function TicketsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col justify-between h-56 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 rounded-full bg-[#e8ebe3]" />
              <div className="h-5 w-16 rounded-full bg-[#f0f3eb]" />
            </div>

            <div className="h-5 w-3/4 rounded-lg bg-[#e8ebe3]" />

            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-1/2 rounded bg-[#f0f3eb]" />
              <div className="h-3.5 w-2/3 rounded bg-[#f0f3eb]" />
            </div>
          </div>

          <div className="pt-4 border-t border-[#dce1d5] flex items-center justify-between">
            <div className="h-6 w-28 rounded-lg bg-[#f0f3eb]" />
            <div className="h-8 w-24 rounded-full bg-[#e8ebe3]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AttendeeTicketsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [tickets, setTickets] = useState<AttendeeTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<AttendeeTicket | null>(
    null,
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        setIsLoading(true);
        const statusParam = activeTab === 'upcoming' ? 'UPCOMING' : 'PAST';
        const data = await api<AttendeeTicket[]>(
          `/tickets/my-tickets?status=${statusParam}`,
        );
        setTickets(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load your tickets');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTickets();
  }, [activeTab]);

  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${selectedTicket?.ticketCode || 'gada-pass'}.pdf`);
      toast.success('Ticket PDF downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate ticket PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#17211b]">
            My Tickets & Events
          </h2>
          <p className="text-xs text-[#6d766d] mt-1">
            View your purchased event passes, upcoming schedules, and entry QR
            codes.
          </p>
        </div>
        <div className="flex rounded-full bg-[#f0f3eb] p-1 border border-[#dce1d5]">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-[#17211b] text-white shadow-sm'
                : 'text-[#6d766d] hover:text-[#17211b]'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-[#17211b] text-white shadow-sm'
                : 'text-[#6d766d] hover:text-[#17211b]'
            }`}
          >
            Past Tickets
          </button>
        </div>
      </div>


      {isLoading ? (
        <TicketsSkeleton />
      ) : tickets && tickets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col justify-between rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm transition hover:border-[#b5c2a8]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f7ee] px-3 py-1 text-[11px] font-bold text-[#17211b] border border-[#dce1d5]">
                    <Ticket className="h-3 w-3 text-[#17211b]" />
                    {ticket.ticketType}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#d6f94a]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#17211b]">
                    <Clock className="h-2.5 w-2.5" />
                    {ticket.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#17211b] tracking-tight">
                  {ticket.eventTitle}
                </h3>

                <div className="mt-4 space-y-2 text-xs text-[#6d766d]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[#17211b]" />
                    <span>{ticket.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#17211b]" />
                    <span>{ticket.eventLocation}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#dce1d5] flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#17211b] bg-[#f0f3eb] px-2.5 py-1 rounded-lg">
                  {ticket.ticketCode}
                </span>
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#17211b] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#25332b]"
                >
                  <QrCode className="h-3.5 w-3.5 text-[#d6f94a]" />
                  <span>View Pass</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#dce1d5] bg-[#fffef9] p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f3eb] text-[#6d766d] mb-3">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-[#17211b]">No tickets found</h3>
          <p className="text-xs text-[#6d766d] mt-1 max-w-sm">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming event passes right now."
              : "You don't have any past event tickets yet."}
          </p>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#dce1d5] bg-white p-6 shadow-xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17211b]">
                Event Access Pass
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-xs font-bold text-[#6d766d] hover:text-[#17211b]"
              >
                ✕ Close
              </button>
            </div>

            <div ref={ticketRef} className="space-y-4 bg-white p-2 rounded-2xl">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-[#6d766d]">
                  {selectedTicket.eventTitle}
                </span>
                <p className="text-xs font-mono font-bold text-[#17211b]">
                  {selectedTicket.ticketCode}
                </p>
              </div>

              <div className="flex items-center justify-center rounded-2xl bg-[#f4f7ee] border border-[#dce1d5] p-6">
                <div className="rounded-xl bg-white border border-[#17211b] p-3 shadow-inner">
                  {selectedTicket.qrCodeUrl ? (
                    <QRCodeSVG
                      value={selectedTicket.qrCodeUrl}
                      size={150}
                      level="M"
                      marginSize={2}
                    />
                  ) : (
                    <QrCode className="h-36 w-36 text-[#17211b]" />
                  )}
                </div>
              </div>

              <div className="space-y-1 text-center text-xs text-[#6d766d]">
                <p className="font-semibold">{selectedTicket.eventDate}</p>
                <p className="font-bold text-[#17211b]">
                  {selectedTicket.eventLocation}
                </p>
              </div>
            </div>

            <button
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-3.5 text-xs font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-[#d6f94a]" />
              <span>
                {isDownloading ? 'Generating PDF...' : 'Download Pass (PDF)'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
