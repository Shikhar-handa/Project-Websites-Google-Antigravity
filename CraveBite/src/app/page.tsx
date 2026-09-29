// src/app/page.tsx
// CraveBite – Public Landing Page (Server Component)
// Fetches top-rated restaurants from DB, then renders all homepage sections.

import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CuisineCarousel from "@/components/CuisineCarousel";
import Footer from "@/components/Footer";

// ─── Page-level SEO ─────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "CraveBite – Food Delivered Fast",
  description:
    "Order from your favourite local restaurants with lightning-fast delivery. Discover the best cuisine in your city with CraveBite.",
};

// ─── Types ───────────────────────────────────────────────────────────────────
type Restaurant = {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  isPremium: boolean;
  coverImage: string | null;
};

// ─── Emoji mapping for cuisines (used as placeholder cover image) ─────────────
const CUISINE_EMOJI: Record<string, string> = {
  Italian:      "🍕",
  Indian:       "🍛",
  "South Indian": "🥘",
  Chinese:      "🍜",
  "Fast Food":  "🍔",
  Healthy:      "🥗",
  Japanese:     "🍣",
  Mexican:      "🌮",
  American:     "🍔",
};

// ─── WHY US section data ─────────────────────────────────────────────────────
const WHY_US = [
  { icon: "⚡", title: "Lightning Fast",    desc: "Average delivery in under 30 minutes, guaranteed."              },
  { icon: "🍽️", title: "500+ Restaurants", desc: "The widest selection of local favourites and new gems."          },
  { icon: "🔒", title: "Secure Payments",  desc: "Bank-grade encryption protects every transaction."               },
  { icon: "📍", title: "Live Tracking",    desc: "Watch your order travel from kitchen to your door in real time." },
  { icon: "💬", title: "24/7 Support",     desc: "Our team is always here whenever you need a hand."               },
  { icon: "🎁", title: "Exclusive Deals",  desc: "Members-only offers, combo discounts and weekly specials."       },
];

// ─── Data fetching ───────────────────────────────────────────────────────────
async function getTopRestaurants(): Promise<Restaurant[]> {
  try {
    const restaurants = await db.restaurant.findMany({
      orderBy: { rating: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        cuisine: true,
        rating: true,
        deliveryTime: true,
        isPremium: true,
        coverImage: true,
      },
    });
    return restaurants;
  } catch {
    // Graceful fallback: return empty array; static fallback is shown instead.
    return [];
  }
}

// ─── Static fallback restaurants (shown when DB is empty / unavailable) ──────
const FALLBACK_RESTAURANTS: Restaurant[] = [
  { id: "1", name: "The Burger Lab",   slug: "the-burger-lab",   cuisine: "Fast Food", rating: 4.8, deliveryTime: 20, isPremium: false, coverImage: null },
  { id: "2", name: "Spice Garden",     slug: "spice-garden",     cuisine: "Indian",    rating: 4.7, deliveryTime: 25, isPremium: true,  coverImage: null },
  { id: "3", name: "La Bella Italia",  slug: "la-bella-italia",  cuisine: "Italian",   rating: 4.6, deliveryTime: 35, isPremium: true,  coverImage: null },
  { id: "4", name: "Sushi Sakura",     slug: "sushi-sakura",     cuisine: "Japanese",  rating: 4.9, deliveryTime: 40, isPremium: true,  coverImage: null },
  { id: "5", name: "Taco Fiesta",      slug: "taco-fiesta",      cuisine: "Mexican",   rating: 4.5, deliveryTime: 25, isPremium: false, coverImage: null },
  { id: "6", name: "Green Bowl Co.",   slug: "green-bowl-co",    cuisine: "Healthy",   rating: 4.6, deliveryTime: 25, isPremium: false, coverImage: null },
];

