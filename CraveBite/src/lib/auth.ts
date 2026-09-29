// src/lib/auth.ts
// NextAuth v4 configuration – CredentialsProvider with bcryptjs password check.
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// ─── Augment next-auth types to carry `id` and `role` ────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// ─── Auth Options ─────────────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  // Use JWT-based sessions (stateless; no DB session table reads on every req)
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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        // Fetch user from PostgreSQL via Prisma
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          select: { id: true, name: true, email: true, password: true, role: true },
        });

        if (!user || !user.password) {
          throw new Error("No account found with that email.");
        }

        // Compare submitted password against the stored bcrypt hash
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        // Return the shape expected by next-auth's User type
        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Persist extra fields into the JWT on sign-in
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // Expose the extra fields in the session object
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
