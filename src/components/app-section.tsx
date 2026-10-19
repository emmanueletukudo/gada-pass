'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { QrCode, Ticket, MapPin, Search } from 'lucide-react';

const phoneSpring = { type: 'spring', stiffness: 200, damping: 15 } as const;

export function MobileAppSection() {
  return (
    <section className="mx-3 my-12 sm:my-16 md:mx-6">
      <div className="relative overflow-hidden rounded-3xl bg-[#121214] px-5 py-12 text-white sm:rounded-4xl sm:px-10 md:px-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-20" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
            <h2 className="display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Download Gada Pass
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base">
              Gada Pass is coming soon on app stores. You&apos;ll be able to
              create, publish, and manage your events on the go via the mobile
              app.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 lg:justify-start">
              <button
                type="button"
                disabled
                aria-label="App Store: coming soon"
                className="cursor-not-allowed overflow-hidden rounded-xl opacity-80"
              >
                <Image
                  src="/app-store.avif"
                  alt="Download on the App Store"
                  width={160}
                  height={48}
                  className="h-11 w-auto object-contain sm:h-12"
                />
              </button>

              <button
                type="button"
                disabled
                aria-label="Google Play: coming soon"
                className="cursor-not-allowed overflow-hidden rounded-xl opacity-80"
              >
                <Image
                  src="/playStore.avif"
                  alt="Get it on Google Play"
                  width={160}
                  height={48}
                  className="h-11 w-auto object-contain sm:h-12"
                />
              </button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative flex w-full items-center justify-center overflow-hidden py-6 sm:overflow-visible lg:justify-end"
          >
            <motion.div
              initial={{ rotate: -8, y: 15 }}
              whileHover={{ rotate: 0, y: 0 }}
              transition={phoneSpring}
              className="-mx-10 w-36 shrink-0 rounded-4xl border-2 border-neutral-800 bg-black p-1.5 shadow-2xl sm:-mx-8 sm:w-40 sm:rounded-[2.5rem] sm:border-4 sm:p-2"
            >
              <div className="flex h-60 flex-col overflow-hidden rounded-3xl bg-[#18181b] p-2.5 sm:h-80 sm:rounded-4xl sm:p-3">
                <div className="mx-auto mb-2 h-2.5 w-10 shrink-0 rounded-full bg-neutral-800" />
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-900 px-2 py-1.5 text-[9px] text-neutral-400 sm:text-[11px]">
                  <Search className="h-3 w-3 shrink-0 text-neutral-500" />
                  <span className="truncate">Search events or venues</span>
                </div>

                <div className="mt-2.5 flex gap-1 overflow-hidden whitespace-nowrap text-[8px] font-medium sm:text-[10px]">
                  <span className="rounded-full bg-[#ff765f] px-2 py-0.5 text-white">
                    Raves
                  </span>
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-300">
                    Concerts
                  </span>
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-300">
                    Arts
                  </span>
                </div>

                <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/80 p-2">
                  <div className="h-16 w-full rounded-lg bg-linear-to-tr from-gray-300 to-white sm:h-24" />
                  <p className="mt-2 truncate text-[10px] font-bold text-white sm:text-xs">
                    VIBEZ FESTIVAL 2026
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[8px] text-neutral-400 sm:text-[10px]">
                    <MapPin className="h-2.5 w-2.5 shrink-0 text-[#ff765f]" />
                    <span className="truncate">Abuja, NG</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: -8 }}
              whileHover={{ scale: 1.03 }}
              transition={phoneSpring}
              className="relative z-10 w-44 shrink-0 rounded-4xl border-2 border-neutral-700 bg-black p-1.5 shadow-2xl sm:w-48 sm:rounded-[2.5rem] sm:border-4 sm:p-2"
            >
              <div className="flex h-72 flex-col overflow-hidden rounded-3xl bg-[#18181b] p-2.5 sm:h-88 sm:rounded-4xl sm:p-3">
                <div className="mx-auto mb-2 h-2.5 w-10 shrink-0 rounded-full bg-neutral-800" />

                <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                  <span className="truncate text-[10px] font-bold text-white sm:text-xs">
                    Manage Event
                  </span>
                  <span className="shrink-0 rounded-full bg-[#d6f94a]/20 px-1.5 py-0.5 text-[8px] font-semibold text-[#d6f94a] sm:text-[9px]">
                    APPROVED
                  </span>
                </div>

                <div className="relative mt-2.5 h-24 w-full shrink-0 overflow-hidden rounded-xl bg-linear-to-r from-orange-600 to-pink-600 sm:h-28">
                  <div className="absolute inset-x-2 bottom-2 rounded-lg bg-black/60 p-1.5 backdrop-blur-md">
                    <p className="truncate text-[9px] font-extrabold text-white sm:text-xs">
                      ART X RAVE EXHIBITION
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[9px] sm:text-[10px]">
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-neutral-900 p-1.5 text-neutral-300">
                    <span className="flex min-w-0 items-center gap-1.5 font-medium">
                      <Ticket className="h-3 w-3 shrink-0 text-[#ff765f]" />
                      <span className="truncate">Ticket Tiers</span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap font-mono text-white">
                      3 Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-neutral-900 p-1.5 text-neutral-300">
                    <span className="flex min-w-0 items-center gap-1.5 font-medium">
                      <QrCode className="h-3 w-3 shrink-0 text-[#d6f94a]" />
                      <span className="truncate">Scan Tickets</span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-[8px] font-bold text-[#d6f94a]">
                      Gate Mode
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ rotate: 8, y: 15 }}
              whileHover={{ rotate: 0, y: 0 }}
              transition={phoneSpring}
              className="-mx-10 w-36 shrink-0 rounded-4xl border-2 border-neutral-800 bg-black p-1.5 shadow-2xl sm:-mx-8 sm:w-40 sm:rounded-[2.5rem] sm:border-4 sm:p-2"
            >
              <div className="flex h-60 flex-col overflow-hidden rounded-3xl bg-[#18181b] p-2.5 sm:h-80 sm:rounded-4xl sm:p-3">
                <div className="mx-auto mb-2 h-2.5 w-10 shrink-0 rounded-full bg-neutral-800" />

                <div className="text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 sm:text-[10px]">
                    Your Ticket Pass
                  </span>
                </div>
                <div className="mt-3 flex min-h-0 flex-1 flex-col items-center justify-between rounded-xl border border-dashed border-neutral-700 bg-neutral-900 p-2.5 text-center">
                  <div className="w-full min-w-0">
                    <span className="inline-block rounded bg-[#ff765f]/20 px-1.5 py-0.5 text-[8px] font-bold text-[#ff765f]">
                      VIP PASS
                    </span>
                    <p className="mt-1 truncate text-[10px] font-bold text-white sm:text-xs">
                      Gada Night Life
                    </p>
                  </div>

                  <div className="my-2 flex h-14 w-14 items-center justify-center rounded-lg bg-white p-1 text-black shadow-inner sm:h-20 sm:w-20">
                    <QrCode className="h-full w-full" />
                  </div>

                  <p className="font-mono text-[8px] text-neutral-400 sm:text-[9px]">
                    #GADA-89201
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
