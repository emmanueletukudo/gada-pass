import { FC } from 'react';
import { UserRole } from '@/types/next-auth';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type QucikActionsProps = {
  role?: UserRole;
};

export const QuickActions: FC<QucikActionsProps> = ({ role }) => {
  return (
    <section className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6d766d]">
        Quick actions
      </p>
      <div className="mt-5 space-y-3">
        {(role === 'GATE_AGENT'
          ? ['Scan a ticket', 'Manual guest lookup', 'View sync queue']
          : role === 'ORGANIZER'
            ? ['Create new event', 'Send an update', 'View ticket sales']
            : role === 'ADMIN'
              ? ['Review approvals', 'Payout queue', 'Audit activity']
              : ['View my tickets', 'Browse events', 'Update profile']
        ).map((action) => (
          <Link
            href={
              action === 'Scan a ticket'
                ? '/dashboard/agent/scan'
                : action === 'Create new event'
                  ? '/dashboard/organizer/events/create'
                  : action === 'Browse events'
                    ? '/events'
                    : action === 'Log in'
                      ? '/auth/login'
                      : '#'
            }
            key={action}
            className="flex w-full items-center justify-between rounded-xl border border-[#dce1d5] px-4 py-4 text-left text-sm font-bold transition hover:border-[#17211b]"
          >
            <span>{action}</span>
            <span className="text-lg flex flex-row"><ArrowRight/></span>
          </Link>
        ))}
      </div>
    </section>
  );
};
