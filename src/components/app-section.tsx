'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { QrCode, Ticket, Sparkles, MapPin, Search } from 'lucide-react';

export function MobileAppSection() {
  return (
    <section className="mx-3 my-16 md:mx-6">
      <div className="relative overflow-hidden rounded-4xl bg-[#121214] px-6 py-12 text-white sm:px-10 md:px-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h2 className="display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Download Our App
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base">
              Create, publish, and manage your events on the go via the mobile
              app.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="overflow-hidden rounded-xl transition-transform"
              >
                <Image
                  src="/app-store.avif"
                  alt="Download on the App Store"
                  width={160}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="overflow-hidden rounded-xl transition-transform"
              >
                <Image
                  src="/playStore.avif"
                  alt="Get it on Google Play"
                  width={160}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              </motion.button>
            </div>
          </div>

          <div className="relative flex items-center justify-center gap-2 sm:gap-4 lg:justify-end">
            <motion.div
              initial={{ rotate: -8, y: 15 }}
              whileHover={{ rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-28 shrink-0 rounded-4xl border-2 border-neutral-800 bg-black p-1.5 shadow-2xl sm:w-44 md:w-48 sm:rounded-[2.5rem] sm:border-4 sm:p-2"
            >
              <div className="flex h-56 flex-col overflow-hidden rounded-3xl bg-[#18181b] p-2.5 sm:h-80 sm:rounded-4xl sm:p-3">
                <div className="mx-auto mb-2 h-2.5 w-10 shrink-0 rounded-full bg-neutral-800" />
                <div className="flex items-center gap-1.5 rounded-lg bg-neutral-900 border border-white/10 px-2 py-1.5 text-[9px] text-neutral-400 sm:text-[11px]">
                  <Search className="h-3 w-3 shrink-0 text-neutral-500" />
                  <span className="truncate">Search events or venues</span>
                </div>

                <div className="mt-2.5 flex gap-1 overflow-hidden text-[8px] font-medium sm:text-[10px]">
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

                <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/80 p-2">
                  <div className="h-16 w-full rounded-lg bg-linear-to-tr from-gray-300 to-white-900 sm:h-24" />
                  <p className="mt-2 truncate text-[10px] font-bold text-white sm:text-xs">
                    VIBEZ FESTIVAL 2026
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[8px] text-neutral-400 sm:text-[10px]">
                    <MapPin className="h-2.5 w-2.5 text-[#ff765f]" /> Abuja, NG
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: -8 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="z-10 w-32 shrink-0 rounded-4xl border-2 border-neutral-700 bg-black p-1.5 shadow-2xl sm:w-48 md:w-52 sm:rounded-[2.5rem] sm:border-4 sm:p-2"
            >
              <div className="flex h-64 flex-col overflow-hidden rounded-3xl bg-[#18181b] p-2.5 sm:h-88 sm:rounded-4xl sm:p-3">
                <div className="mx-auto mb-2 h-2.5 w-10 shrink-0 rounded-full bg-neutral-800" />

                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-[10px] font-bold text-white sm:text-xs">
                    Manage Event
                  </span>
                  <span className="rounded-full bg-[#d6f94a]/20 px-1.5 py-0.5 text-[8px] font-semibold text-[#d6f94a] sm:text-[9px]">
                    APPROVED
                  </span>
                </div>

                <div className="relative mt-2.5 h-20 w-full overflow-hidden rounded-xl bg-linear-to-r from-orange-600 to-pink-600 sm:h-28">
                  <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/60 p-1.5 backdrop-blur-md">
                    <p className="truncate text-[9px] font-extrabold text-white sm:text-xs">
                      ART X RAVE EXHIBITION
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[8px] sm:text-[10px]">
                  <div className="flex items-center justify-between rounded-lg bg-neutral-900 p-1.5 text-neutral-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Ticket className="h-3 w-3 text-[#ff765f]" /> Ticket Tiers
                    </span>
                    <span className="font-mono text-white">3 Active</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-neutral-900 p-1.5 text-neutral-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <QrCode className="h-3 w-3 text-[#d6f94a]" /> Scan Tickets
                    </span>
                    <span className="text-[8px] font-bold text-[#d6f94a]">
                      Gate Mode
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ rotate: 8, y: 15 }}
              whileHover={{ rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-28 shrink-0 rounded-4xl border-2 border-neutral-800 bg-black p-1.5 shadow-2xl sm:w-44 md:w-48 sm:rounded-[2.5rem] sm:border-4 sm:p-2"
            >
              <div className="flex h-56 flex-col overflow-hidden rounded-3xl bg-[#18181b] p-2.5 sm:h-80 sm:rounded-4xl sm:p-3">
                <div className="mx-auto mb-2 h-2.5 w-10 shrink-0 rounded-full bg-neutral-800" />

                <div className="text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 sm:text-[10px]">
                    Your Ticket Pass
                  </span>
                </div>
                <div className="mt-3 flex flex-1 flex-col items-center justify-between rounded-xl border border-dashed border-neutral-700 bg-neutral-900 p-2.5 text-center">
                  <div>
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
