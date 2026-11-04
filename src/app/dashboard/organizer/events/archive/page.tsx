"use client"

import { PastEventsTab } from "@/components/dashboard/events/archive/archive-page";
import { useOrganizerPastEvents } from '@/lib/hooks-new/useOrganizerEvents';


export default function OrganizerArchivePage () {
  const { data: events = [], isLoading, error } = useOrganizerPastEvents();

  return (
    <PastEventsTab events={events as any} isLoading={isLoading}/>
  )
}