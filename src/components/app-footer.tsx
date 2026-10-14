'use client';

import Link from 'next/link';

const AppFooter = () => {
  return (
    <footer className="mx-auto flex max-w-8xl flex-col gap-4 px-5 py-8 text-sm text-[#6d766d] md:flex-row md:items-center md:justify-between md:px-10 border-t border-[#dce1d5]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
        <span className="display font-bold text-[#17211b]">
          Gada<span className="text-[#ff765f]">.</span>Pass
        </span>
        <span className="hidden sm:inline text-neutral-300">·</span>
        <span>Made for the moments worth remembering · Abuja, Nigeria</span>
      </div>

      <div className="flex flex-wrap items-center gap-6 font-medium">
        <Link
          href="/privacy"
          className="transition hover:text-[#17211b] hover:underline decoration-[#ff765f] underline-offset-4"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="transition hover:text-[#17211b] hover:underline decoration-[#ff765f] underline-offset-4"
        >
          Terms of Service
        </Link>
        <span>© 2026 Itmed Interactive Ltd.</span>
      </div>
    </footer>
  );
};

export default AppFooter;
