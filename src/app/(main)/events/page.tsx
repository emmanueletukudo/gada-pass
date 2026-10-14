'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { EventCategories } from '@/components/events/event-categories';
import { EventList } from '@/components/events/event-list';
import { ArrowRight } from 'lucide-react';
import { useEvents } from '@/lib/hooks/useEvents';

export default function EventsPage() {
  const {
    events,
    search,
    category,
    city,
    loading,
    error,
    setCategory,
    setSearch,
    setCity,
  } = useEvents();


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
      if (event.category?.name) {
        names.add(event.category.name);
      }
    });
    return ['All', ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [events]);

  const handleCategorySelect = (selectedName: string) => {
    if (selectedName === 'All') {
      setCategory(''); 
    } else {
      const categoryId = categoryNameToIdMap.get(selectedName);
      if (categoryId) {
        setCategory(categoryId);
      }
    }
  };

  const currentCategoryName = useMemo(() => {
    if (!category) return 'All';
    for (const [name, id] of categoryNameToIdMap.entries()) {
      if (id === category) return name;
    }
    return 'All';
  }, [category, categoryNameToIdMap]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <div className="flex flex-col justify-between gap-5 border-[#dce1d5] pb-10 md:flex-row md:items-end">
          <div>
            <h1 className="display text-6xl font-bold tracking-[-0.08em] md:text-8xl">
              Find your
              <br />
              <span className="text-[#ff765f]">people.</span>
            </h1>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#6d766d]">
            Live events from the Gada Events community. Search by name,
            category, or city.
          </p>
        </div>

        <div className="my-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 rounded-full border border-[#dce1d5] bg-[#fffef9] px-5 py-3 outline-none focus:border-[#17211b]"
            placeholder="Search by event, artist or venue"
          />
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="rounded-full border border-[#dce1d5] bg-[#fffef9] px-6 py-3 text-sm font-bold outline-none"
          >
            <option value="">All cities</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja</option>
          </select>
        </div>

        <EventCategories
          categories={categoryNames}
          setCategory={handleCategorySelect}
          currentCategory={currentCategoryName}
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
      </main>
    </div>
  );
}
