'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Calendar, MapPin, ArrowRight, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type AssignedEvent = {
  id: string;
  name: string;
  startsAt: string;
  venue?: string;
  city?: string;
  banner?: string;
  images?: string[];
  clearanceLevel: string;
  scannedCount: number;
};

export default function AgentAssignedEventsPage() {
  const [events, setEvents] = useState<AssignedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void api<AssignedEvent[]>('/agents/assigned-events')
      .then((data) => setEvents(data ?? []))
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm font-bold text-[#6d766d]">
        Loading assigned events...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#17211b]">
          Assigned Events
        </h1>
        <p className="text-xs font-semibold text-[#6d766d]">
          Events where you are designated as a Gate Agent.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-12 text-center shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-[#6d766d]" />
          <h2 className="mt-4 text-base font-bold text-[#17211b]">
            No Assigned Events
          </h2>
          <p className="mt-1 text-xs text-[#6d766d]">
            You have not been assigned to any active events yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((evt) => {

            console.log('Event:', evt); 

            const eventImage =
              evt.banner ||
              (evt.images && evt.images.length > 0 ? evt.images[0] : null);

            return (
              <div
                key={evt.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#dce1d5] bg-[#fffef9] shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-48 w-full bg-[#f7f7f2]">
                  {eventImage ? (
                    <Image
                      src={eventImage}
                      alt={evt.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#e8ede0] text-[#6d766d]">
                      <ImageIcon className="h-10 w-10 opacity-50" />
                    </div>
                  )}

                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-[#d6f94a] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#17211b] shadow-sm">
                      {evt.clearanceLevel || 'FULL_SYNC'}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="rounded-full bg-[#17211b]/80 backdrop-blur-sm px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                      {evt.scannedCount || 0} Scanned
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-extrabold text-[#17211b]">
                      {evt.name}
                    </h3>

                    <div className="space-y-1.5 text-xs font-semibold text-[#6d766d]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#17211b]" />
                        <span>
                          {new Date(evt.startsAt).toLocaleDateString('en-NG', {
                            dateStyle: 'full',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#17211b]" />
                        <span>
                          {evt.venue
                            ? `${evt.venue}${evt.city ? `, ${evt.city}` : ''}`
                            : 'Online Event'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/agent?eventId=${evt.id}`}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#17211b] py-3 text-xs font-bold text-white transition hover:bg-[#25332b]"
                  >
                    <span>Launch Scanner</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
