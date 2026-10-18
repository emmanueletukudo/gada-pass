'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'What is Gada Pass and how does it work?',
    answer:
      'Gada Pass is a modern ticketing and event management platform built for creators, organizers, and attendees. You can create events, set up multiple ticket tiers, manage registrations, and check in attendees effortlessly.',
  },
  {
    question: 'How do I create an event on Gada?',
    answer:
      'Simply sign up or log into your organizer account, click on "Create Event", and follow the step-by-step setup wizard to add your event details, banner, venue or stream link, and ticket pricing.',
  },
  {
    question: 'What are Gada Pass’s pricing and commission fees?',
    answer:
      'Gada is free to set up and list events! We only charge a small platform and service fee per ticket sold (standard 5% + ₦100 fixed service fee), which organizers can choose to absorb or pass on to attendees.',
  },
  {
    question: 'How do gate agents check in attendees?',
    answer:
      'Organizers can assign gate agents to their events. Agents can use the Gada agent mobile view or portal to scan attendee QR codes instantly and track live check-ins.',
  },
  {
    question: 'Can I cover or absorb platform commission fees?',
    answer:
      'Yes! When setting up your event details, you can toggle on "Cover Commission Fees" to absorb platform fees on behalf of your ticket buyers.',
  },
  {
    question: 'What payout methods and currencies are supported?',
    answer:
      'Gada Pass supports local and international payment rails, allowing organizers to receive fast, secure payouts directly to their bank accounts in their preferred currency.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-28"
          >
            <div className="inline-block rounded-full bg-black px-3.5 py-1 text-[11px] font-black tracking-widest uppercase text-white">
              FAQ
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17211b] tracking-tight leading-[1.05]">
              Questions? <br />
              We&apos;ve got <br />
              answers.
            </h2>

            <p className="text-sm text-[#6d766d] max-w-sm leading-relaxed">
              Can&apos;t find what you&apos;re looking for? Contact support at{' '}
              <a
                href="mailto:hello@gada.africa"
                className="font-bold text-[#17211b] underline underline-offset-4 hover:text-[#ff5500] transition"
              >
                hello@gada.africa
              </a>
              .
            </p>
          </motion.div>

          <div className="lg:col-span-7 space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'border-[#17211b] bg-white shadow-sm'
                      : 'border-[#dce1d5]/80 bg-[#fffef9] hover:border-[#17211b]/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left text-base sm:text-lg font-bold text-[#17211b] outline-none cursor-pointer"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isOpen
                          ? 'bg-black text-white'
                          : 'bg-[#f0f2ec] text-[#17211b] hover:bg-[#e4e8df]'
                      }`}
                    >
                      {isOpen ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-[#6d766d] leading-relaxed border-t border-[#dce1d5]/40">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
