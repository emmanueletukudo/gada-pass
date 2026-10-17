import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      hostName: string;
      phone?: string;
      accountType: string;
      firstName?: string;
      lastName?: string;
      gender?: 'MALE' | 'FEMALE' | 'OTHER'
      isNewUser?: boolean;
      role: string;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    hostName: string;
    accountType: string;
    role: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    hostName: string;
    accountType: string;
    accessToken: string;
  }
}

export type UserRole = 'ATTENDEE' | 'ORGANIZER' | 'GATE_AGENT' | 'ADMIN';
