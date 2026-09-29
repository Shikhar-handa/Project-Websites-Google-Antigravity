// src/app/restaurants/[slug]/page.tsx
// CraveBite – Restaurant Detail Page (Server Component)
// Fetches restaurant + menu from Prisma by slug. Calls notFound() if missing.
// Menu items use the <AddToCartButton> Client Component for cart integration.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CUISINE_EMOJI } from "../page";

// ─── Types ───────────────────────────────────────────────────────────────────
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  isVeg: boolean;
  available: boolean;
};

type RestaurantDetail = {
  id: string;
  name: string;
  slug: string;
  address: string;
  rating: number;
  cuisine: string;
  coverImage: string | null;
  deliveryTime: number;
  isPremium: boolean;
  menuItems: MenuItem[];
  reviews: { rating: number }[];
};

// ─── Data fetch ───────────────────────────────────────────────────────────────
async function getRestaurant(slug: string): Promise<RestaurantDetail | null> {
  return db.restaurant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      rating: true,
      cuisine: true,
      coverImage: true,
      deliveryTime: true,
      isPremium: true,
      menuItems: {
        where: { available: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          isVeg: true,
          available: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { name: true, cuisine: true, address: true },
  });

  if (!restaurant) {
    return { title: "Restaurant Not Found" };
  }

  return {
    title: restaurant.name,
    description: `Order ${restaurant.cuisine} food from ${restaurant.name} — ${restaurant.address}. Fast delivery on CraveBite.`,
  };
}

// ─── Static params for pre-rendering ─────────────────────────────────────────
export async function generateStaticParams() {
  const restaurants = await db.restaurant.findMany({
    select: { slug: true },
  });
  return restaurants.map((r) => ({ slug: r.slug }));
}

