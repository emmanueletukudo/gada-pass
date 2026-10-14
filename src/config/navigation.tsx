import {
  LayoutDashboard,
  CalendarSearch,
  MessagesSquare,
  Settings,
  QrCode,
  Tickets,
  Users,
  ShieldAlert,
  FolderKanban,
} from 'lucide-react';

export type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

export const ROLE_NAV_ITEMS: Record<string, NavItem[]> = {
  organizer: [
    {
      label: 'Overview',
      path: '',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: 'Events',
      path: '/events',
      icon: <CalendarSearch className="h-4 w-4" />,
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: <MessagesSquare className="h-4 w-4" />,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],

  agent: [
    {
      label: 'Scanner',
      path: '',
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      label: 'Assigned Events',
      path: '/events',
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],


  attendee: [
    {
      label: 'Overview',
      path: '',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: 'My Tickets',
      path: '/tickets',
      icon: <Tickets className="h-4 w-4" />,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],


  admin: [
    {
      label: 'Overview',
      path: '',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: 'All Events',
      path: '/events',
      icon: <CalendarSearch className="h-4 w-4" />,
    },
    {
      label: 'Users',
      path: '/users',
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Security & Logs',
      path: '/security',
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
};