'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, eventCover, mediaUrl, type ApiEvent } from '@/lib/api';
import { ArrowUpRight, Building2 } from 'lucide-react';
import { TicketCheckout } from '@/components/ticket-checkout';
import { formatDate, SHORT_DATE_FORMAT } from '@/utils/helpers';

const TABS = ['About', 'Venue'] as const;
type Tab = (typeof TABS)[number];


function DateRange({
  start,
  end,
  variant,
}: {
  start: string;
  end: string;
  variant: 'hero' | 'card';
}) {
  const isHero = variant === 'hero';
  const labelClass = isHero
    ? 'text-[10px] font-semibold uppercase tracking-wider text-white'
    : 'text-[10px] font-semibold uppercase tracking-wider text-[#6d766d]';

  if (start === end) {
    return <span className="whitespace-nowrap">{start}</span>;
  }

  return (
    <div
      className={
        isHero
          ? 'flex flex-wrap items-center gap-x-1.5 gap-y-1'
          : 'flex flex-col gap-1'
      }
    >
      <span className="flex items-baseline gap-1.5">
        <span className={labelClass}>From</span>
        <span className="whitespace-nowrap">{start}</span>
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className={labelClass}>To</span>
        <span className="whitespace-nowrap">{end}</span>
      </span>
    </div>
  );
}