// ─── Menu item card ───────────────────────────────────────────────────────────
// The card itself is a Server Component; only the button is a Client Component.
function MenuItemCard({
  item,
  restaurantId,
  restaurantName,
  restaurantSlug,
}: {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
}) {
  return (
    <div
      className="rd-menu-item"
      id={`menu-item-${item.id}`}
      role="article"
      aria-label={item.name}
    >
      {/* Veg / non-veg dot indicator */}
      <span
        className={item.isVeg ? "veg-dot" : "nonveg-dot"}
        aria-label={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
        title={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
      />

      <div className="rd-menu-info">
        <h3 className="rd-menu-name">{item.name}</h3>
        {item.description && (
          <p className="rd-menu-desc line-clamp-2">{item.description}</p>
        )}
      </div>

      <div className="rd-menu-actions">
        <span className="rd-menu-price">₹{item.price.toFixed(0)}</span>
        {/* Client component – handles cart state */}
        <AddToCartButton
          item={{
            itemId:         item.id,
            name:           item.name,
            price:          item.price,
            isVeg:          item.isVeg,
            restaurantId,
            restaurantName,
            restaurantSlug,
          }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  // Not found → 404 page
  if (!restaurant) {
    notFound();
  }

  const emoji = CUISINE_EMOJI[restaurant.cuisine] ?? "🍽️";

  // Group menu items by category
  const menuByCategory = restaurant.menuItems.reduce<Record<string, MenuItem[]>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  const categories = Object.keys(menuByCategory).sort((a, b) => {
    const order = ["Starter", "Main Course", "Dessert", "Beverage"];
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const reviewCount = restaurant.reviews.length;
  const avgRating   = reviewCount > 0
    ? restaurant.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : restaurant.rating;

  return (
    <>
      <Navbar />
      <main id="main-content" className="rd-main">

        {/* ── Hero banner ── */}
        <div className="rd-hero">
          <div className="rd-hero-blob rd-hero-blob--1" aria-hidden="true" />
          <div className="rd-hero-blob rd-hero-blob--2" aria-hidden="true" />

          <div className="container rd-hero-inner">
            {/* Breadcrumb */}
            <nav className="rd-breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="rd-breadcrumb-link">Home</Link>
              <span className="rd-breadcrumb-sep" aria-hidden="true">/</span>
              <Link href="/restaurants" className="rd-breadcrumb-link">Restaurants</Link>
              <span className="rd-breadcrumb-sep" aria-hidden="true">/</span>
              <span className="rd-breadcrumb-current" aria-current="page">{restaurant.name}</span>
            </nav>

            {/* Restaurant identity */}
            <div className="rd-hero-content">
              <div className="rd-hero-emoji-wrap" aria-hidden="true">
                <span className="rd-hero-emoji">{emoji}</span>
              </div>

              <div className="rd-hero-info">
                <div className="rd-hero-badges">
                  <span className="badge badge-orange">{restaurant.cuisine}</span>
                  {restaurant.isPremium && (
                    <span className="badge badge-premium">⭐ Premium</span>
                  )}
                </div>

                <h1 className="rd-hero-name">{restaurant.name}</h1>

                <p className="rd-hero-address">
                  <span aria-hidden="true">📍</span> {restaurant.address}
                </p>

                {/* Stats row */}
                <div className="rd-stats">
                  <div className="rd-stat">
                    <span className="rating-star">⭐ {avgRating.toFixed(1)}</span>
                    {reviewCount > 0 && (
                      <span className="rd-stat-label">({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
                    )}
                  </div>
                  <div className="rd-stat-divider" aria-hidden="true" />
                  <div className="rd-stat">
                    <span className="rd-stat-value">🕐 {restaurant.deliveryTime}–{restaurant.deliveryTime + 10} min</span>
                    <span className="rd-stat-label">Delivery</span>
                  </div>
                  <div className="rd-stat-divider" aria-hidden="true" />
                  <div className="rd-stat">
                    <span className="rd-stat-value">🛵 Free</span>
                    <span className="rd-stat-label">Delivery fee</span>
                  </div>
                  <div className="rd-stat-divider" aria-hidden="true" />
                  <div className="rd-stat">
                    <span className="rd-stat-value">
                      {restaurant.menuItems.filter((m) => m.isVeg).length > 0 ? "🟢 Veg options" : "🔴 Non-veg"}
                    </span>
                    <span className="rd-stat-label">
                      {restaurant.menuItems.filter((m) => m.isVeg).length} veg item{restaurant.menuItems.filter((m) => m.isVeg).length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Menu ── */}
        <div className="container rd-body">

          {/* Category jump nav */}
          {categories.length > 1 && (
            <nav
              className="rd-cat-nav"
              aria-label="Jump to menu category"
              id="menu-category-nav"
            >
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={`#cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rp-filter-chip"
                >
                  {cat}
                </a>
              ))}
            </nav>
          )}

          {categories.length > 0 ? (
            categories.map((cat) => (
              <section
                key={cat}
                id={`cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className="rd-cat-section"
                aria-labelledby={`cat-heading-${cat}`}
              >
                <h2
                  id={`cat-heading-${cat}`}
                  className="rd-cat-heading"
                >
                  {cat}
                  <span className="rd-cat-count">
                    {menuByCategory[cat].length} item{menuByCategory[cat].length !== 1 ? "s" : ""}
                  </span>
                </h2>

                <div className="rd-menu-grid">
                  {menuByCategory[cat].map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      restaurantId={restaurant.id}
                      restaurantName={restaurant.name}
                      restaurantSlug={restaurant.slug}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rp-empty">
              <span className="rp-empty-icon" aria-hidden="true">🍽️</span>
              <h2 className="rp-empty-title">Menu coming soon</h2>
              <p className="rp-empty-desc">This restaurant hasn&apos;t added their menu yet.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* ── Scoped styles ── */}
      <style>{`
        /* ─── Layout ─────────────────────────────────────────────── */
        .rd-main {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* ─── Hero ───────────────────────────────────────────────── */
        .rd-hero {
          position: relative;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          overflow: hidden;
          padding: var(--space-10) 0 var(--space-12);
        }

        .rd-hero-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .rd-hero-blob--1 {
          top: -40%;
          left: -8%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,107,53,0.10) 0%, transparent 65%);
        }

        .rd-hero-blob--2 {
          bottom: -50%;
          right: -8%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 65%);
        }

        .rd-hero-inner {
          position: relative;
          z-index: 1;
        }

        /* ─── Breadcrumb ─────────────────────────────────────────── */
        .rd-breadcrumb {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-8);
        }

        .rd-breadcrumb-link {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          text-decoration: none;
          transition: var(--transition-fast);
        }

        .rd-breadcrumb-link:hover {
          color: var(--accent-orange);
        }

        .rd-breadcrumb-sep {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        .rd-breadcrumb-current {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: var(--fw-medium);
        }

        /* ─── Hero content ───────────────────────────────────────── */
        .rd-hero-content {
          display: flex;
          align-items: flex-start;
          gap: var(--space-8);
        }

        .rd-hero-emoji-wrap {
          flex-shrink: 0;
          width: 120px;
          height: 120px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-2xl);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
        }

        .rd-hero-emoji {
          font-size: 4rem;
          line-height: 1;
        }

        .rd-hero-info {
          flex: 1;
          min-width: 0;
        }

        .rd-hero-badges {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
          flex-wrap: wrap;
        }

        .rd-hero-name {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: var(--fw-black);
          color: var(--text-primary);
          line-height: var(--lh-tight);
          letter-spacing: -0.02em;
          margin-bottom: var(--space-2);
        }

        .rd-hero-address {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          margin-bottom: var(--space-5);
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        /* ─── Stats row ──────────────────────────────────────────── */
        .rd-stats {
          display: flex;
          align-items: center;
          gap: var(--space-5);
          flex-wrap: wrap;
        }

        .rd-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rd-stat-value {
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
        }

        .rd-stat-label {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }

        .rd-stat-divider {
          width: 1px;
          height: 28px;
          background: var(--border-subtle);
          align-self: center;
        }

        /* ─── Menu body ──────────────────────────────────────────── */
        .rd-body {
          padding-top: var(--space-8);
          padding-bottom: var(--space-20);
        }

        /* ─── Category jump nav ──────────────────────────────────── */
        .rd-cat-nav {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-10);
        }

        /* ─── Category section ───────────────────────────────────── */
        .rd-cat-section {
          margin-bottom: var(--space-12);
        }

        .rd-cat-heading {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--border-subtle);
        }

        .rd-cat-count {
          font-size: var(--text-sm);
          font-weight: var(--fw-regular);
          color: var(--text-muted);
        }

        /* ─── Menu item grid ─────────────────────────────────────── */
        .rd-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-4);
        }

        /* ─── Menu item card ─────────────────────────────────────── */
        .rd-menu-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          transition: var(--transition-smooth);
        }

        .rd-menu-item:hover {
          border-color: var(--border-default);
          background: var(--bg-card-hover);
          box-shadow: var(--shadow-sm);
          transform: translateY(-2px);
        }

        .rd-menu-info {
          flex: 1;
          min-width: 0;
        }

        .rd-menu-name {
          font-size: var(--text-base);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
          line-height: var(--lh-snug);
        }

        .rd-menu-desc {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          line-height: var(--lh-relaxed);
        }

        .rd-menu-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: var(--space-2);
          flex-shrink: 0;
        }

        .rd-menu-price {
          font-family: var(--font-display);
          font-size: var(--text-base);
          font-weight: var(--fw-bold);
          color: var(--accent-orange);
          white-space: nowrap;
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

        .rp-empty-icon { font-size: 4rem; opacity: 0.4; }

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

        /* filter chip (shared with list page) */
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

        /* ─── Responsive ─────────────────────────────────────────── */
        @media (max-width: 640px) {
          .rd-hero-content { flex-direction: column; align-items: center; text-align: center; }
          .rd-hero-badges  { justify-content: center; }
          .rd-hero-address { justify-content: center; }
          .rd-stats        { justify-content: center; }
          .rd-menu-grid    { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
