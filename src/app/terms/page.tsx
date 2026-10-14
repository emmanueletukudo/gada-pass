'use client';

import { Logo } from '@/components/logo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const lastUpdated = 'October 14, 2026';

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#17211b] antialiased">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 md:px-10">
        <Logo/>
        <Link
          href="/"
          className="text-sm inline-flex items-center gap-1 font-bold underline decoration-[#ff765f]"
        >
            <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 md:px-10">
        <div className="rounded-3xl border border-[#dce1d5] bg-white p-8 md:p-14 shadow-sm">
          <h1 className="display mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs font-semibold text-[#6d766d]">
            Last updated: {lastUpdated}
          </p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-[#4a524a]">
            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                1. Acceptance of Terms
              </h2>
              <p className="mt-2">
                These Terms of Service ("Terms") govern your use of the Gada
                Events platform, Gada Pass ticketing system, and mobile
                applications provided by <strong>Itmed Interactive Ltd</strong>{' '}
                ("Company", "we", "us"). By accessing our platform, publishing
                an event, or purchasing a ticket, you agree to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                2. Services Offered
              </h2>
              <p className="mt-2">
                Gada Pass provides an online software platform allowing Event
                Organizers to publish, market, and manage live or virtual
                events, issue digital tickets, and facilitate attendee check-in
                using QR code verification via the Gada Pass system.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                3. Fees, Payments & Non-Refundable Policy
              </h2>
              <p className="mt-2">
                <strong>Hosting & Free Events:</strong> Publishing an event and
                issuing free tickets on Gada Pass is free of charge.
              </p>
              <p className="mt-2">
                <strong>Paid Tickets:</strong> Paid tickets attract a
                non-refundable service fee of{' '}
                <strong>5% + ₦100 per ticket sold</strong>. This processing fee
                covers bank gateway integration, ticket delivery, and
                infrastructure costs.
              </p>
              <p className="mt-2">
                <strong>Payouts:</strong> Revenue collected for ticket sales is
                settled into the bank account specified in the Organizer's
                dashboard according to agreed payout schedules.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                4. Event Cancellations & Refunds
              </h2>
              <p className="mt-2">
                Organizers are solely responsible for setting refund policies
                for their events. If an event is canceled, postponed, or
                materially altered, the Event Organizer is solely liable for
                refunding ticket buyers. Gada Pass service fees (5% + ₦100)
                are non-refundable under all circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                5. Gate Agents & Scanning
              </h2>
              <p className="mt-2">
                Event Organizers may invite up to 10 Gate Agents or bouncers to
                perform check-ins. Organizers are responsible for ensuring that
                their appointed gate staff act lawfully and respect attendee
                privacy during the entry process.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                6. Prohibited Events & Conduct
              </h2>
              <p className="mt-2">You agree not to use Gada Pass for:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Fraudulent, illegal, or unauthorized events.</li>
                <li>
                  Events promoting hate speech, violence, or unlawful
                  activities.
                </li>
                <li>Fake or duplicate ticket sales.</li>
              </ul>
              <p className="mt-2">
                Itmed Interactive Ltd reserves the right to suspend or terminate
                any event listing or account that violates these Terms without
                prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                7. Limitation of Liability
              </h2>
              <p className="mt-2">
                Itmed Interactive Ltd acts as a ticketing technology provider
                and is not responsible for the physical execution, safety,
                quality, or legality of any event hosted on the platform.
                Attendees assume all inherent risks associated with attending
                live events.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                8. Governing Law
              </h2>
              <p className="mt-2">
                These Terms shall be governed by and construed in accordance
                with the laws of the{' '}
                <strong>Federal Republic of Nigeria</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                9. Contact Information
              </h2>
              <p className="mt-2 font-mono text-xs text-[#17211b]">
                <strong>Itmed Interactive Ltd</strong>
                <br />
                Abuja, FCT, Nigeria
                <br />
                Email: support@gada.africa
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
