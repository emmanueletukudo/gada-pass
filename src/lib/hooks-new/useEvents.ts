'use client';

import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEventFiltersStore } from '@/stores/use-event-filters-store';
import { uploadFileFn } from './helper';
import { api, ApiEvent } from './api';

export interface CreateTicketTierInput {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  isMultiDay?: boolean;
  maxScansPerDay?: number;
  validDate?: string;
  currency?: string;
  salesStart?: string;
  salesEnd?: string;
}

export interface CreateEventInput {
  name: string;
  description: string;
  eventType: string;
  startsAt: string;
  endsAt: string;
  ticketTiers: CreateTicketTierInput[];

  categoryId?: string;
  images?: File[];
  banner?: string;
  venue?: string;
  city?: string;
  isOnline?: boolean;
  capacity?: number;
  settlementAccountId?: string;

  instagram?: string;
  x?: string;
  website?: string;

  slug?: string;
  coverFees?: boolean;
  meetingLink?: string;
  virtualPlatform?: string;
  meetingPasscode?: string;
}

export interface EventUpdateInput extends CreateEventInput {
  id?: string;
}

export interface CreateEventResponse extends CreateEventInput {
  id?: string;
}

export interface EventCategory {
  id: string;
  label: string;
  value: string;
  iconUrl: string;
}

export type SetlementAccount = {
  id?: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  bankCode?: string;
  isDefault?: boolean;
};

export type verifyBankAccountInput = {
  accountNumber: string;
  bankCode: string;
};

export type supportedBanksResponse = {
  bank: string;
  code: string;
};

export type verifyBankAccountReponse = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
};

const formatErrorMessage = (error: any, message?: string) =>
  error instanceof Error ? error.message : message;

export function useEventCategories() {
  return useQuery({
    queryKey: ['event-categories'],
    queryFn: () => api<EventCategory[]>('/event-categories', { method: 'GET' }),
  });
}

export function useSupportedBanks() {
  return useQuery({
    queryKey: ['supported-banks'],
    queryFn: () =>
      api<supportedBanksResponse[]>('/settlement-accounts/banks', {
        method: 'GET',
      }),
  });
}

export function useVerifyBankAccount(input: verifyBankAccountInput | null) {
  return useQuery({
    queryKey: ['verify-bank', input?.accountNumber, input?.bankCode],
    queryFn: () =>
      api<verifyBankAccountReponse>(
        `/settlement-accounts/verify?accountNumber=${input?.accountNumber}&bankCode=${input?.bankCode}`,
        { method: 'GET' },
      ),
    enabled: Boolean(
      input?.accountNumber &&
      input?.bankCode &&
      input.accountNumber.length === 10,
    ),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      let uploadedUrls: string[] = [];
      if (input.images && input.images.length > 0) {
        uploadedUrls = await Promise.all(
          input.images.map((file) => uploadFileFn(file)),
        );
      }

      return api<{ id: string }>('/events', {
        method: 'POST',
        body: JSON.stringify({
          name: input.name,
          description: input.description,
          eventType: input.eventType,
          slug: input.slug || undefined,
          coverFees: input.coverFees ?? false,
          categoryId: input.categoryId || undefined,
          city: input.city || undefined,
          venue: input.venue || undefined,
          startsAt: new Date(input.startsAt).toISOString(),
          endsAt: new Date(input.endsAt).toISOString(),
          capacity: Number(input.capacity ?? 100),
          isOnline: input.isOnline ?? false,
          meetingLink: input.meetingLink || undefined,
          virtualPlatform: input.virtualPlatform || undefined,
          meetingPasscode: input.meetingPasscode || undefined,
          settlementAccountId: input.settlementAccountId || undefined,
          instagram: input.instagram || undefined,
          x: input.x || undefined,
          website: input.website || undefined,
          images: uploadedUrls,
          banner: uploadedUrls[0] ?? input.banner,
          ticketTiers: input.ticketTiers.map((tier) => ({
            name: tier.name,
            price: String(tier.price),
            quantity: Number(tier.quantity),
            currency: tier.currency ?? 'NGN',
            isMultiDay: tier.isMultiDay ?? false,
            maxScansPerDay: tier.maxScansPerDay
              ? Number(tier.maxScansPerDay)
              : 1,
            validDate: tier.validDate || undefined,
          })),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully!');
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, 'Could not create event'));
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      input,
    }: {
      eventId: string;
      input: EventUpdateInput;
    }) => {
      let imageUrls: string[] = [];
      if (input.images && input.images.length > 0) {
        imageUrls = await Promise.all(
          input.images.map((file) => uploadFileFn(file)),
        );
      }

      return api<CreateEventResponse>(`/organizer/events/${eventId}/update`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: input.name,
          description: input.description,
          eventType: input.eventType,
          city: input.city,
          categoryId: input.categoryId,
          coverFees: input.coverFees ?? false,
          venue: input.venue,
          startsAt: new Date(input.startsAt).toISOString(),
          endsAt: new Date(input.endsAt).toISOString(),
          isOnline: input.isOnline ?? false,
          meetingLink: input.meetingLink || undefined,
          virtualPlatform: input.virtualPlatform || undefined,
          meetingPasscode: input.meetingPasscode || undefined,
          capacity: input.capacity,
          settlementAccountId: input.settlementAccountId || undefined,
          instagram: input.instagram || undefined,
          x: input.x || undefined,
          website: input.website || undefined,
          images: imageUrls,
          banner: imageUrls[0] ?? input.banner,
          ticketTiers: input.ticketTiers.map((tier) => ({
            id: tier.id,
            name: tier.name,
            price: String(tier.price),
            quantity: Number(tier.quantity),
            currency: tier.currency ?? 'NGN',
            isMultiDay: tier.isMultiDay ?? false,
            maxScansPerDay: tier.maxScansPerDay
              ? Number(tier.maxScansPerDay)
              : 1,
            validDate: tier.validDate || undefined,
          })),
        }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      toast.success('Event updated successfully!');
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, 'Could not update the event'));
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      api(`/events/${eventId}/publish`, { method: 'POST' }),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Event published successfully!');
    },
    onError: (error) => {
      toast.error(formatErrorMessage(error, 'Failed to publish event'));
    },
  });
}

export function useCreateSettlementAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SetlementAccount) =>
      api<SetlementAccount>('/settlement-accounts', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlement-accounts'] });
      toast.success('Settlement account added successfully!');
    },
    onError: (error) => {
      toast.error(
        formatErrorMessage(error, 'Failed to create settlement account'),
      );
    },
  });
}

export function useEvent(slug: string | null) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: () => api<ApiEvent>(`/events/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useEvents() {
  const { search, category, city, setSearch, setCategory, setCity } =
    useEventFiltersStore();

  const queryParams = new URLSearchParams({ limit: '50' });
  if (search.trim()) queryParams.set('search', search.trim());
  if (category && category !== 'All') queryParams.set('category', category);
  if (city) queryParams.set('city', city);

  const {
    data,
    isPending,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['events', { search, category, city }],
    queryFn: () =>
      api<{ data: ApiEvent[] }>(`/events?${queryParams.toString()}`),
  });

  const events = data?.data || [];
  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Events could not be loaded'
        : '';

  const loading = isPending || isLoading;

  return {
    events,
    search,
    category,
    city,
    error,
    loading,
    setSearch,
    setCategory,
    setCity,
  };
}
