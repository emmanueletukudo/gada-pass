'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, API_URL, ApiEvent } from './api';


export function useApiQuery<T>(
  queryKey: readonly unknown[],
  path: string,
  options?: Omit<
    UseQueryOptions<T, Error, T, readonly unknown[]>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: () => api<T>(path),
    ...options,
  });
}


