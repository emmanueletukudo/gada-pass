import {
  Calendar,
  Music,
  PartyPopper,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';

export const EVENT_TYPES = [
  {
    id: 'PARTY_SCENES',
    title: 'Party Scenes',
    description: 'Raves, beach parties, nightlife events',
    icon: PartyPopper,
    accent: 'bg-[#ff765f]/10 text-[#ff765f]',
  },
  {
    id: 'FREE_EVENT',
    title: 'Free Event',
    description: 'Parties, pop-ups, meetups',
    icon: Sparkles,
    accent: 'bg-[#d6f94a]/20 text-[#17211b]',
  },
  {
    id: 'SMALL_GATHERINGS',
    title: 'Small Gatherings',
    description: 'Birthdays, picnics, meetups',
    icon: Users,
    accent: 'bg-[#17211b]/5 text-[#17211b]',
  },
  {
    id: 'CONFERENCES',
    title: 'Conferences',
    description: 'Tech events, comicon, workshops',
    icon: Calendar,
    accent: 'bg-[#ff765f]/10 text-[#ff765f]',
  },
  {
    id: 'ONLINE_EVENT',
    title: 'Online Event',
    description: 'Virtual workshops, book clubs',
    icon: Video,
    accent: 'bg-[#d6f94a]/20 text-[#17211b]',
  },
  {
    id: 'LARGE_EVENTS',
    title: 'Large Events',
    description: 'Concerts, festivals, live shows',
    icon: Music,
    accent: 'bg-[#17211b]/5 text-[#17211b]',
  },
];