// ─── Restaurant card component ────────────────────────────────────────────────
function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const emoji = CUISINE_EMOJI[restaurant.cuisine] ?? "🍽️";

  return (
    <article
      className="restaurant-card rc-card"
      id={`restaurant-card-${restaurant.slug}`}
      aria-label={restaurant.name}
    >
      {/* Cover image / emoji placeholder */}
      <div className="rc-img-wrap">
        <span className="rc-emoji" aria-hidden="true">{emoji}</span>
        <div className="rc-img-overlay" />
        {restaurant.isPremium && (
          <span className="badge badge-premium rc-premium-badge">⭐ Premium</span>
        )}
      </div>

      {/* Card body */}
      <div className="rc-body">
        <div className="rc-top-row">
          <span className="badge badge-orange">{restaurant.cuisine}</span>
          <span className="rating-star">⭐ {restaurant.rating.toFixed(1)}</span>
        </div>

        <h3 className="rc-title">{restaurant.name}</h3>

        <div className="rc-footer">
          <span className="rc-time">🕐 {restaurant.deliveryTime}–{restaurant.deliveryTime + 10} min</span>
          <Link
            href={`/restaurants/${restaurant.slug}`}
            id={`order-btn-${restaurant.slug}`}
            className="btn btn-primary btn-sm"
            aria-label={`Order from ${restaurant.name}`}
          >
            Order
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Popular restaurants section ─────────────────────────────────────────────
function RestaurantsSection({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <section
      id="restaurants"
      className="section restaurants-section"
      aria-labelledby="restaurants-heading"
    >
      <div className="container">
        {/* Header */}
        <div className="section-header-row">
          <div>
            <p className="section-eyebrow">🏆 Handpicked For You</p>
            <h2 id="restaurants-heading" className="heading-xl">
              Popular <span className="text-gradient">Restaurants</span>{" "}
              <span className="section-sub-text">near you</span>
            </h2>
          </div>
          <Link
            href="/restaurants"
            id="view-all-restaurants-btn"
            className="btn btn-secondary"
          >
            View All →
          </Link>
        </div>

        {/* Grid */}
        <div className="restaurant-grid">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </div>

      <style>{`
        .restaurants-section {
          background: var(--bg-secondary);
        }

        .section-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: var(--space-4);
          margin-bottom: var(--space-10);
          flex-wrap: wrap;
        }

        .section-eyebrow {
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          color: var(--accent-orange);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: var(--space-2);
        }

        .section-sub-text {
          font-weight: var(--fw-regular);
          color: var(--text-secondary);
          font-size: 70%;
        }

        /* ─── Restaurant card ─────────────────────────────── */
        .rc-card {
          display: flex;
          flex-direction: column;
        }

        .rc-img-wrap {
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

        .rc-emoji {
          font-size: 5rem;
          line-height: 1;
          transition: transform 0.4s ease;
        }

        .restaurant-card:hover .rc-emoji {
          transform: scale(1.15) rotate(-4deg);
        }

        .rc-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(13, 13, 15, 0.9) 0%, transparent 60%);
        }

        .rc-premium-badge {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
        }

        .rc-body {
          padding: var(--space-4) var(--space-5) var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          flex: 1;
        }

        .rc-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rc-title {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
          line-height: var(--lh-tight);
        }

        .rc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .rc-time {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      `}</style>
    </section>
  );
}

// ─── Why Choose Us section ────────────────────────────────────────────────────
function WhyUsSection() {
  return (
    <section
      id="why-us"
      className="section bg-mesh why-us-section"
      aria-labelledby="why-us-heading"
    >
      <div className="container">
        <div className="why-us-header">
          <p className="why-us-eyebrow">✨ Our Promise</p>
          <h2 id="why-us-heading" className="heading-xl">
            Why Choose <span className="text-gradient">CraveBite</span>?
          </h2>
          <p className="why-us-desc">
            We obsess over every detail so your food experience is nothing short of perfect.
          </p>
        </div>

        <div className="why-us-grid">
          {WHY_US.map((item, i) => (
            <div
              key={item.title}
              className="glass-card why-us-card"
              id={`why-card-${i + 1}`}
            >
              <span className="why-us-icon" aria-hidden="true">{item.icon}</span>
              <h3 className="why-us-title">{item.title}</h3>
              <p className="why-us-text">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .why-us-section {
          background: var(--bg-secondary);
        }

        .why-us-header {
          text-align: center;
          margin-bottom: var(--space-12);
        }

        .why-us-eyebrow {
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          color: var(--accent-orange);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: var(--space-2);
        }

        .why-us-desc {
          color: var(--text-secondary);
          max-width: 480px;
          margin: var(--space-3) auto 0;
          line-height: var(--lh-relaxed);
        }

        .why-us-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
        }

        .why-us-card {
          padding: var(--space-8) var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .why-us-icon {
          font-size: 2.5rem;
          line-height: 1;
          display: block;
        }

        .why-us-title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
        }

        .why-us-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--lh-relaxed);
        }

        @media (max-width: 1024px) {
          .why-us-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .why-us-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="cta-banner" aria-label="Call to action">
      <div className="container cta-inner">
        <div className="cta-text">
          <h2 className="heading-lg cta-heading">Ready to satisfy your cravings?</h2>
          <p className="cta-sub">Join 50,000+ happy customers ordering on CraveBite every day.</p>
        </div>
        <div className="cta-actions">
          <Link href="/register" id="cta-signup-btn" className="btn btn-primary btn-xl animate-glow">
            🚀 Get Started Free
          </Link>
          <Link href="/restaurants" id="cta-browse-btn" className="btn btn-secondary btn-lg">
            Browse Menu
          </Link>
        </div>
      </div>

      <style>{`
        .cta-banner {
          background: linear-gradient(
            135deg,
            rgba(255, 107, 53, 0.12) 0%,
            rgba(251, 191, 36, 0.08) 50%,
            rgba(255, 107, 53, 0.06) 100%
          );
          border-top: 1px solid var(--border-brand);
          border-bottom: 1px solid var(--border-brand);
          padding: var(--space-20) 0;
        }

        .cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-8);
          flex-wrap: wrap;
        }

        .cta-text { flex: 1; }

        .cta-heading {
          color: var(--text-primary);
          margin-bottom: var(--space-3);
        }

        .cta-sub {
          color: var(--text-secondary);
          font-size: var(--text-base);
        }

        .cta-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .cta-inner { flex-direction: column; text-align: center; }
          .cta-actions { justify-content: center; }
        }
      `}</style>
    </section>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const dbRestaurants = await getTopRestaurants();
  const restaurants = dbRestaurants.length > 0 ? dbRestaurants : FALLBACK_RESTAURANTS;

  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <RestaurantsSection restaurants={restaurants} />
        <CuisineCarousel />
        <WhyUsSection />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
