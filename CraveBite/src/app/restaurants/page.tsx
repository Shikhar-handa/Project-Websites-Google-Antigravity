// src/app/restaurants/page.tsx
// CraveBite – All Restaurants listing (Server Component)
// Reads ?q=, ?cuisine=, ?sort=, ?veg= search params.

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RestaurantsControls } from "@/components/RestaurantsControls";

// ─── SEO ────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "All Restaurants",
  description:
    "Browse all restaurants on CraveBite – filter by cuisine, rating, and delivery time.",
};

// ─── Cuisine emoji map (shared across pages) ──────────────────────────────
export const CUISINE_EMOJI: Record<string, string> = {
  Italian:        "🍕",
  Indian:         "🍛",
  "South Indian": "🥘",
  Chinese:        "🍜",
  "Fast Food":    "🍔",
  Healthy:        "🥗",
  Japanese:       "🍣",
  Mexican:        "🌮",
  American:       "🍔",
};

// ─── Types ───────────────────────────────────────────────────────────────────
type Sort = "rating" | "delivery";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  isPremium: boolean;
  address: string;
  coverImage: string | null;
};

// ─── Data fetch ───────────────────────────────────────────────────────────────
async function getAllRestaurants(
  q?: string,
  cuisine?: string,
  sort?: Sort,
  vegOnly?: boolean
): Promise<Restaurant[]> {
  const restaurants = await db.restaurant.findMany({
    where: {
      AND: [
        cuisine ? { cuisine: { equals: cuisine } } : {},
        q
          ? {
              OR: [
                { name:    { contains: q } },
                { cuisine: { contains: q } },
                { address: { contains: q } },
              ],
            }
          : {},
      ],
    },
    orderBy:
      sort === "delivery"
        ? { deliveryTime: "asc" }
        : { rating: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      cuisine: true,
      rating: true,
      deliveryTime: true,
      isPremium: true,
      address: true,
      coverImage: true,
    },
  });

  // Veg-only filter: keep restaurants that have at least one veg menu item
  if (vegOnly) {
    const vegRestaurantIds = await db.menuItem
      .findMany({
        where: { isVeg: true },
        select: { restaurantId: true },
        distinct: ["restaurantId"],
      })
      .then((rows) => new Set(rows.map((r) => r.restaurantId)));

    return restaurants.filter((r) => vegRestaurantIds.has(r.id));
  }

  return restaurants;
}

async function getCuisines(): Promise<string[]> {
  const rows = await db.restaurant.findMany({
    select: { cuisine: true },
    distinct: ["cuisine"],
    orderBy: { cuisine: "asc" },
  });
  return rows.map((r) => r.cuisine);
}

