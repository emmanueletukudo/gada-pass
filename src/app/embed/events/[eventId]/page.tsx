import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import EmbedEventCard, {
  EmbedEventProps,
} from '@/components/embed/embed-event-card';
import { api } from '@/lib/hooks-new/api';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

async function fetchEventData(eventId: string) {
  try {
     const res = await api<EmbedEventProps['event']>(`/events/${eventId}`);
     return res;
  } catch (error) {
    console.error(`Failed to fetch embed event data for ID: ${eventId}`, error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const event = await fetchEventData(eventId);

  if (!event) {
    return {
      title: 'Event Not Found | Gada',
    };
  }

  return {
    title: `${event.name} | Get Tickets | Gada Pass`,
    description: `Get tickets for ${event.name} hosted by ${event.organizer?.hostName || 'Gada Organizers'}.`,
    robots: { index: false, follow: false },
  };
}

export default async function EventEmbedPage({ params }: PageProps) {
  const { eventId } = await params;
  const eventData = await fetchEventData(eventId);

  if (!eventData) {
    notFound();
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-transparent p-2 sm:p-4">
      <EmbedEventCard event={eventData} />
    </main>
  );
}