export default function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [error, setError] = useState('');
  const [slug, setSlug] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('About');

  useEffect(() => {
    void params.then(({ slug: nextSlug }) => setSlug(nextSlug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    void api<ApiEvent>(`/events/${slug}`)
      .then(setEvent)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : 'Event could not be loaded',
        ),
      );
  }, [slug]);

  if (error)
    return (
      <main className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <p className="text-sm font-bold text-[#c34837]">{error}</p>
          <Link
            href="/events"
            className="mt-5 inline-block font-bold underline"
          >
            Back to events
          </Link>
        </div>
      </main>
    );

  if (!event)
    return (
      <div className="min-h-screen">
        <main className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 sm:pt-6 md:px-10">
          <section className="grid animate-pulse overflow-hidden rounded-3xl bg-gray-200 md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex min-h-87.5 flex-col justify-between p-6 sm:p-10 md:p-14">
              <div className="h-6 w-28 rounded-full bg-gray-300" />
              <div className="mt-8 space-y-4">
                <div className="h-4 w-36 rounded bg-gray-300" />
                <div className="h-16 w-3/4 rounded bg-gray-300" />
                <div className="h-12 w-full max-w-xl rounded bg-gray-300" />
                <div className="h-10 w-32 rounded-full bg-gray-300" />
              </div>
            </div>
            <div className="min-h-62.5 bg-gray-300" />
          </section>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="flex gap-6 border-b border-gray-200 pb-4">
                <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
              <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
                <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
                <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
              </div>
            </div>

            <aside className="h-80 animate-pulse rounded-3xl border border-gray-200 bg-gray-100 p-6" />
          </div>
        </main>
      </div>
    );

  const cover = eventCover(event);
  const gallery = (event.images ?? [])
    .map((image) => mediaUrl(image))
    .filter((image) => image && image !== cover);

  const hostName = event.organizer?.hostName || 'Event Host';
  const hostInitials = hostName
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formattedStartDate = formatDate(event.startsAt, SHORT_DATE_FORMAT);
  const formattedEndDate = formatDate(event.endsAt, SHORT_DATE_FORMAT);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 sm:pt-6 md:px-10">
        {/* HERO */}
        <section className="grid overflow-hidden rounded-3xl bg-[#ff765f] sm:rounded-4xl md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-w-0 flex-col justify-between gap-8 p-6 sm:p-10 md:p-12 lg:p-14">
            <span className="w-fit rounded-full bg-[#fffef9] px-3 py-1 text-xs font-bold">
              {event.category.name}
            </span>
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em]">
                <DateRange
                  start={formattedStartDate}
                  end={formattedEndDate}
                  variant="hero"
                />
              </div>

              <h1 className="wrap-break-word text-4xl font-bold leading-[0.95] tracking-tighter sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl">
                {event.name}
                <span className="text-[#d6f94a]">.</span>
              </h1>
              <p className="mt-4 line-clamp-4 max-w-xl text-xs font-semibold leading-relaxed sm:mt-6 sm:text-sm">
                {event.description}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCheckoutOpen(true);
                  document
                    .getElementById('tickets')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="mt-6 rounded-full bg-[#17211b] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#25332b] sm:mt-8 sm:text-sm"
              >
                Get tickets
              </button>
            </div>
          </div>
          <div
            className="min-h-62.5 bg-[#d6f94a] bg-cover bg-center sm:min-h-87.5 md:min-h-full"
            style={cover ? { backgroundImage: `url(${cover})` } : undefined}
            role="img"
            aria-label={cover ? `${event.name} cover` : undefined}
            aria-hidden={cover ? undefined : true}
          />
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT COLUMN */}
          <div className="min-w-0">
            {/* Tabs: underline sits ON the container border (no floating gap) */}
            <div
              role="tablist"
              className="flex gap-6 overflow-x-auto border-b border-[#dce1d5] text-sm font-bold"
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-px whitespace-nowrap border-b-2 pb-3 transition-colors ${
                    activeTab === tab
                      ? 'border-[#ff765f] text-[#17211b]'
                      : 'border-transparent text-[#6d766d] hover:text-[#17211b]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'About' && (
              <div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dce1d5] bg-white sm:h-16 sm:w-16">
                    {event.organizer?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaUrl(event.organizer.logoUrl)}
                        alt={hostName}
                        className="h-full w-full object-contain"
                      />
                    ) : hostInitials ? (
                      <span className="text-sm font-bold text-[#17211b] sm:text-base">
                        {hostInitials}
                      </span>
                    ) : (
                      <Building2 className="h-5 w-5 text-[#17211b] sm:h-6 sm:w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6d766d] sm:text-xs">
                      Hosted by
                    </p>
                    <h3 className="wrap-break-word text-base font-bold text-[#17211b] sm:text-lg">
                      {hostName}
                    </h3>
                  </div>
                </div>

                <h2 className="mt-8 text-2xl font-bold tracking-[-0.04em] sm:mt-10 sm:text-3xl">
                  About the event
                </h2>
                <p className="mt-4 max-w-xl whitespace-pre-line text-xs leading-6 text-[#6d766d] sm:mt-5 sm:text-sm sm:leading-7">
                  {event.description}
                </p>

                {gallery.length > 0 && (
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className="h-28 w-full rounded-xl object-cover sm:h-32"
                      />
                    ))}
                  </div>
                )}

                <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
                  <div className="min-w-0 rounded-xl border border-[#dce1d5] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6d766d] sm:text-xs">
                      When
                    </p>
                    <div className="mt-2 text-xs font-bold text-[#17211b] sm:text-sm">
                      <DateRange
                        start={formattedStartDate}
                        end={formattedEndDate}
                        variant="card"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 rounded-xl border border-[#dce1d5] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6d766d] sm:text-xs">
                      Where
                    </p>
                    <p className="mt-2 wrap-break-word text-xs font-bold text-[#17211b] sm:text-sm">
                      {event.city ?? 'Online'}
                    </p>
                    {event.venue && (
                      <p className="mt-0.5 wrap-break-word text-xs text-[#6d766d]">
                        {event.venue}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0 rounded-xl border border-[#dce1d5] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6d766d] sm:text-xs">
                      Capacity
                    </p>
                    <p className="mt-2 text-xs font-bold text-[#17211b] sm:text-sm">
                      {event.capacity != null
                        ? event.capacity.toLocaleString()
                        : 'Open'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Venue' && (
              <div>
                <h2 className="mt-8 text-3xl font-bold tracking-[-0.04em] sm:mt-10 sm:text-4xl">
                  Find your way there.
                </h2>
                <div className="mt-8 grid min-h-55 place-items-center rounded-2xl bg-[#7ca9ff] p-6 text-center sm:min-h-64">
                  <div className="min-w-0">
                    <p className="wrap-break-word text-xl font-bold text-[#17211b] sm:text-2xl">
                      {event.venue ?? 'Virtual venue'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#17211b]/80 sm:text-sm">
                      {event.city ?? 'Online event'}
                    </p>
                  </div>
                </div>

                {event.venue && (
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${event.venue},${event.city ?? 'Nigeria'}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#17211b] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#25332b] sm:text-sm"
                  >
                    <span>Get directions</span>
                    <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            )}
          </div>

          <aside
            id="tickets"
            className={`h-fit min-w-0 scroll-mt-6 rounded-3xl border border-[#dce1d5] bg-white p-4 transition sm:p-6 lg:sticky lg:top-6 ${
              checkoutOpen ? 'ring-2 ring-[#ff765f]' : ''
            }`}
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
              Select Tickets
            </p>
            <TicketCheckout eventId={event.id} tiers={event.ticketTiers} />
          </aside>
        </div>
      </main>
    </div>
  );
}