// ─── Restaurant card ──────────────────────────────────────────────────────────
function RestaurantCard({ r }: { r: Restaurant }) {
  const emoji = CUISINE_EMOJI[r.cuisine] ?? "🍽️";
  return (
    <article
      className="restaurant-card rp-card"
      id={`restaurant-card-${r.slug}`}
      aria-label={r.name}
    >
      {/* Emoji cover */}
      <div className="rp-card-img">
        <span className="rp-card-emoji" aria-hidden="true">{emoji}</span>
        <div className="rp-card-overlay" />
        {r.isPremium && (
          <span className="badge badge-premium rp-premium">⭐ Premium</span>
        )}
      </div>

      {/* Body */}
      <div className="rp-card-body">
        <div className="rp-card-top">
          <span className="badge badge-orange">{r.cuisine}</span>
          <span className="rating-star">⭐ {r.rating.toFixed(1)}</span>
        </div>
        <h2 className="rp-card-name">{r.name}</h2>
        <p className="rp-card-address line-clamp-2">{r.address}</p>
        <div className="rp-card-footer">
          <span className="rp-card-time">🕐 {r.deliveryTime}–{r.deliveryTime + 10} min</span>
          <Link
            href={`/restaurants/${r.slug}`}
            id={`view-btn-${r.slug}`}
            className="btn btn-primary btn-sm"
            aria-label={`View menu for ${r.name}`}
          >
            View Menu
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cuisine?: string; sort?: string; veg?: string }>;
}) {
  const params  = await searchParams;
  const q       = params.q?.trim()       || undefined;
  const cuisine = params.cuisine?.trim() || undefined;
  const sort    = (params.sort === "delivery" ? "delivery" : "rating") as Sort;
  const vegOnly = params.veg === "1";

  const [restaurants, cuisines] = await Promise.all([
    getAllRestaurants(q, cuisine, sort, vegOnly),
    getCuisines(),
  ]);

  return (
    <>
      <Navbar />
      <main id="main-content" className="rp-main">
        {/* ── Page header ── */}
        <div className="rp-hero">
          <div className="rp-hero-blob rp-hero-blob--1" aria-hidden="true" />
          <div className="rp-hero-blob rp-hero-blob--2" aria-hidden="true" />
          <div className="container rp-hero-inner">
            <p className="rp-hero-eyebrow">🍽️ Explore All</p>
            <h1 className="heading-xl rp-hero-heading">
              {cuisine
                ? <><span className="text-gradient">{cuisine}</span> Restaurants</>
                : q
                ? <>Results for &ldquo;<span className="text-gradient">{q}</span>&rdquo;</>
                : vegOnly
                ? <>Pure <span className="text-gradient">Veg</span> Restaurants</>
                : <>All <span className="text-gradient">Restaurants</span></>
              }
            </h1>
            <p className="rp-hero-count">
              {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="container rp-body">
          {/* ── Search + Sort controls (Client Component) ── */}
          <Suspense fallback={null}>
            <RestaurantsControls
              initialQ={q}
              initialSort={sort}
            />
          </Suspense>

          {/* ── Cuisine filter chips ── */}
          <div className="rp-filters" role="navigation" aria-label="Filter by cuisine">
            <Link
              href="/restaurants"
              className={`rp-filter-chip${!cuisine ? " rp-filter-chip--active" : ""}`}
              id="filter-all"
            >
              All
            </Link>
            {cuisines.map((c) => (
              <Link
                key={c}
                href={`/restaurants?cuisine=${encodeURIComponent(c)}`}
                className={`rp-filter-chip${cuisine === c ? " rp-filter-chip--active" : ""}`}
                id={`filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {CUISINE_EMOJI[c] ?? "🍽️"} {c}
              </Link>
            ))}
          </div>

          {/* ── Results grid ── */}
          {restaurants.length > 0 ? (
            <div className="restaurant-grid rp-grid">
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <div className="rp-empty">
              <span className="rp-empty-icon" aria-hidden="true">🍽️</span>
              <h2 className="rp-empty-title">No restaurants found</h2>
              <p className="rp-empty-desc">
                Try a different search term or browse all cuisines.
              </p>
              <Link href="/restaurants" className="btn btn-primary">
                Clear Filters
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* ── Scoped styles ── */}
      <style>{`
        /* ─── Hero banner ────────────────────────────────────────── */
        .rp-main {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .rp-hero {
          position: relative;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          overflow: hidden;
          padding: var(--space-16) 0 var(--space-12);
        }

        .rp-hero-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .rp-hero-blob--1 {
          top: -30%;
          left: -5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255,107,53,0.10) 0%, transparent 65%);
        }

        .rp-hero-blob--2 {
          bottom: -40%;
          right: -5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 65%);
        }

        .rp-hero-inner {
          position: relative;
          z-index: 1;
        }

        .rp-hero-eyebrow {
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          color: var(--accent-orange);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: var(--space-3);
        }

        .rp-hero-heading {
          margin-bottom: var(--space-3);
        }

        .rp-hero-count {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }

        /* ─── Body / filter + grid ───────────────────────────────── */
        .rp-body {
          padding-top: var(--space-8);
          padding-bottom: var(--space-20);
        }

        /* ─── Filter chips ───────────────────────────────────────── */
        .rp-filters {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-8);
        }

        .rp-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: 0.4rem 1rem;
          font-size: var(--text-sm);
          font-weight: var(--fw-medium);
          color: var(--text-secondary);
          background: var(--glass-bg);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          text-decoration: none;
          transition: var(--transition-base);
          white-space: nowrap;
        }

        .rp-filter-chip:hover {
          background: var(--glass-bg-strong);
          border-color: var(--border-default);
          color: var(--text-primary);
        }

        .rp-filter-chip--active {
          background: rgba(255,107,53,0.12);
          border-color: rgba(255,107,53,0.35);
          color: var(--accent-orange-light);
          font-weight: var(--fw-semibold);
        }

        /* ─── Card internals ─────────────────────────────────────── */
        .rp-card {
          display: flex;
          flex-direction: column;
        }

        .rp-card-img {
          position: relative;
          width: 100%;
          height: 200px;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
        }

        .rp-card-emoji {
          font-size: 5rem;
          line-height: 1;
          transition: transform 0.4s ease;
        }

        .restaurant-card:hover .rp-card-emoji {
          transform: scale(1.15) rotate(-4deg);
        }

        .rp-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(13,13,15,0.88) 0%, transparent 60%);
        }

        .rp-premium {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
        }

        .rp-card-body {
          padding: var(--space-4) var(--space-5) var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          flex: 1;
        }

        .rp-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rp-card-name {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
          line-height: var(--lh-tight);
        }

        .rp-card-address {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          line-height: var(--lh-relaxed);
        }

        .rp-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .rp-card-time {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        /* ─── Empty state ────────────────────────────────────────── */
        .rp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-20) 0;
          text-align: center;
        }

        .rp-empty-icon {
          font-size: 4rem;
          opacity: 0.4;
        }

        .rp-empty-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
        }

        .rp-empty-desc {
          font-size: var(--text-base);
          color: var(--text-secondary);
          max-width: 360px;
        }

        /* ─── Grid tweaks ────────────────────────────────────────── */
        .rp-grid {
          animation: fadeInUp 0.4s ease both;
        }
      `}</style>
    </>
  );
}
