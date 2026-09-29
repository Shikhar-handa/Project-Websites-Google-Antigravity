"use client";
// src/components/RestaurantsControls.tsx
// Client-side search input and sort selector for /restaurants.
// On submit, updates URL search params so the Server Component re-fetches.

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

type Sort = "rating" | "delivery";

export function RestaurantsControls({
  initialQ,
  initialSort,
}: {
  initialQ?: string;
  initialSort?: Sort;
}) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function buildUrl(overrides: Partial<{ q: string; sort: Sort; cuisine: string }>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else    params.delete(k);
    });
    return `/restaurants?${params.toString()}`;
  }

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const q = inputRef.current?.value.trim() || "";
      startTransition(() => {
        router.push(buildUrl({ q: q || undefined }));
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  const handleSort = useCallback(
    (sort: Sort) => {
      startTransition(() => {
        router.push(buildUrl({ sort }));
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  const handleVegToggle = useCallback(() => {
    const current = searchParams.get("veg") === "1";
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (current) params.delete("veg");
      else         params.set("veg", "1");
      router.push(`/restaurants?${params.toString()}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const vegActive  = searchParams.get("veg") === "1";
  const sortActive = (searchParams.get("sort") as Sort | null) ?? "rating";

  return (
    <>
      <div className="rpc-root" aria-label="Restaurant search and filter controls">
        {/* Search bar */}
        <form
          className="rpc-search"
          onSubmit={handleSearch}
          role="search"
          aria-label="Search restaurants"
        >
          <Search size={16} className="rpc-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            name="q"
            id="restaurant-search"
            className="rpc-search-input"
            placeholder="Search restaurants, cuisines…"
            defaultValue={initialQ ?? ""}
            aria-label="Search restaurants"
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm rpc-search-btn"
            id="restaurant-search-submit"
            disabled={pending}
          >
            {pending ? "…" : "Search"}
          </button>
        </form>

        {/* Sort + filter row */}
        <div className="rpc-filters-row" role="group" aria-label="Sort and filter options">
          {/* Sort label */}
          <span className="rpc-label">
            <SlidersHorizontal size={14} aria-hidden="true" /> Sort:
          </span>

          {/* Sort by rating */}
          <button
            type="button"
            id="sort-rating"
            className={`rpc-sort-btn${sortActive === "rating" ? " rpc-sort-btn--active" : ""}`}
            onClick={() => handleSort("rating")}
            aria-pressed={sortActive === "rating"}
          >
            ⭐ Top Rated
          </button>

          {/* Sort by delivery */}
          <button
            type="button"
            id="sort-delivery"
            className={`rpc-sort-btn${sortActive === "delivery" ? " rpc-sort-btn--active" : ""}`}
            onClick={() => handleSort("delivery")}
            aria-pressed={sortActive === "delivery"}
          >
            🕐 Fastest
          </button>

          {/* Veg toggle */}
          <button
            type="button"
            id="veg-toggle"
            className={`rpc-sort-btn rpc-veg-btn${vegActive ? " rpc-sort-btn--active rpc-veg-btn--active" : ""}`}
            onClick={handleVegToggle}
            aria-pressed={vegActive}
          >
            <span className="veg-dot" style={{ flexShrink: 0 }} aria-hidden="true" />
            Veg Only
          </button>
        </div>
      </div>

      <style>{`
        /* ─── Controls wrapper ───────────────────────────────────── */
        .rpc-root {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        /* ─── Search bar ─────────────────────────────────────────── */
        .rpc-search {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          padding: 0 var(--space-4);
          transition: var(--transition-fast);
        }

        .rpc-search:focus-within {
          border-color: var(--border-brand);
          box-shadow: 0 0 0 3px rgba(255,107,53,0.10);
        }

        .rpc-search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .rpc-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          color: var(--text-primary);
          padding: 0.7rem 0;
        }

        .rpc-search-input::placeholder {
          color: var(--text-muted);
        }

        /* clear button injected by browser */
        .rpc-search-input::-webkit-search-cancel-button {
          filter: invert(0.5);
          cursor: pointer;
        }

        .rpc-search-btn {
          flex-shrink: 0;
        }

        /* ─── Sort / filter row ──────────────────────────────────── */
        .rpc-filters-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .rpc-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: var(--text-xs);
          font-weight: var(--fw-medium);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-right: var(--space-1);
        }

        .rpc-sort-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: 0.35rem 0.875rem;
          font-size: var(--text-sm);
          font-weight: var(--fw-medium);
          color: var(--text-secondary);
          background: var(--glass-bg);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition-base);
          white-space: nowrap;
        }

        .rpc-sort-btn:hover {
          background: var(--glass-bg-strong);
          border-color: var(--border-default);
          color: var(--text-primary);
        }

        .rpc-sort-btn--active {
          background: rgba(255,107,53,0.12);
          border-color: rgba(255,107,53,0.35);
          color: var(--accent-orange-light);
          font-weight: var(--fw-semibold);
        }

        .rpc-veg-btn--active {
          background: rgba(34,197,94,0.10);
          border-color: rgba(34,197,94,0.30);
          color: var(--accent-green-light);
        }

        @media (max-width: 640px) {
          .rpc-search { flex-wrap: wrap; }
          .rpc-filters-row { gap: var(--space-2); }
        }
      `}</style>
    </>
  );
}
