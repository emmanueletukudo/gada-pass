'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, eventCover, mediaUrl, type ApiEvent } from '@/lib/api';
import { ArrowUpRight, Building2 } from 'lucide-react';
import { TicketCheckout } from '@/components/ticket-checkout';

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
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-10">
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
        </header>

        <main className="mx-auto max-w-7xl px-5 pb-20 md:px-10">
          <section className="grid overflow-hidden rounded-4xl bg-gray-200 md:grid-cols-[1.1fr_0.9fr] animate-pulse">
            <div className="flex min-h-107.5 flex-col justify-between p-8 md:p-14">
              <div className="h-6 w-28 rounded-full bg-gray-300" />
              <div className="mt-8 space-y-4">
                <div className="h-4 w-36 rounded bg-gray-300" />
                <div className="h-16 w-3/4 rounded bg-gray-300" />
                <div className="h-12 w-full max-w-xl rounded bg-gray-300" />
                <div className="h-10 w-32 rounded-full bg-gray-300" />
              </div>
            </div>
            <div className="min-h-75 bg-gray-300" />
          </section>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
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

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-5 pb-20 md:px-10">
        <section className="grid overflow-hidden rounded-4xl bg-[#ff765f] md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-107.5 flex-col justify-between p-8 md:p-14">
            <span className="w-fit rounded-full bg-[#fffef9] px-3 py-1 text-xs font-bold">
              {event.category.name}
            </span>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em]">
                {new Date(event.startsAt).toLocaleString('en-NG', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </p>
              <h1 className="display text-6xl font-bold leading-[0.85] tracking-[-0.08em] md:text-8xl">
                {event.name}
                <span className="text-[#d6f94a]">.</span>
              </h1>
              <p className="mt-6 max-w-xl text-sm font-semibold">
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
                className="mt-8 rounded-full bg-[#17211b] px-6 py-3 text-sm font-bold text-white"
              >
                Get tickets
              </button>
            </div>
          </div>
          <div
            className="relative flex min-h-75 flex-col justify-end overflow-hidden bg-[#d6f94a] p-8 md:p-14"
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

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex gap-6 overflow-x-auto border-b border-[#dce1d5] pb-4 text-sm font-bold">
              {(['About', 'Venue'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap pb-4 ${
                    activeTab === tab
                      ? 'border-b-2 border-[#ff765f]'
                      : 'text-[#6d766d]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'About' && (
              <div>
                <div className="mt-8 flex items-center gap-4 p-2">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ff765f] bg-[#17211b] text-white">
                    {event.organizer?.logoUrl ? (
                      <img
                        src={mediaUrl(event.organizer.logoUrl)}
                        alt={hostName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold">
                        {hostInitials || <Building2 className="h-6 w-6" />}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
                      Hosted by
                    </p>
                    <h3 className="text-lg font-bold text-[#17211b]">
                      {hostName}
                    </h3>
                  </div>
                </div>

                <h2 className="display mt-10 text-3xl font-bold tracking-[-0.06em]">
                  About the event
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-[#6d766d]">
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
                        className="h-32 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#dce1d5] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
                      When
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {new Date(event.startsAt).toLocaleDateString('en-NG', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#dce1d5] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
                      Where
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {event.city ?? 'Online'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#dce1d5] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
                      Capacity
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {event.capacity ?? 'Open'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Venue' && (
              <div>
                <h2 className="display mt-10 text-4xl font-bold tracking-[-0.06em]">
                  Find your way there.
                </h2>
                <div className="grain mt-8 grid min-h-64 place-items-center rounded-2xl bg-[#7ca9ff] p-6 text-center">
                  <div>
                    <p className="display mt-3 text-2xl font-bold">
                      {event.venue ?? 'Virtual venue'}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
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
                    className="mt-5 inline-block rounded-full bg-[#17211b] px-5 py-3 text-sm font-bold text-white"
                  >
                    <div className="flex flex-row items-center justify-center">
                      Get directions
                      <ArrowUpRight size={18} />
                    </div>
                  </Link>
                )}
              </div>
            )}
          </div>

          <aside
            id="tickets"
            className={`h-fit rounded-3xl border border-[#dce1d5] bg-white p-6 transition ${
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
