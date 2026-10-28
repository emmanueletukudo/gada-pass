"use client"

import { PastEventsTab } from "@/components/dashboard/events/archive/archive-page";
import { useOrganizerEvents } from "@/lib/hooks-new/useOrganizerEvents";


export default function OrganizerArchivePage () {
  const { data: events = [], isLoading, error } = useOrganizerEvents();

  return (
    <PastEventsTab events={events as any} isLoading={isLoading}/>
  )
}