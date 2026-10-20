'use client';

import { use } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, ArrowLeft, Weight, CalendarDays, CodeXml } from 'lucide-react';

interface EventLayoutProps {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}

export default function EventWorkspaceLayout({
  children,
  params,
}: EventLayoutProps) {
  const { eventId } = use(params);
  const pathname = usePathname();

  const tabs = [
    {
      label: 'Overview',
      href: `/dashboard/organizer/events/${eventId}`,
      icon: Weight,
      exact: true,
    },
    {
      label: 'Gate Agents',
      href: `/dashboard/organizer/events/${eventId}/agents`,
      icon: Users,
      exact: false,
    },
    {
      label: 'Update Event',
      href: `/dashboard/organizer/events/${eventId}/edit`,
      icon: CalendarDays,
      exact: false,
    },
    {
      label: 'Embed',
      href: `/dashboard/organizer/events/${eventId}/embed`,
      icon: CodeXml,
      exact: false,
    },
  ];

  return (
    <div className="space-y-6 text-[#17211b] mt-6">
      <div className="flex flex-col gap-4 border-[#dce1d5] pb-2 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#17211b] text-white shadow-sm'
                    : 'text-[#6d766d] hover:bg-[#17211b]/5 hover:text-[#17211b]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-md">{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center sm:ml-auto">
          <Link
            href="/dashboard/organizer/events"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce1d5] bg-[#fffef9] px-4 py-2 text-xs font-bold text-[#6d766d] transition-all hover:border-[#17211b] hover:text-[#17211b]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-md">Back to Events</span>
          </Link>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
