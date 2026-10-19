import { ApiEvent, eventCover } from '@/lib/api';
import { MoveUpIcon, MoveUpRight } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import {formatDate, SHORT_DATE_FORMAT} from "@/utils/helpers"

type EventCardProps = {
  event: ApiEvent;
  index: number;
};

export const EventCard: FC<EventCardProps> = ({ event, index }) => {
  const formtedStartDate = formatDate(event.startsAt, SHORT_DATE_FORMAT);
  const formatedEndDate = formatDate(event.endsAt, SHORT_DATE_FORMAT);


  return (
    <Link
      href={`/events/${event.slug}`}
      key={event.id}
      className="event-card overflow-hidden rounded-2xl border border-[#dce1d5] bg-[#fffef9]"
    >
      <div
        className="relative flex h-44 items-end justify-between overflow-hidden p-5"
        style={{
          background: [
            '#ff765f',
            '#7ca9ff',
            '#d6f94a',
            '#f3c9d6',
            '#c9b9ff',
            '#ffc86b',
          ][index % 6],
        }}
      >
        {eventCover(event) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={eventCover(event)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="display text-6xl font-bold text-[#17211b26]">
            {new Date(event.startsAt).getDate()}
          </span>
        )}
        <span className="relative rounded-full bg-[#fffef9] px-3 py-1 text-xs font-bold">
          {event.category && event.category.name}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs font-bold tracking-widest text-[#ff765f]">
          {new Date(event.startsAt)
            .toLocaleDateString('en-NG', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
            .toUpperCase()}
        </p>
        <h2 className="display mt-3 text-2xl font-bold tracking-tighter">
          {event.name}
        </h2>
        <p className="mt-2 text-sm text-[#6d766d]">
          {event.city ?? 'Online'} · {event.venue ?? 'Virtual venue'}
        </p>
        <div className="flex flex-row items-center justify-between">
          <p className="mt-6 text-sm font-bold">
            From {event.ticketTiers[0]?.currency ?? 'NGN'}{' '}
            {Number(event.ticketTiers[0]?.price ?? 0).toLocaleString()}{' '}
          </p>
          <MoveUpRight className="text-lg" />
        </div>
      </div>
    </Link>
  );
};
