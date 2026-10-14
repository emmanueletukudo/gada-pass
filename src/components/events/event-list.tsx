import { ApiEvent } from '@/lib/api';
import { FC } from 'react';
import { EventCard } from './event-card';

type EventListProps = {
  events: ApiEvent[];
}

export const EventList: FC<EventListProps> = ({events}) => {
  return (
   <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {
       events && events.map((event, index) => (
            <EventCard key={event.id} index={index} event={event} />
        ))
    }
   </div>
  );
};
