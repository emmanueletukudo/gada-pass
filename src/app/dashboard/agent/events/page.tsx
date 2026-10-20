'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  ArrowRight,
  ImageIcon,
  Search,
  ScanLine,
  Clock,
  CalendarX2,
} from 'lucide-react';
import { useAssignedEvents } from '@/lib/hooks-new/useAgentEvents';

type AssignedEvent = NonNullable<
  ReturnType<typeof useAssignedEvents>['data']
>[number];

type EventStatus = 'live' | 'opening' | 'upcoming' | 'ended';
type Filter = 'all' | 'active' | 'upcoming' | 'past';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const CHECK_IN_LEAD_MS = 12 * HOUR;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17211b]/40 focus-visible:ring-offset-2';

/* ---------- helpers ---------- */

function getStatus(evt: AssignedEvent, now: number): EventStatus {
  const start = new Date(evt.startsAt).getTime();
  const end = evt.endsAt ? new Date(evt.endsAt).getTime() : start + DAY;
  if (now > end) return 'ended';
  if (now >= start) return 'live';
  if (now >= start - CHECK_IN_LEAD_MS) return 'opening';
  return 'upcoming';
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function getRelativeLabel(
  evt: AssignedEvent,
  status: EventStatus,
  now: number,
) {
  const start = new Date(evt.startsAt).getTime();
  const end = evt.endsAt ? new Date(evt.endsAt).getTime() : start + DAY;

  if (status === 'live') return 'Happening now';

  if (status === 'ended') {
    const days = Math.floor((now - end) / DAY);
    return days < 1 ? 'Ended today' : `Ended ${plural(days, 'day')} ago`;
  }

  const diff = start - now;
  if (diff < HOUR) {
    return `Starts in ${plural(Math.max(1, Math.round(diff / 60000)), 'min')}`;
  }
  if (diff < DAY) return `Starts in ${plural(Math.round(diff / HOUR), 'hr')}`;
  return `Starts in ${plural(Math.ceil(diff / DAY), 'day')}`;
}

function formatDateRange(evt: AssignedEvent) {
  const start = new Date(evt.startsAt);
  const fmt = (d: Date, withYear: boolean) =>
    d.toLocaleDateString('en-NG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      ...(withYear ? { year: 'numeric' } : {}),
    });

  const time = start.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (evt.endsAt) {
    const end = new Date(evt.endsAt);
    if (end.toDateString() !== start.toDateString()) {
      return { date: `${fmt(start, false)} – ${fmt(end, true)}`, time };
    }
  }
  return { date: fmt(start, true), time };
}

function getDayCount(evt: AssignedEvent) {
  if (!evt.endsAt) return 1;
  const start = new Date(evt.startsAt);
  const end = new Date(evt.endsAt);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY) + 1);
}

