'use client';

import { Logo } from '@/components/logo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 14, 2026';

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#17211b] antialiased">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 md:px-10">
        <Logo />
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs font-semibold text-[#6d766d]">
            Last updated: {lastUpdated}
          </p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-[#4a524a]">
            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                1. Overview & Ownership
              </h2>
              <p className="mt-2">
                This Privacy Policy describes how{' '}
                <strong>Itmed Interactive Ltd</strong> ("we", "us", "our"),
                trading and operating under the <strong>Gada Pass</strong>{' '}
                infrastructure, collects, uses, and protects your personal data
                when you use our website, mobile application, and event
                ticketing services.
              </p>
              <p className="mt-2">
                We are committed to preserving your privacy in accordance with
                the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and
                international data protection standards.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                2. Information We Collect
              </h2>
              <p className="mt-2">
                We collect personal data that you provide directly, as well as
                data gathered automatically during your platform usage:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  <strong>Account Information:</strong> Full name, email
                  address, phone number, and password credentials when
                  registering.
                </li>
                <li>
                  <strong>Event & Organizer Data:</strong> Event names,
                  descriptions, host organization details, payout bank account
                  information, and tax identification numbers.
                </li>
                <li>
                  <strong>Transaction & Ticket Data:</strong> Order history,
                  ticket quantities, and purchase metadata.{' '}
                  <em>
                    Note: Payment card details and banking credentials are
                    processed directly by our PCI-DSS compliant payment
                    processor (Paystack) and are never stored on Gada servers.
                  </em>
                </li>
                <li>
                  <strong>Gate & Attendance Data:</strong> Ticket check-in
                  timestamps, agent assignments, and gate verification logs.
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, device type,
                  browser specifications, and usage cookies.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                3. Lawful Basis & Use of Data
              </h2>
              <p className="mt-2">
                We process your personal data under the following legal
                frameworks:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  <strong>Contractual Performance:</strong> To issue electronic
                  tickets, facilitate gate scanning, process payouts, and manage
                  user accounts.
                </li>
                <li>
                  <strong>Organizer Sharing:</strong> When you register for or
                  purchase a ticket to an event, your name, email, and ticket
                  status are shared with the designated Event Organizer solely
                  for event logistics and gate verification.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To maintain financial
                  transaction logs for tax and regulatory auditing purposes.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                4. Data Sharing & Third-Party Processors
              </h2>
              <p className="mt-2">
                We do not sell your personal data to advertisers. We share data
                strictly with operational partners bound by confidentiality
                agreements:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  <strong>Payment Infrastructure:</strong> Paystack (PCI-DSS
                  compliant payment processing).
                </li>
                <li>
                  <strong>Email & Messaging:</strong> Transactional email
                  service providers for delivery of PDF passes and tickets.
                </li>
                <li>
                  <strong>Event Gate Agents:</strong> Designated bouncers or
                  scanners added by the Event Organizer receive access to ticket
                  verification lists.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                5. Your Data Rights
              </h2>
              <p className="mt-2">Under the NDPA, you possess the right to:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Request access to the personal data we hold about you.</li>
                <li>Request correction of inaccurate or incomplete records.</li>
                <li>
                  Request erasure of your account and personal data (subject to
                  legal retention mandates).
                </li>
                <li>
                  Withdraw consent for marketing communications at any time.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#17211b]">
                6. Contact Us
              </h2>
              <p className="mt-2">
                For privacy inquiries, data deletion requests, or data
                protection concerns, contact us at:
              </p>
              <p className="mt-2 font-mono text-xs text-[#17211b]">
                <strong>Itmed Interactive Ltd</strong>
                <br />
                Trading as Gada Pass
                <br />
                Abuja, Federal Capital Territory, Nigeria
                <br />
                Email: privacy@gada.africa
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
