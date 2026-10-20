'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ROLE_NAV_ITEMS } from '@/config/navigation';
import { User } from './sidebar';

type MobileSideBarProps = {
  user: User | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function MobileSideBar({
  user,
  isOpen,
  setIsOpen,
}: MobileSideBarProps) {
  const pathname = usePathname();
  const rawRole = user?.role?.toLowerCase() || 'attendee';

  const currentRoleSegment = rawRole === 'gate_agent' ? 'agent' : rawRole;
  const basePath = `/dashboard/${currentRoleSegment}`;
  const navItems =
    ROLE_NAV_ITEMS[currentRoleSegment] || ROLE_NAV_ITEMS.attendee;
  const workspaceTitle =
    rawRole === 'gate_agent' ? 'Gate Agent' : rawRole.replace('_', ' ');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative flex w-full max-w-xs flex-1 flex-col justify-between bg-[#fffef9] p-6 shadow-xl">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-[#6d766d] hover:bg-[#f0f1e9]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6d766d]">
              {workspaceTitle} Workspace
            </p>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const fullTargetUrl = `${basePath}${item.path}`;
                const isRouteActive =
                  item.path === ''
                    ? pathname === basePath
                    : pathname.startsWith(fullTargetUrl);

                return (
                  <Link
                    key={item.label}
                    href={fullTargetUrl}
                    onClick={() => setIsOpen(false)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-bold transition-all ${
                      isRouteActive
                        ? 'bg-[#17211b] text-white'
                        : 'bg-[#fffef9] text-[#6d766d] hover:bg-[#f0f1e9] hover:text-[#17211b]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="border-t border-[#dce1d5] pt-4">
          <div className="mb-4 px-2">
            <p className="truncate text-sm font-bold text-[#17211b]">
              {user?.hostName || 'User Account'}
            </p>
            <p className="truncate text-xs font-medium text-[#6d766d]">
              {user?.email || ''}
            </p>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex w-full items-center gap-3 rounded-xl border border-[#dce1d5] bg-[#fffef9] px-4 py-3.5 text-left text-sm font-bold text-[#c34837] transition hover:border-[#c34837] hover:bg-[#c34837]/5"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
