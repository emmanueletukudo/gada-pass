import { getSession, signOut } from 'next-auth/react';
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';


  type EventCategoryResponse = {
    id: string;
    slug: string;
    name: string;
    description: string;
    iconUrl: string;
    isActive: boolean;
    displayOrder: number;
  };

  export type ApiEvent = {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: EventCategoryResponse;
    city?: string;
    venue?: string;
    startsAt: string;
    endsAt: string;
    capacity?: number;
    banner?: string;
    images?: string[];
    organizer?: {
      id: string;
      hostName: string;
      logoUrl?: string;
    };
    ticketTiers: {
      id: string;
      name: string;
      price: string;
      currency: string;
      quantity: number;
      soldCount: number;
    }[];
  };

export async function api<T>(
  path: string,
  options: RequestInit & { responseType?: 'json' | 'blob' } = {},
) {
  const { responseType = 'json', ...fetchOptions } = options;

  const session = await getSession();
  const token = (session as any)?.accessToken;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login')
    ) {
      const currentPath = window.location.pathname;
      await signOut({
        callbackUrl: `/auth/login?callbackurl=${encodeURIComponent(currentPath)}`,
      });
    }

    throw new Error(`Session expired. Redirecting to login.`);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Something went wrong');
  }

  if (responseType === 'blob') {
    return (await response.blob()) as unknown as T;
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message ?? 'Something went wrong');
  return body as T;
}

export function mediaUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}

export function eventCover(event: Pick<ApiEvent, 'banner' | 'images'>) {
  return mediaUrl(event.banner || event.images?.[0]);
}


export const apiUrl = API_URL;