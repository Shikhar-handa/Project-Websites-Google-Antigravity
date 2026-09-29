// src/app/api/auth/[...nextauth]/route.ts
// Catch-all NextAuth v4 route handler for the App Router.
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
