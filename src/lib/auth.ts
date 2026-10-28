import { UserRole } from '@/types/next-auth';
import { api } from './hooks-new/api';

export type Role = 'ATTENDEE' | 'ORGANIZER' | 'GATE_AGENT' | 'ADMIN';
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
};
export type AuthResponse = { accessToken: string; user?: User };

export function getDashboardPathForRole(role?: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'ORGANIZER':
      return '/dashboard/organizer';
    case 'GATE_AGENT':
      return '/dashboard/agent';
    case 'ATTENDEE':
    default:
      return '/dashboard/attendee';
  }
}

export async function register(values: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  hostName: string;
  role: 'ATTENDEE' | 'ORGANIZER';
  accountType: 'INDIVIDUAL' | 'ORGANIZATION';
}) {
  const result = await api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(values),
  });
  return result;
}

export async function uploadHostLogoDirect(file: File): Promise<string> {
  const { uploadUrl, publicUrl } = await api<{
    uploadUrl: string;
    fileKey: string;
    publicUrl: string;
  }>('/users/profile/logo-presign', {
    method: 'POST',
    body: JSON.stringify({ contentType: file.type }),
  });

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image directly to storage.');
  }

  await api('/users/profile/logo', {
    method: 'PATCH',
    body: JSON.stringify({ logoUrl: publicUrl }),
  });

  return publicUrl;
}