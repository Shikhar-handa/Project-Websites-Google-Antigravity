// src/proxy.ts
// Next.js 16 Proxy (replaces middleware.ts) – route protection via NextAuth JWT.
// Reads the JWT cookie optimistically (no DB round-trip) and redirects:
//   • Unauthenticated users → /login  (when accessing /dashboard/*)
//   • Authenticated users  → /dashboard (when accessing /login or /register)
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ─── Route Classification ─────────────────────────────────────────────────────
const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

// ─── Proxy Handler ────────────────────────────────────────────────────────────
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read the NextAuth JWT from the session cookie (no DB hit)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // 1. Unauthenticated user trying to access a protected route → /login
  if (isProtected(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user trying to access login/register → /dashboard
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
}

// ─── Matcher: run on all routes except Next.js internals & static assets ──────
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
