import { useEffect, useState } from 'react';
import { api, ApiEvent } from '../hooks-new/api';

export const categories = ['All', 'Community', 'Social', 'Concert', 'Food & Drink'];

type UseEventsProps = {
  events: ApiEvent[];
  search: string;
  category: string;
  city: string;
  error: string;
  loading: boolean;
  setEvents: (event: ApiEvent[]) => void;
  setSearch: (val: string) => void;
  setCategory: (val: string) => void;
  setCity: (val: string) => void;
  setError: (val: string) => void;
};

export const useEvents = (): UseEventsProps => {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoading(true);

      const params = new URLSearchParams({ limit: '50' });
      if (search.trim()) params.set('search', search.trim());
      if (category !== 'All') params.set('category', category);
      if (city) params.set('city', city);

      void api<{ data: ApiEvent[] }>(`/events?${params.toString()}`)
        .then((result) => {
          setEvents(result.data);
          setError('');
        })
        .catch((reason: unknown) =>
          setError(
            reason instanceof Error
              ? reason.message
              : 'Events could not be loaded',
          ),
        )
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [search, category, city]);

  return {
    events,
    search,
    category,
    city,
    error,
    loading,
    setCategory,
    setCity,
    setError,
    setEvents,
    setSearch,
  };
};
