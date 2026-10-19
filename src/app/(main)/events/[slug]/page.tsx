'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, eventCover, mediaUrl, type ApiEvent } from '@/lib/api';
import { ArrowUpRight, Building2 } from 'lucide-react';
import { TicketCheckout } from '@/components/ticket-checkout';
import { formatDate, SHORT_DATE_FORMAT } from '@/utils/helpers';

export default function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [error, setError] = useState('');
  const [slug, setSlug] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'About' | 'Schedule' | 'Venue'>(
    'About',
  );

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
        <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 md:px-10">
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:px-10">
          <section className="grid overflow-hidden rounded-3xl bg-gray-200 md:grid-cols-[1.1fr_0.9fr] animate-pulse">
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
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const foramtedStartDate = formatDate(event.startsAt, SHORT_DATE_FORMAT);
  const formatedEndDate = formatDate(event.endsAt, SHORT_DATE_FORMAT);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:px-10">
        <section className="grid overflow-hidden rounded-3xl sm:rounded-4xl bg-[#ff765f] md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between p-6 sm:p-10 md:p-14">
            <span className="w-fit rounded-full bg-[#fffef9] px-3 py-1 text-xs font-bold">
              {event.category.name}
            </span>
            <div className="mt-6 md:mt-0">
              <p className="mb-3 text-xs mt-2 font-bold uppercase tracking-[0.2em]">
                {foramtedStartDate === formatedEndDate ? (
                  foramtedStartDate
                ) : (
                  <>
                    <span className="text-[10px] uppercase font-semibold text-white tracking-wider mr-1">
                      From
                    </span>
                    {foramtedStartDate}
                    <span className="text-[10px] uppercase font-semibold text-white tracking-wider mx-1">
                      to
                    </span>
                    {formatedEndDate}
                  </>
                )}

              </p>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold leading-[0.9] tracking-[-0.06em] wrap-break-word">
                {event.name}
                <span className="text-[#d6f94a]">.</span>
              </h1>
              <p className="mt-4 sm:mt-6 max-w-xl text-xs sm:text-sm font-semibold leading-relaxed">
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
                className="mt-6 sm:mt-8 rounded-full bg-[#17211b] px-6 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-[#25332b]"
              >
                Get tickets
              </button>
            </div>
          </div>
          <div
            className="relative flex min-h-62.5 sm:min-h-87.5 md:min-h-full flex-col justify-end overflow-hidden bg-[#d6f94a] p-6 sm:p-10 md:p-14"
            style={
              cover
                ? {
                    backgroundImage: `url(${cover})`,
                    width: '100%',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          />
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex gap-6 overflow-x-auto border-b border-[#dce1d5] pb-4 text-sm font-bold">
              {(['About', 'Venue'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap pb-4 transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-[#ff765f] text-[#17211b]'
                      : 'text-[#6d766d] hover:text-[#17211b]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'About' && (
              <div>
                <div className="mt-8 flex items-center gap-4 p-2">
                  <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden border text-white">
                    {event.organizer?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaUrl(event.organizer.logoUrl)}
                        alt={hostName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm sm:text-base font-bold">
                        {hostInitials || (
                          <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
                      Hosted by
                    </p>
                    <h3 className="text-base sm:text-lg font-bold text-[#17211b]">
                      {hostName}
                    </h3>
                  </div>
                </div>

                <h2 className="mt-8 sm:mt-10 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                  About the event
                </h2>
                <p className="mt-4 sm:mt-5 max-w-xl text-xs sm:text-sm leading-6 sm:leading-7 text-[#6d766d]">
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
                        className="h-28 sm:h-32 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#dce1d5] p-4 bg-white">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
                      When
                    </p>

                    <div className="inline-flex items-center gap-2 text-xs font-bold text-[#17211b]">
                      <span>
                        {foramtedStartDate === formatedEndDate ? (
                          foramtedStartDate
                        ) : (
                          <>
                            <span className="text-[10px] uppercase font-semibold text-[#6d766d] tracking-wider mr-1">
                              From
                            </span>
                            {foramtedStartDate}
                            <span className="text-[10px] uppercase font-semibold text-[#6d766d] tracking-wider mx-1">
                              to
                            </span>
                            {formatedEndDate}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#dce1d5] p-4 bg-white">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
                      Where
                    </p>
                    <p className="mt-2 text-xs sm:text-sm font-bold text-[#17211b]">
                      {event.city ?? 'Online'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#dce1d5] p-4 bg-white">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
                      Capacity
                    </p>
                    <p className="mt-2 text-xs sm:text-sm font-bold text-[#17211b]">
                      {event.capacity ?? 'Open'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Venue' && (
              <div>
                <h2 className="mt-8 sm:mt-10 text-3xl sm:text-4xl font-bold tracking-[-0.04em]">
                  Find your way there.
                </h2>
                <div className="mt-8 grid min-h-55 sm:min-h-64 place-items-center rounded-2xl bg-[#7ca9ff] p-6 text-center">
                  <div>
                    <p className="mt-3 text-xl sm:text-2xl font-bold text-[#17211b]">
                      {event.venue ?? 'Virtual venue'}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-[#17211b]/80">
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
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#17211b] px-5 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-[#25332b]"
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
            className={`h-fit rounded-3xl border border-[#dce1d5] bg-white p-4 sm:p-6 transition ${
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
