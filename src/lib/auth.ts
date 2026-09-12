import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        const phone = credentials.phone.trim();
        const role = credentials.role ? (credentials.role.trim().toUpperCase() as UserRole) : undefined;

        console.log(`[AUTH] Login attempt -> Phone: ${phone}, Role: ${role}`);

        const user = await prisma.user.findFirst({
          where: {
            phone,
            ...(role ? { role } : {}),
            isActive: true,
          },
        });

        if (!user) {
          console.log(`[AUTH] No user found for ${phone} with role ${role}`);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          console.log(`[AUTH] Password invalid for ${phone}`);
          return null;
        }

        console.log(`[AUTH] Success! Logged in as ${user.fullName} (${user.role})`);

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "humane-touch-trust-secret-key-32-chars-long",
};