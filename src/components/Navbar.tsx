"use client";
// src/components/Navbar.tsx
// Sticky glassmorphism navbar: auth-aware, cart icon, responsive burger menu.

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ShoppingCart, Menu, X, UtensilsCrossed, LayoutDashboard, LogIn } from "lucide-react";
import { useCart } from "@/context/CartContext";

// ─── Nav links data ─────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/#restaurants", label: "Restaurants" },
  { href: "/#cuisines",    label: "Cuisines"    },
  { href: "/#why-us",      label: "Why Us"      },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const { totalItems: cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for enhanced glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  const isLoggedIn = status === "authenticated" && !!session;

  return (
    <>
      <nav
        className="navbar-root"
        role="navigation"
        aria-label="Main navigation"
        data-scrolled={scrolled}
      >
        <div className="container navbar-inner">
          {/* ── Logo ── */}
          <Link href="/" className="navbar-logo" aria-label="CraveBite home">
            <UtensilsCrossed size={22} className="navbar-logo-icon" aria-hidden="true" />
            <span className="text-gradient navbar-logo-text">CraveBite</span>
          </Link>

          {/* ── Desktop links ── */}
          <ul className="navbar-links" role="list">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="navbar-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Desktop right actions ── */}
          <div className="navbar-actions">
            {/* Cart */}
            <Link
              href="/cart"
              className="navbar-cart-btn"
              aria-label={`Shopping cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
              id="nav-cart-btn"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="navbar-cart-badge" aria-live="polite">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Auth CTA */}
            {status === "loading" ? (
              <div className="navbar-auth-skeleton" aria-hidden="true" />
            ) : isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn btn-primary btn-sm"
                id="nav-dashboard-btn"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary btn-sm"
                id="nav-login-btn"
              >
                <LogIn size={15} />
                Login
              </Link>
            )}

            {/* Burger (mobile only) */}
            <button
              className="navbar-burger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              id="nav-burger-btn"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <div
          id="mobile-menu"
          className={`navbar-mobile-menu${menuOpen ? " navbar-mobile-menu--open" : ""}`}
          aria-hidden={!menuOpen}
        >
          <ul className="navbar-mobile-links" role="list">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="navbar-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-mobile-actions">
            <Link
              href="/cart"
              className="btn btn-secondary btn-sm"
              onClick={() => setMenuOpen(false)}
              id="mobile-cart-btn"
            >
              <ShoppingCart size={16} />
              Cart
              {cartCount > 0 && (
                <span className="navbar-cart-badge navbar-cart-badge--inline">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn btn-primary btn-sm"
                onClick={() => setMenuOpen(false)}
                id="mobile-dashboard-btn"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary btn-sm"
                onClick={() => setMenuOpen(false)}
                id="mobile-login-btn"
              >
                <LogIn size={16} />
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Scoped styles ── */}
      <style>{`
        /* ─── Navbar root ─────────────────────────────────────────── */
        .navbar-root {
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          background: rgba(13, 13, 15, 0.80);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          transition: var(--transition-smooth);
        }

        .navbar-root[data-scrolled="true"] {
          background: rgba(13, 13, 15, 0.95);
          border-bottom-color: var(--border-default);
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }

        /* ─── Inner layout ────────────────────────────────────────── */
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          gap: var(--space-6);
        }

        /* ─── Logo ────────────────────────────────────────────────── */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          text-decoration: none;
          flex-shrink: 0;
        }

        .navbar-logo-icon {
          color: var(--accent-orange);
          flex-shrink: 0;
        }

        .navbar-logo-text {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          font-weight: var(--fw-extrabold);
          letter-spacing: -0.03em;
        }

        /* ─── Desktop nav links ───────────────────────────────────── */
        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .navbar-link {
          font-size: var(--text-sm);
          font-weight: var(--fw-medium);
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition-fast);
          position: relative;
          padding-bottom: 2px;
        }

        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--brand-gradient);
          border-radius: var(--radius-full);
          transition: width 0.25s ease;
        }

        .navbar-link:hover {
          color: var(--text-primary);
        }

        .navbar-link:hover::after {
          width: 100%;
        }

        /* ─── Right actions row ───────────────────────────────────── */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-shrink: 0;
        }

        /* ─── Cart button ─────────────────────────────────────────── */
        .navbar-cart-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: var(--glass-bg);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition-base);
          cursor: pointer;
        }

        .navbar-cart-btn:hover {
          background: var(--glass-bg-strong);
          border-color: var(--border-brand);
          color: var(--accent-orange);
          transform: scale(1.05);
        }

        /* ─── Cart badge ──────────────────────────────────────────── */
        .navbar-cart-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--brand-gradient);
          color: #fff;
          font-size: 10px;
          font-weight: var(--fw-bold);
          border-radius: var(--radius-full);
          line-height: 1;
          animation: bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 2px 8px rgba(255,107,53,0.5);
        }

        .navbar-cart-badge--inline {
          position: static;
          top: unset;
          right: unset;
        }

        /* ─── Auth loading skeleton ───────────────────────────────── */
        .navbar-auth-skeleton {
          width: 90px;
          height: 32px;
          border-radius: var(--radius-lg);
          background: var(--bg-elevated);
          animation: shimmer 1.5s infinite;
          background-size: 200% 100%;
          background-image: linear-gradient(
            90deg,
            var(--bg-elevated) 25%,
            var(--bg-card-hover) 50%,
            var(--bg-elevated) 75%
          );
        }

        /* ─── Burger button ───────────────────────────────────────── */
        .navbar-burger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: var(--glass-bg);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition-base);
          flex-shrink: 0;
        }

        .navbar-burger:hover {
          background: var(--glass-bg-strong);
          border-color: var(--border-default);
        }

        /* ─── Mobile menu ─────────────────────────────────────────── */
        .navbar-mobile-menu {
          overflow: hidden;
          max-height: 0;
          border-top: 1px solid transparent;
          background: rgba(13, 13, 15, 0.98);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.25s ease,
                      padding 0.3s ease;
          padding: 0 var(--space-4);
        }

        .navbar-mobile-menu--open {
          max-height: 340px;
          border-top-color: var(--border-subtle);
          padding: var(--space-4) var(--space-4) var(--space-6);
        }

        .navbar-mobile-links {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .navbar-mobile-link {
          display: block;
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-base);
          font-weight: var(--fw-medium);
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: var(--radius-lg);
          transition: var(--transition-fast);
        }

        .navbar-mobile-link:hover {
          color: var(--text-primary);
          background: var(--glass-bg);
        }

        .navbar-mobile-actions {
          display: flex;
          gap: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-subtle);
        }

        /* ─── Responsive breakpoints ──────────────────────────────── */
        @media (max-width: 768px) {
          .navbar-links {
            display: none;
          }

          .navbar-burger {
            display: flex;
          }
        }

        @media (min-width: 769px) {
          .navbar-mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
