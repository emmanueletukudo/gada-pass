'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
  BarChart3,
  Users,
  QrCode,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#17211b] antialiased">
      <main>
        <section className="grain mx-3 overflow-hidden rounded-4xl bg-black px-5 pb-12 pt-14 text-white sm:px-8 md:mx-6 md:px-16 md:pb-20 md:pt-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-[#d6f94a]">
              <Sparkles className="h-3.5 w-3.5" /> Simple & Transparent Pricing
            </span>
            <h1 className="display rise rise-delay mt-6 text-center text-[clamp(2.8rem,7vw,6rem)] font-bold leading-[0.9] tracking-[-0.08em]">
              Host for free<span className="text-[#ff765f]">.</span>
              <br />
              Pay as you grow<span className="text-[#d6f94a]">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-center text-base text-neutral-300 sm:text-lg">
              No hidden monthly subscriptions. No setup fees. Free events stay
              100% free forever.
            </p>
          </div>
        </section>

        <section className="mx-auto -mt-10 max-w-6xl px-5 pb-16 md:px-10">
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col justify-between rounded-3xl border border-[#dce1d5] bg-white p-8 shadow-sm"
            >
              <div>
              
                <h3 className="mt-4 text-3xl font-bold tracking-tight">
                  Free Tickets
                </h3>
                <p className="mt-2 text-sm text-[#6d766d]">
                  Perfect for community meetups, workshops, free raves, and open
                  gatherings.
                </p>

                <div className="my-6 border-y border-[#dce1d5] py-6">
                  <div className="flex items-baseline gap-1">
                    <span className="display text-5xl font-extrabold tracking-tight">
                      ₦0
                    </span>
                    <span className="text-sm font-semibold text-[#6d766d]">
                      / ticket
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-emerald-600">
                    ✓ Always 100% free to publish and host
                  </p>
                </div>

                <ul className="space-y-3.5 text-sm font-medium text-[#17211b]">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#ff765f]" />
                    <span>Unlimited free ticket issuance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#ff765f]" />
                    <span>Full Analytics & Revenue Dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#ff765f]" />
                    <span>Invite up to 10 Gate Agents for scanning</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#ff765f]" />
                    <span>QR Code mobile check-in app access</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="mt-8 block text-center rounded-full border-2 border-[#17211b] py-3.5 text-sm font-bold transition hover:bg-[#17211b] hover:text-white"
              >
                Host Free Event
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="relative flex flex-col justify-between rounded-3xl border-2 border-[#ff765f] bg-[#121214] p-8 text-white shadow-2xl"
            >
              <div className="absolute -top-3.5 right-8 rounded-full bg-[#ff765f] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                Most Popular
              </div>

              <div>
               
                <h3 className="mt-4 text-3xl font-bold tracking-tight text-white">
                  Paid Events
                </h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Built for concert organizers, festival promoters, and premium
                  ticketed events.
                </p>

                <div className="my-6 border-y border-white/10 py-6">
                  <div className="flex items-baseline gap-1">
                    <span className="display text-5xl font-extrabold tracking-tight text-white">
                      5%
                    </span>
                    <span className="text-xl font-bold text-[#ff765f]">
                      {' '}
                      + ₦100
                    </span>
                    <span className="text-xs font-semibold text-neutral-400">
                      {' '}
                      / sold ticket
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">
                    Non-refundable processing fee applied per ticket sale.
                  </p>
                </div>

                <ul className="space-y-3.5 text-sm font-medium text-neutral-200">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#d6f94a]" />
                    <span>Automatic direct bank payouts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#d6f94a]" />
                    <span>Real-time Sales & Revenue Tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#d6f94a]" />
                    <span>Invite up to 10 Gate Agents with unique access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#d6f94a]" />
                    <span>High-speed QR Ticket Scanner mobile integration</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 shrink-0 text-[#d6f94a]" />
                    <span>Multi-tier ticketing (Early Bird, Regular, VIP)</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="mt-8 block text-center rounded-full bg-[#ff765f] py-3.5 text-sm font-bold text-white transition hover:bg-[#ff765f]/90"
              >
                Create Paid Event
              </Link>
            </motion.div>
          </div>
        </section>
        <section
          id="features"
          className="border-t border-[#dce1d5] bg-[#fffef9] py-20"
        >
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="text-center">
              <h2 className="display text-3xl font-bold tracking-tight md:text-5xl">
                Everything you need to run your gate smoothly
                <span className="text-[#ff765f]">.</span>
              </h2>
              <p className="mt-3 text-[#6d766d]">
                Powerful organizer tools designed for live events in Nigeria.
              </p>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-[#dce1d5] bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff765f]/10 text-[#ff765f]">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold">Analytics Dashboard</h3>
                <p className="mt-2 text-sm leading-6 text-[#6d766d]">
                  Track live revenue, average daily ticket sales, attendee
                  breakdown, and peak selling windows in real-time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-[#dce1d5] bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#17211b] text-[#d6f94a]">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold">Up to 10 Gate Agents</h3>
                <p className="mt-2 text-sm leading-6 text-[#6d766d]">
                  Invite staff or bouncers to work as gate agents. Give them
                  scanner-only permissions without sharing financial data.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-[#dce1d5] bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff765f]/10 text-[#ff765f]">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold">
                  High-Speed QR Scanner
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6d766d]">
                  Turn any smartphone into an event scanner. Prevent duplicate
                  ticket entries and validate passes in under a second.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="mx-3 my-16 md:mx-6">
          <div className="grain relative overflow-hidden rounded-4xl bg-black px-8 py-16 text-center text-white md:px-16 md:py-20">
            <h2 className="display text-4xl font-bold tracking-tight md:text-6xl">
              Ready to host your next event
              <span className="text-[#ff765f]">?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-neutral-300">
              Join thousands of organizers using Gada Events to power their
              concerts, raves, and conferences.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auth/register"
                className="rounded-full bg-[#ff765f] px-8 py-4 text-base font-bold text-white transition hover:bg-white hover:text-black"
              >
                Create an Event Now
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
