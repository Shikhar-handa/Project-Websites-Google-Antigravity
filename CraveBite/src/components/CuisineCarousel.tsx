"use client";
// src/components/CuisineCarousel.tsx
// Horizontal-scrolling cuisine chips carousel.

import Link from "next/link";

type CuisineItem = {
  name: string;
  emoji: string;
  color: string;
  slug: string;
};

const CUISINES: CuisineItem[] = [
  { name: "Burgers",   emoji: "🍔", color: "var(--accent-orange)", slug: "fast food"    },
  { name: "Pizza",     emoji: "🍕", color: "var(--accent-red)",    slug: "italian"      },
  { name: "Sushi",     emoji: "🍣", color: "var(--accent-pink)",   slug: "japanese"     },
  { name: "Indian",    emoji: "🍛", color: "var(--accent-yellow)", slug: "indian"       },
  { name: "Chinese",   emoji: "🍜", color: "var(--accent-green)",  slug: "chinese"      },
  { name: "Mexican",   emoji: "🌮", color: "var(--accent-purple)", slug: "mexican"      },
  { name: "Healthy",   emoji: "🥗", color: "var(--accent-green)",  slug: "healthy"      },
  { name: "Desserts",  emoji: "🍰", color: "var(--accent-pink)",   slug: "desserts"     },
  { name: "South Ind", emoji: "🥘", color: "var(--accent-yellow)", slug: "south indian" },
  { name: "Noodles",   emoji: "🍝", color: "var(--accent-orange)", slug: "noodles"      },
];

type Props = {
  /** Override the default cuisine list (e.g. from DB) */
  items?: CuisineItem[];
};

export default function CuisineCarousel({ items = CUISINES }: Props) {
  return (
    <>
      <section
        id="cuisines"
        className="cuisine-carousel-section section"
        aria-labelledby="cuisines-heading"
      >
        <div className="container">
          {/* Section header */}
          <div className="cuisine-carousel-header">
            <p className="cuisine-carousel-eyebrow">🌍 Explore Flavours</p>
            <h2 id="cuisines-heading" className="heading-xl">
              Popular <span className="text-gradient">Cuisines</span>
            </h2>
          </div>

          {/* Horizontal scroll strip */}
          <div
            className="cuisine-carousel-track"
            role="list"
            aria-label="Browse cuisine categories"
          >
            {items.map((c) => (
              <Link
                key={c.name}
                href={`/restaurants?cuisine=${encodeURIComponent(c.slug)}`}
                id={`cuisine-${c.slug.replace(/\s+/g, "-")}`}
                className="cuisine-chip"
                role="listitem"
                aria-label={`Browse ${c.name} restaurants`}
                style={{ "--chip-color": c.color } as React.CSSProperties}
              >
                <span className="cuisine-chip-emoji" aria-hidden="true">
                  {c.emoji}
                </span>
                <span className="cuisine-chip-name">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* ─── Section wrapper ─────────────────────────────────────── */
        .cuisine-carousel-section {
          background: var(--bg-primary);
        }

        /* ─── Section header ──────────────────────────────────────── */
        .cuisine-carousel-header {
          text-align: center;
          margin-bottom: var(--space-10);
        }

        .cuisine-carousel-eyebrow {
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          color: var(--accent-orange);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: var(--space-2);
        }

        /* ─── Scrollable track ────────────────────────────────────── */
        .cuisine-carousel-track {
          display: flex;
          gap: var(--space-4);
          overflow-x: auto;
          padding-bottom: var(--space-4);
          /* Hide scrollbar visually */
          scrollbar-width: none;
          -ms-overflow-style: none;
          /* Smooth momentum scroll on iOS */
          -webkit-overflow-scrolling: touch;
          /* Snap behaviour */
          scroll-snap-type: x mandatory;
        }

        .cuisine-carousel-track::-webkit-scrollbar {
          display: none;
        }

        /* ─── Individual chip ─────────────────────────────────────── */
        .cuisine-chip {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          width: 120px;
          padding: var(--space-5) var(--space-3);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-2xl);
          text-decoration: none;
          transition: var(--transition-spring);
          cursor: pointer;
          scroll-snap-align: start;
        }

        .cuisine-chip:hover {
          background: var(--bg-card-hover);
          border-color: var(--chip-color, var(--accent-orange));
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.15),
                      0 8px 24px rgba(0, 0, 0, 0.4);
          transform: translateY(-5px) scale(1.04);
        }

        /* ─── Emoji ───────────────────────────────────────────────── */
        .cuisine-chip-emoji {
          font-size: 2.5rem;
          line-height: 1;
          transition: transform 0.3s ease;
          display: block;
        }

        .cuisine-chip:hover .cuisine-chip-emoji {
          transform: scale(1.2) rotate(-6deg);
        }

        /* ─── Label ───────────────────────────────────────────────── */
        .cuisine-chip-name {
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          color: var(--text-secondary);
          transition: color 0.2s;
          text-align: center;
          white-space: nowrap;
        }

        .cuisine-chip:hover .cuisine-chip-name {
          color: var(--text-primary);
        }

        /* ─── Fade edge hints on mobile ───────────────────────────── */
        .cuisine-carousel-track::before,
        .cuisine-carousel-track::after {
          content: '';
          flex: 0 0 var(--space-2);
        }

        @media (max-width: 640px) {
          .cuisine-chip {
            width: 100px;
            padding: var(--space-4) var(--space-2);
          }

          .cuisine-chip-emoji {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
}
