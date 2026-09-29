"use client";
// src/components/HeroSection.tsx
// Hero section: display heading, gradient tagline, search bar, CTAs, floating particles.
// Particles are rendered ONLY after mounting (useState + useEffect) to prevent hydration mismatch.

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Particle data (positions generated deterministically then deferred) ───
type Particle = {
  id: number;
  emoji: string;
  top: string;
  left: string;
  fontSize: string;
  opacity: number;
  delay: string;
  duration: string;
};

const EMOJIS = ["🍔", "🍕", "🍣", "🍛", "🌮", "🍜", "🍰", "🥗", "🍱", "🍤"];

// Produce deterministic-looking positions from a seed – runs client-side only.
function generateParticles(): Particle[] {
  return EMOJIS.map((emoji, i) => {
    const angle = (i / EMOJIS.length) * 2 * Math.PI;
    // Spread across 80% of area with offset to keep away from centre
    const r = 30 + (i % 3) * 18;
    const top  = `${50 + r * Math.sin(angle)}%`;
    const left = `${50 + r * Math.cos(angle)}%`;
    return {
      id: i,
      emoji,
      top,
      left,
      fontSize: `${1.6 + (i % 3) * 0.5}rem`,
      opacity: 0.08 + (i % 4) * 0.025,
      delay: `${(i * 0.55).toFixed(2)}s`,
      duration: `${4 + (i % 3)}s`,
    };
  });
}

