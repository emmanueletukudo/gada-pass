import { UserRole } from '@/types/next-auth';
import NextAuth, { AuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOption: AuthOptions = {
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.role = user.role;
        token.hostName = user.hostName,
        token.accountType = user.accountType,
        token.accessTokenExpired = Date.now() + 24 * 60 * 60 * 1000
      }

      if (Date.now() < (token.accessTokenExpired as number)) {
        return token;
      }
      
      return {...token, error: "AccessTokenExpired"}
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as UserRole,
          hostName: token.hostName as string,
          accountType: token.accountType as string, 
        },
        accessToken: token.accessToken as string,
      };
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'supper_secrete',
};

const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