const humanize = (value: string) => {
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const STATUS_STYLE: Record<
  EventStatus,
  { label: string; badge: string; dot: string }
> = {
  live: {
    label: 'Live now',
    badge: 'bg-[#d6f94a] text-[#17211b]',
    dot: 'bg-emerald-600 animate-pulse',
  },
  opening: {
    label: 'Gates open',
    badge: 'bg-amber-100 text-amber-900',
    dot: 'bg-amber-600',
  },
  upcoming: {
    label: 'Upcoming',
    badge: 'bg-white/90 text-[#17211b]',
    dot: 'bg-[#6d766d]',
  },
  ended: {
    label: 'Ended',
    badge: 'bg-[#17211b]/80 text-white backdrop-blur-sm',
    dot: 'bg-[#a3aa9f]',
  },
};

const STATUS_ORDER: Record<EventStatus, number> = {
  live: 0,
  opening: 1,
  upcoming: 2,
  ended: 3,
};


export default function AgentAssignedEventsPage() {
  const { data: events = [], isLoading } = useAssignedEvents();

  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const enriched = useMemo(
    () =>
      events
        .map((evt) => ({ evt, status: getStatus(evt, now) }))
        .sort((a, b) => {
          const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          if (byStatus !== 0) return byStatus;
          const aStart = new Date(a.evt.startsAt).getTime();
          const bStart = new Date(b.evt.startsAt).getTime();
          return a.status === 'ended' ? bStart - aStart : aStart - bStart;
        }),
    [events, now],
  );

  const counts = useMemo(() => {
    const active = enriched.filter(
      (e) => e.status === 'live' || e.status === 'opening',
    ).length;
    const upcoming = enriched.filter((e) => e.status === 'upcoming').length;
    const past = enriched.filter((e) => e.status === 'ended').length;
    return { all: enriched.length, active, upcoming, past };
  }, [enriched]);

  const totalScanned = useMemo(
    () => events.reduce((sum, e) => sum + (e.scannedCount || 0), 0),
    [events],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter(({ evt, status }) => {
      if (filter === 'active' && status !== 'live' && status !== 'opening')
        return false;
      if (filter === 'upcoming' && status !== 'upcoming') return false;
      if (filter === 'past' && status !== 'ended') return false;
      if (!q) return true;
      return [evt.name, evt.venue, evt.city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [enriched, filter, query]);

  if (isLoading) return <EventsSkeleton />;

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'past', label: 'Past', count: counts.past },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 lg:px-0">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#17211b] sm:text-3xl">
          Assigned events
        </h1>
        <p className="text-sm text-[#6d766d]">
          Events where you are a gate agent. Open one to start scanning.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-10 text-center shadow-sm sm:p-14">
          <Calendar className="mx-auto h-12 w-12 text-[#6d766d]" />
          <h2 className="mt-4 text-base font-bold text-[#17211b]">
            No assigned events
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#6d766d]">
            You have not been assigned to any active events yet. Ask your
            organizer to add you as a gate agent.
          </p>
        </div>
      ) : (
        <>
          <section
            aria-label="Summary"
            className="grid grid-cols-3 gap-2 sm:gap-4"
          >
            {[
              { label: 'Assigned', value: counts.all },
              { label: 'Active now', value: counts.active },
              { label: 'Total scanned', value: totalScanned },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-3 shadow-sm sm:p-4"
              >
                <p className="text-xs font-semibold text-[#6d766d]">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-[#17211b] sm:text-2xl">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            ))}
          </section>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div
              role="group"
              aria-label="Filter events"
              className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none md:pb-0"
            >
              {tabs.map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(tab.id)}
                    className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${focusRing} ${
                      active
                        ? 'bg-[#17211b] text-white'
                        : 'border border-[#dce1d5] bg-[#fffef9] text-[#4d564d] hover:bg-[#e8ede0]'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-1.5 text-[11px] font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-[#f0f2ea] text-[#4d564d]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, venue or city"
                aria-label="Search events"
                className={`h-11 w-full rounded-full border border-[#dce1d5] bg-[#fffef9] pl-10 pr-4 text-base text-[#17211b] sm:text-sm ${focusRing}`}
              />
            </div>
          </div>
          {visible.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-10 text-center">
              <CalendarX2 className="mx-auto h-10 w-10 text-[#6d766d]" />
              <p className="mt-3 text-sm font-bold text-[#17211b]">
                No events match
              </p>
              <p className="mt-1 text-sm text-[#6d766d]">
                Try a different filter or search term.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  setQuery('');
                }}
                className={`mt-4 inline-flex h-10 items-center rounded-full border border-[#dce1d5] bg-[#fffef9] px-5 text-sm font-semibold text-[#17211b] hover:bg-[#e8ede0] ${focusRing}`}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visible.map(({ evt, status }, index) => (
                <li key={evt.id} className="flex">
                  <EventCard
                    evt={evt}
                    status={status}
                    now={now}
                    priority={index < 3}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}


function EventCard({
  evt,
  status,
  now,
  priority,
}: {
  evt: AssignedEvent;
  status: EventStatus;
  now: number;
  priority: boolean;
}) {
  const eventImage =
    evt.banner || (evt.images && evt.images.length > 0 ? evt.images[0] : null);

  const style = STATUS_STYLE[status];
  const { date, time } = formatDateRange(evt);
  const days = getDayCount(evt);
  const isEnded = status === 'ended';
  const location = evt.venue
    ? `${evt.venue}${evt.city ? `, ${evt.city}` : ''}`
    : 'Online event';

  return (
    <article
      className={`group relative flex w-full flex-col overflow-hidden rounded-3xl border bg-[#fffef9] shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-[#17211b]/40 ${
        status === 'live' ? 'border-[#d6f94a]' : 'border-[#dce1d5]'
      } ${isEnded ? 'opacity-90' : ''}`}
    >
      <div className="relative aspect-video w-full bg-[#f7f7f2]">
        {eventImage ? (
          <Image
            src={eventImage}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 384px, (min-width: 768px) 50vw, 100vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              isEnded ? 'grayscale-40' : ''
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#e8ede0] to-[#d6dccb] text-[#6d766d]">
            <ImageIcon className="h-10 w-10 opacity-50" aria-hidden="true" />
          </div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/35 to-transparent"
        />

        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${style.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>

        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#17211b]/80 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
          <ScanLine className="h-3.5 w-3.5 text-[#d6f94a]" aria-hidden="true" />
          {(evt.scannedCount || 0).toLocaleString()} scanned
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <p
              className={`text-xs font-semibold ${
                status === 'live'
                  ? 'text-emerald-700'
                  : status === 'opening'
                    ? 'text-amber-700'
                    : 'text-[#6d766d]'
              }`}
            >
              {getRelativeLabel(evt, status, now)}
            </p>
            <h2 className="line-clamp-2 text-lg font-bold leading-snug text-[#17211b] sm:text-xl">
              {evt.name}
            </h2>
          </div>

          <dl className="space-y-2 text-sm text-[#4d564d]">
            <div className="flex items-start gap-2.5">
              <dt className="sr-only">Date</dt>
              <Calendar
                className="mt-0.5 h-4 w-4 shrink-0 text-[#17211b]"
                aria-hidden="true"
              />
              <dd>
                {date}
                {days > 1 && (
                  <span className="ml-2 rounded-full bg-[#f0f2ea] px-2 py-0.5 text-[11px] font-semibold text-[#4d564d]">
                    {days} days
                  </span>
                )}
              </dd>
            </div>
            <div className="flex items-start gap-2.5">
              <dt className="sr-only">Start time</dt>
              <Clock
                className="mt-0.5 h-4 w-4 shrink-0 text-[#17211b]"
                aria-hidden="true"
              />
              <dd>Starts {time}</dd>
            </div>
            <div className="flex items-start gap-2.5">
              <dt className="sr-only">Location</dt>
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-[#17211b]"
                aria-hidden="true"
              />
              <dd className="line-clamp-2">{location}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e8ede0] pt-4">
          <span className="rounded-full bg-[#f0f2ea] px-3 py-1 text-xs font-semibold text-[#4d564d]">
            {humanize(evt.clearanceLevel || 'FULL_SYNC')}
          </span>
          <Link
            href={`/dashboard/agent?eventId=${evt.id}`}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition after:absolute after:inset-0 after:content-[''] focus-visible:outline-none ${
              isEnded
                ? 'border border-[#dce1d5] bg-[#f7f7f2] text-[#17211b] hover:bg-[#e8ede0]'
                : 'bg-[#17211b] text-white hover:bg-[#25332b]'
            }`}
          >
            <span>{isEnded ? 'View scanner' : 'Open scanner'}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ---------- loading skeleton ---------- */

function EventsSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 lg:px-0"
      aria-busy="true"
      aria-label="Loading assigned events"
    >
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[#e8ede0]" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[#f0f2ea]" />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl bg-[#f0f2ea]"
          />
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-[#dce1d5] bg-[#fffef9]"
          >
            <div className="aspect-video animate-pulse bg-[#e8ede0]" />
            <div className="space-y-3 p-6">
              <div className="h-3 w-24 animate-pulse rounded bg-[#f0f2ea]" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-[#e8ede0]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#f0f2ea]" />
              <div className="h-11 w-full animate-pulse rounded-full bg-[#e8ede0]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
