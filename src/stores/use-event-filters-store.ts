import { create } from 'zustand';

interface EventFiltersState {
  search: string;
  category: string;
  city: string;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setCity: (city: string) => void;
  resetFilters: () => void;
}

export const useEventFiltersStore = create<EventFiltersState>((set) => ({
  search: '',
  category: '',
  city: '',
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setCity: (city) => set({ city }),
  resetFilters: () => set({ search: '', category: '', city: '' }),
}));
