import { api } from '@/lib/api';
import { UserRole } from '@/types/next-auth';
import NextAuth, { AuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOption: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'Application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            },
          );

          if (!res.ok) return null;
          const data = await res.json();
          if (data && data.accessToken) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.firstName + ' ' + data.user.lastName,
              hostName: data.user.hostName,
              accountType: data.user.accountType,
              role: data.user.role,
              accessToken: data.accessToken,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        try {
          const res = await api<{ accessToken: string }>('/auth/google', {
            method: 'POST',
            body: JSON.stringify({
              idToken: account.id_token,
              email: profile?.email,
              firstName: (profile as any)?.given_name,
              lastName: (profile as any)?.family_name,
            }),
          });

          if (res?.accessToken) {
            account.backendTokens = res;
            return true;
          }
          return false;
        } catch (error) {
          console.error('Google Sign-In backend error:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (trigger === 'update' && session) {
        const updateData = session as any;
        return {
          ...token,
          accessToken: updateData.accessToken ?? token.accessToken,
          user: {
            ...(token.user as object),
            ...(updateData.user ?? {}),
          },
        };
      }

      if (account?.provider === 'google' && account.backendTokens) {
        const backendRes = account.backendTokens as any;
        return {
          ...token,
          accessToken: backendRes.accessToken,
          user: {
            ...backendRes.user,
            isNewUser: backendRes.isNewUser,
          },
        };
      }
      if (user) {
        return {
          ...token,
          accessToken: (user as any).accessToken,
          user: (user as any).user || user,
        };
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = token.user as any;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'supper_secrete',
};

const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
