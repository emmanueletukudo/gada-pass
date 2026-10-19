import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import EmbedEventCard, {
  EmbedEventProps,
} from '@/components/embed/embed-event-card';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { eventId } = await params;

  try {
    const event = await api<EmbedEventProps['event']>(
      `/events/${eventId}`,
    );

    return {
      title: `${event.name} - Get Tickets | Gada Pass`,
      description: `Get tickets for ${event.name} hosted by ${event.organizer.hostName}.`,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: 'Event Not Found | Gada',
    };
  }
}

export default async function EventEmbedPage({ params }: PageProps) {
  const { eventId } = await params;

  let eventData: EmbedEventProps['event'] | null = null;

  try {
    eventData = await api<EmbedEventProps['event']>(
      `/events/${eventId}`,
    );
    console.log('eventData', eventData)
  } catch (error) {
    console.error('Failed to fetch embed event data:', error);
  }

  if (!eventData) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full bg-transparent flex items-center justify-center p-2 sm:p-4">
      <EmbedEventCard event={eventData} />
    </main>
  );
}
