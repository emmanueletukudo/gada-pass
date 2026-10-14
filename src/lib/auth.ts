import { UserRole } from "@/types/next-auth";
import { api } from "./api";

export type Role = "ATTENDEE" | "ORGANIZER" | "GATE_AGENT" | "ADMIN";
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role
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
  accountType: 'INDIVIDUAL' | 'ORGANIZATION'
}) {
  const result = await api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(values),
  });
  localStorage.setItem('eventsgada_token', result.accessToken);
  if (result.user)
    localStorage.setItem('eventsgada_user', JSON.stringify(result.user));
  return result;
}
