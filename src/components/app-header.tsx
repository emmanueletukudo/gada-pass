'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { ArrowUpRight } from 'lucide-react';

export const AppHeader = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/events', label: 'Discover' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/#how', label: 'For organizers' },
    { href: '/pricing#features', label: 'Host Features' },
  ];

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
      <Logo />
      <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition hover:opacity-80 ${
                isActive ? 'text-[#ff765f]' : 'text-[#17211b]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="hidden text-sm font-semibold sm:block transition hover:opacity-70"
        >
          Log in
        </Link>
        <Link
          href="/auth/register"
          className="rounded-full bg-[#17211b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff765f]"
        >
          <div className="flex flex-row items-center justify-center">
            Get Started <ArrowUpRight className="ml-1 h-4 w-4" />
          </div>
        </Link>
      </div>
    </header>
  );
};

