'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Carousel } from '@/components/carousel';
import { ArrowRight } from 'lucide-react';
import { EventCategories } from '@/components/events/event-categories';
import { EventList } from '@/components/events/event-list';
import { useEvents } from '@/lib/hooks/useEvents';
import { MobileAppSection } from '@/components/app-section';

export default function Home() {
  const { events, category, loading, error, setCategory } = useEvents();

  const categoryNameToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    events?.forEach((event) => {
      if (event.category?.name && event.category?.id) {
        map.set(event.category.name, event.category.id);
      }
    });
    return map;
  }, [events]);

  const categoryNames = useMemo(() => {
    const names = new Set<string>();
    events?.forEach((event) => {
      if (event.category?.name) names.add(event.category.name);
    });
    return ['All', ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [events]);

  const handleCategorySelect = (categoryName: string) => {
    if (categoryName === 'All') {
      setCategory('');
    } else {
      const categoryId = categoryNameToIdMap.get(categoryName);
      if (categoryId) {
        setCategory(categoryId);
      }
    }
  };
  return (
    <div className="min-h-screen overflow-hidden">
      <main>
        <section className="grain mx-3 overflow-hidden rounded-4xl bg-black px-5 pb-8 pt-14 sm:px-8 md:mx-6 md:px-16 md:pb-16 md:pt-24">
          <div className="flex flex-col items-center justify-center">
            <h1 className="display rise rise-delay max-w-7xl text-center text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.86] tracking-[-0.08em] text-white">
              Find your
              <span className="text-[#ff765f]"> Next Moment.</span>
            </h1>
            <p className="text-center text-xl text-white">
              Discover concerts, raves, exhibitions, and other live events
              happening around you.
            </p>
            <div className="mt-4 w-full">
              <Carousel />
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="display text-4xl font-bold tracking-[-0.06em] md:text-6xl">
                Discover Events<span className="text-[#ff765f]">.</span>
              </h2>
            </div>
            <Link
              href="/events"
              className="text-sm font-bold underline decoration-[#ff765f] decoration-2 underline-offset-4"
            >
              <div className="flex flex-row items-center justify-center">
                See all events
                <ArrowRight size={18} />
              </div>
            </Link>
          </div>

          <EventCategories
            categories={categoryNames}
            setCategory={handleCategorySelect}
            currentCategory={
              category
                ? categoryNames.find(
                    (name) => categoryNameToIdMap.get(name) === category,
                  ) || 'All'
                : 'All'
            }
          />

          {loading && (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="h-48 w-full rounded-xl bg-gray-200" />
                  <div className="mt-4 h-5 w-3/4 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-4 w-1/4 rounded bg-gray-200" />
                    <div className="h-8 w-20 rounded-full bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-[#ffb3a7] bg-[#fff0ed] p-6 text-center text-sm font-bold text-[#a13c2d]">
              {error}
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <p className="py-20 text-center text-sm text-[#6d766d]">
              No published events match those filters.
            </p>
          )}

          {!loading && !error && events.length > 0 && (
            <EventList events={events} />
          )}
        </section>
      
        <MobileAppSection/>
        <section
          id="how"
          className="border-y border-[#dce1d5] bg-[#fffef9] px-5 py-16 md:px-10"
        >
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_2fr] md:items-center">
            <div>
              <h2 className="display max-w-md text-4xl font-bold leading-[0.95] tracking-[-0.06em] md:text-6xl">
                The good stuff is closer than you think.
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <span className="display text-5xl font-bold">01</span>
                <h3 className="mt-4 font-bold">Discover</h3>
                <p className="mt-2 text-sm leading-6 text-[#6d766d]">
                  Find the rooms, people and moments you want to be part of.
                </p>
              </div>
              <div>
                <span className="display text-5xl font-bold">02</span>
                <h3 className="mt-4 font-bold">Book</h3>
                <p className="mt-2 text-sm leading-6 text-[#6d766d]">
                  Secure your spot in a few taps. Your ticket lives right here.
                </p>
              </div>
              <div>
                <span className="display text-5xl font-bold">03</span>
                <h3 className="mt-4 font-bold">Show up</h3>
                <p className="mt-2 text-sm leading-6 text-[#6d766d]">
                  Bring your people. We will handle the rest at the gate.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
