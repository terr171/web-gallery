import NextAuth, { DefaultSession, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import "next-auth/jwt";
import { UserRole } from "@/database/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      role: UserRole;
      avatarUrl?: string;
    } & DefaultSession["user"];
  }

  interface User {
    avatarUrl?: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    avatarUrl?: string;
  }
}
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1);

        if (userResult.length === 0) return null;
        const user = userResult[0];

        const isPasswordValid = await compare(
          credentials.password.toString(),
          user.passwordHash,
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id.toString(),
          name: user.username,
          avatarUrl: user.avatarUrl ?? undefined,
          role: user.role,
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role;
        session.user.avatarUrl = token.avatarUrl;
      }

      return session;
    },
    authorized: async ({ auth, request: { nextUrl } }) => {
      if (nextUrl.pathname.startsWith("/admin")) {
        return auth?.user?.role === UserRole.Admin;
      }
      return true;
    },
  },
});