// ─── Stats row data ─────────────────────────────────────────────────────────
const STATS = [
  { value: "500+",   label: "Restaurants"      },
  { value: "30 min", label: "Avg. Delivery"    },
  { value: "50k+",   label: "Happy Customers"  },
  { value: "4.9★",   label: "App Rating"       },
];

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const router = useRouter();

  // Defer particle generation to client-side only (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true);
    setParticles(generateParticles());
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/restaurants?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  return (
    <>
      <section className="hero-root bg-mesh" aria-label="Hero section">
        {/* Ambient blobs */}
        <div className="hero-blob hero-blob--1" aria-hidden="true" />
        <div className="hero-blob hero-blob--2" aria-hidden="true" />

        {/* Floating food particles – client-only to avoid hydration mismatch */}
        {mounted && (
          <div className="hero-particles" aria-hidden="true">
            {particles.map((p) => (
              <span
                key={p.id}
                className="hero-particle animate-float-slow"
                style={{
                  top: p.top,
                  left: p.left,
                  fontSize: p.fontSize,
                  opacity: p.opacity,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
              >
                {p.emoji}
              </span>
            ))}
          </div>
        )}

        {/* Main content */}
        <div className="container hero-content">
          {/* Badge */}
          <div className="hero-badge-wrap animate-fade-in">
            <span className="badge badge-orange">🔥 #1 Food Delivery App</span>
          </div>

          {/* Headline */}
          <h1 className="heading-display hero-heading animate-fade-in-up">
            Cravings{" "}
            <span className="text-gradient-warm">Delivered</span>
            <br />
            Fast!
          </h1>

          {/* Subheading / tagline */}
          <p className="hero-sub animate-fade-in-up animation-delay-200">
            From your favourite local spots to hidden gems —{" "}
            <strong>hot meals, right to your door</strong> in 30&nbsp;minutes or less.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="hero-search-wrap animate-fade-in-up animation-delay-300"
            role="search"
            aria-label="Search restaurants or cuisines"
          >
            <div className="input-wrapper hero-input-wrapper">
              <Search size={18} className="input-icon" aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                className="input input-search hero-input"
                placeholder="Search restaurants, cuisines or dishes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search restaurants"
                autoComplete="off"
              />
            </div>
            <button
              id="hero-search-btn"
              type="submit"
              className="btn btn-primary btn-lg hero-search-btn"
              aria-label="Search"
            >
              Search
            </button>
          </form>

          {/* CTA buttons */}
          <div className="hero-ctas animate-fade-in-up animation-delay-400">
            <Link
              href="#restaurants"
              id="hero-order-btn"
              className="btn btn-primary btn-xl"
            >
              🛵 Order Now
            </Link>
            <Link
              href="#restaurants"
              id="hero-browse-btn"
              className="btn btn-secondary btn-xl"
            >
              🍽️ Browse Restaurants
            </Link>
          </div>

          {/* Stats row */}
          <div className="hero-stats animate-fade-in animation-delay-500">
            {STATS.map((s) => (
              <div key={s.label} className="hero-stat">
                <span className="text-gradient hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* ─── Root ────────────────────────────────────────────────── */
        .hero-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: var(--bg-primary);
        }

        /* ─── Ambient blobs ───────────────────────────────────────── */
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .hero-blob--1 {
          top: -15%;
          left: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.13) 0%, transparent 65%);
          animation: float 8s ease-in-out infinite;
        }

        .hero-blob--2 {
          bottom: -20%;
          right: -15%;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.09) 0%, transparent 65%);
          animation: float 10s ease-in-out infinite reverse;
        }

        /* ─── Particles ───────────────────────────────────────────── */
        .hero-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .hero-particle {
          position: absolute;
          user-select: none;
          will-change: transform;
          transform: translate(-50%, -50%);
        }

        /* ─── Content ─────────────────────────────────────────────── */
        .hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-top: var(--space-24);
          padding-bottom: var(--space-24);
          gap: var(--space-6);
        }

        .hero-badge-wrap {
          margin-bottom: var(--space-2);
        }

        /* ─── Heading ─────────────────────────────────────────────── */
        .hero-heading {
          max-width: 760px;
          margin-bottom: var(--space-2);
        }

        /* ─── Sub ─────────────────────────────────────────────────── */
        .hero-sub {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          max-width: 580px;
          line-height: var(--lh-relaxed);
        }

        .hero-sub strong {
          color: var(--text-primary);
          font-weight: var(--fw-semibold);
        }

        /* ─── Search bar ──────────────────────────────────────────── */
        .hero-search-wrap {
          display: flex;
          gap: var(--space-3);
          width: 100%;
          max-width: 640px;
          background: var(--glass-bg-strong);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          padding: var(--space-2);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: var(--shadow-lg);
          transition: var(--transition-smooth);
        }

        .hero-search-wrap:focus-within {
          border-color: var(--border-brand);
          box-shadow: var(--shadow-brand);
        }

        .hero-input-wrapper {
          flex: 1;
        }

        .hero-input {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: var(--text-base);
          height: 48px;
        }

        .hero-input:focus {
          background: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
        }

        .hero-search-btn {
          flex-shrink: 0;
          border-radius: var(--radius-xl) !important;
          padding-left: 1.5rem !important;
          padding-right: 1.5rem !important;
        }

        /* ─── CTA row ─────────────────────────────────────────────── */
        .hero-ctas {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          justify-content: center;
        }

        /* ─── Stats ───────────────────────────────────────────────── */
        .hero-stats {
          display: flex;
          gap: var(--space-8);
          flex-wrap: wrap;
          justify-content: center;
          margin-top: var(--space-4);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-subtle);
          width: 100%;
          max-width: 700px;
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
        }

        .hero-stat-value {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          font-weight: var(--fw-extrabold);
        }

        .hero-stat-label {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* ─── Responsive ──────────────────────────────────────────── */
        @media (max-width: 640px) {
          .hero-content {
            padding-top: var(--space-16);
            padding-bottom: var(--space-16);
          }

          .hero-sub {
            font-size: var(--text-base);
          }

          .hero-search-wrap {
            flex-direction: column;
          }

          .hero-search-btn {
            width: 100%;
          }

          .hero-stats {
            gap: var(--space-6);
          }
        }
      `}</style>
    </>
  );
}
