"use client";
// src/components/providers/SessionProvider.tsx
// Thin wrapper so SessionProvider (client-only) can live inside the server layout.
import { SessionProvider } from "next-auth/react";

export default function NextAuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
