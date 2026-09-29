"use client";
// src/app/cart/page.tsx
// CraveBite – Cart Page (Client Component)
// Reads global CartContext: shows items, qty controls, order summary, checkout CTA.

import Link from "next/link";
import { useCart, type CartItem } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trash2, ShoppingCart, ArrowRight, ChevronLeft } from "lucide-react";

// ─── Delivery / platform fee constants ───────────────────────────────────────
const DELIVERY_FEE  = 0;      // free delivery (matches restaurant detail page)
const PLATFORM_FEE  = 10;     // small platform convenience fee

// ─── Single cart item row ─────────────────────────────────────────────────────
function CartItemRow({ item }: { item: CartItem }) {
  const { increment, decrement, removeItem } = useCart();

  return (
    <div className="ci-row" id={`cart-item-${item.itemId}`} role="listitem">
      {/* Veg / non-veg dot */}
      <span
        className={item.isVeg ? "veg-dot ci-dot" : "nonveg-dot ci-dot"}
        aria-label={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
        title={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
      />

      {/* Name + price per unit */}
      <div className="ci-info">
        <p className="ci-name">{item.name}</p>
        <p className="ci-unit-price">₹{item.price.toFixed(0)} each</p>
      </div>

      {/* Qty stepper */}
      <div className="ci-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
        <button
          type="button"
          className="ci-stepper-btn"
          onClick={() => decrement(item.itemId)}
          aria-label={`Remove one ${item.name}`}
          id={`cart-decrement-${item.itemId}`}
        >
          −
        </button>
        <span className="ci-stepper-count" aria-live="polite">{item.qty}</span>
        <button
          type="button"
          className="ci-stepper-btn ci-stepper-btn--add"
          onClick={() => increment(item.itemId)}
          aria-label={`Add one more ${item.name}`}
          id={`cart-increment-${item.itemId}`}
        >
          +
        </button>
      </div>

      {/* Line total */}
      <p className="ci-line-total" aria-label={`Total for ${item.name}`}>
        ₹{(item.price * item.qty).toFixed(0)}
      </p>

      {/* Remove button */}
      <button
        type="button"
        className="ci-remove-btn"
        onClick={() => removeItem(item.itemId)}
        aria-label={`Remove ${item.name} from cart`}
        id={`cart-remove-${item.itemId}`}
        title="Remove item"
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Empty cart state ─────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="ec-wrap">
      <div className="ec-icon-wrap" aria-hidden="true">
        <ShoppingCart size={56} className="ec-icon" />
      </div>
      <h2 className="ec-title">Your cart is empty</h2>
      <p className="ec-desc">
        Browse our restaurants and add something delicious to get started.
      </p>
      <Link
        href="/restaurants"
        id="ec-browse-btn"
        className="btn btn-primary btn-lg"
      >
        Browse Restaurants
      </Link>
    </div>
  );
}

// ─── Order summary card ───────────────────────────────────────────────────────
function OrderSummary() {
  const { subtotal, totalItems, state, clearCart } = useCart();
  const grandTotal = subtotal + PLATFORM_FEE;

  return (
    <aside className="os-card glass-card" aria-label="Order summary">
      <h2 className="os-title">Order Summary</h2>

      {/* Restaurant info */}
      {state.restaurantName && (
        <div className="os-restaurant">
          <p className="os-restaurant-label">Ordering from</p>
          <Link
            href={`/restaurants/${state.restaurantSlug}`}
            className="os-restaurant-name"
          >
            {state.restaurantName} →
          </Link>
        </div>
      )}

      <div className="os-divider" />

      {/* Line items */}
      <dl className="os-lines">
        <div className="os-line">
          <dt>Items ({totalItems})</dt>
          <dd>₹{subtotal.toFixed(0)}</dd>
        </div>
        <div className="os-line">
          <dt>Delivery fee</dt>
          <dd className="os-free">
            {DELIVERY_FEE === 0 ? "FREE" : `₹${DELIVERY_FEE}`}
          </dd>
        </div>
        <div className="os-line">
          <dt>Platform fee</dt>
          <dd>₹{PLATFORM_FEE}</dd>
        </div>
      </dl>

      <div className="os-divider" />

      {/* Grand total */}
      <div className="os-total">
        <span>Grand Total</span>
        <span className="os-total-amount">₹{grandTotal.toFixed(0)}</span>
      </div>

      {/* Savings callout */}
      {DELIVERY_FEE === 0 && (
        <p className="os-savings">
          🎉 You saved ₹40 on free delivery!
        </p>
      )}

      {/* Checkout CTA */}
      <Link
        href="/checkout"
        id="checkout-btn"
        className="btn btn-primary btn-lg os-checkout-btn animate-glow"
        aria-label="Proceed to checkout"
      >
        Continue to Checkout
        <ArrowRight size={18} aria-hidden="true" />
      </Link>

      {/* Clear cart */}
      <button
        type="button"
        id="clear-cart-btn"
        className="btn btn-ghost btn-sm os-clear-btn"
        onClick={clearCart}
        aria-label="Clear all items from cart"
      >
        <Trash2 size={13} aria-hidden="true" />
        Clear Cart
      </button>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { state, totalItems } = useCart();
  const isEmpty = totalItems === 0;

  return (
    <>
      <Navbar />
      <main id="main-content" className="cart-main">

        {/* ── Hero banner ── */}
        <div className="cart-hero">
          <div className="cart-hero-blob cart-hero-blob--1" aria-hidden="true" />
          <div className="cart-hero-blob cart-hero-blob--2" aria-hidden="true" />
          <div className="container cart-hero-inner">
            <Link href="/restaurants" className="cart-back-link" id="cart-back-btn">
              <ChevronLeft size={16} aria-hidden="true" />
              Back to Restaurants
            </Link>
            <h1 className="cart-hero-heading">
              {isEmpty
                ? "Your Cart"
                : <>
                    Your <span className="text-gradient">Cart</span>
                    <span className="cart-count-badge" aria-label={`${totalItems} items`}>
                      {totalItems}
                    </span>
                  </>
              }
            </h1>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="container cart-body">
          {isEmpty ? (
            <EmptyCart />
          ) : (
            <div className="cart-layout">

              {/* ── Item list ── */}
              <section aria-label="Cart items" className="cart-items-section">
                {/* Restaurant header */}
                <div className="cart-section-header">
                  <span className="cart-section-icon" aria-hidden="true">🛒</span>
                  <div>
                    <p className="cart-section-label">Items from</p>
                    <p className="cart-section-restaurant">{state.restaurantName}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="ci-list" role="list" aria-label="Cart items">
                  {state.items.map((item) => (
                    <CartItemRow key={item.itemId} item={item} />
                  ))}
                </div>

                {/* Add more CTA */}
                <div className="cart-add-more">
                  <Link
                    href={`/restaurants/${state.restaurantSlug}`}
                    id="add-more-items-btn"
                    className="btn btn-secondary btn-sm"
                  >
                    + Add more items
                  </Link>
                  <p className="cart-add-more-hint">
                    Items from other restaurants will replace your current cart.
                  </p>
                </div>
              </section>

              {/* ── Order summary ── */}
              <OrderSummary />
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* ── Scoped styles ── */}
      <style>{`
        /* ─── Page shell ─────────────────────────────────────────── */
        .cart-main {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* ─── Hero ───────────────────────────────────────────────── */
        .cart-hero {
          position: relative;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          overflow: hidden;
          padding: var(--space-10) 0 var(--space-8);
        }

        .cart-hero-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .cart-hero-blob--1 {
          top: -50%;
          left: -5%;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 65%);
        }

        .cart-hero-blob--2 {
          bottom: -60%;
          right: -5%;
          width: 440px;
          height: 440px;
          background: radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 65%);
        }

        .cart-hero-inner {
          position: relative;
          z-index: 1;
        }

        .cart-back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          text-decoration: none;
          margin-bottom: var(--space-4);
          transition: var(--transition-fast);
        }

        .cart-back-link:hover {
          color: var(--accent-orange);
        }

        .cart-hero-heading {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: var(--fw-black);
          color: var(--text-primary);
          line-height: var(--lh-tight);
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .cart-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 var(--space-2);
          background: var(--brand-gradient);
          color: #fff;
          font-size: var(--text-sm);
          font-weight: var(--fw-bold);
          border-radius: var(--radius-full);
          line-height: 1;
          box-shadow: var(--shadow-brand);
          font-family: var(--font-sans);
          letter-spacing: 0;
        }

        /* ─── Body layout ────────────────────────────────────────── */
        .cart-body {
          padding-top: var(--space-10);
          padding-bottom: var(--space-20);
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: var(--space-8);
          align-items: start;
        }

        /* ─── Items section ──────────────────────────────────────── */
        .cart-items-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .cart-section-header {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
        }

        .cart-section-icon {
          font-size: 2rem;
          line-height: 1;
        }

        .cart-section-label {
          font-size: var(--text-xs);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }

        .cart-section-restaurant {
          font-size: var(--text-base);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
          font-family: var(--font-display);
        }

        /* ─── Item list ──────────────────────────────────────────── */
        .ci-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        /* ─── Single item row ────────────────────────────────────── */
        .ci-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          transition: var(--transition-smooth);
        }

        .ci-row:hover {
          border-color: var(--border-default);
          background: var(--bg-card-hover);
        }

        .ci-dot {
          /* veg-dot / nonveg-dot from globals — just ensure flex-shrink */
          flex-shrink: 0;
          margin-top: 1px;
        }

        .ci-info {
          flex: 1;
          min-width: 0;
        }

        .ci-name {
          font-size: var(--text-base);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
          line-height: var(--lh-snug);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ci-unit-price {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* ─── Qty stepper (inline in the row) ───────────────────── */
        .ci-stepper {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-brand);
          border-radius: var(--radius-lg);
          overflow: hidden;
          height: 32px;
          flex-shrink: 0;
        }

        .ci-stepper-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--accent-orange);
          font-size: 1.1rem;
          font-weight: var(--fw-bold);
          cursor: pointer;
          transition: var(--transition-fast);
          line-height: 1;
          flex-shrink: 0;
        }

        .ci-stepper-btn:hover {
          background: rgba(255,107,53,0.12);
        }

        .ci-stepper-count {
          min-width: 28px;
          text-align: center;
          font-size: var(--text-sm);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
          border-left: 1px solid var(--border-brand);
          border-right: 1px solid var(--border-brand);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        /* ─── Line total ─────────────────────────────────────────── */
        .ci-line-total {
          font-family: var(--font-display);
          font-size: var(--text-base);
          font-weight: var(--fw-bold);
          color: var(--accent-orange);
          flex-shrink: 0;
          min-width: 52px;
          text-align: right;
        }

        /* ─── Remove button ──────────────────────────────────────── */
        .ci-remove-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-fast);
          flex-shrink: 0;
        }

        .ci-remove-btn:hover {
          background: rgba(239,68,68,0.10);
          border-color: rgba(239,68,68,0.25);
          color: var(--accent-red-light);
        }

        /* ─── Add more row ───────────────────────────────────────── */
        .cart-add-more {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        .cart-add-more-hint {
          font-size: var(--text-xs);
          color: var(--text-muted);
          line-height: var(--lh-relaxed);
          max-width: 280px;
        }

        /* ─── Order Summary card ─────────────────────────────────── */
        .os-card {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          position: sticky;
          top: 88px; /* below navbar */
        }

        .os-title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
        }

        .os-restaurant {
          background: rgba(255,107,53,0.07);
          border: 1px solid rgba(255,107,53,0.18);
          border-radius: var(--radius-lg);
          padding: var(--space-3) var(--space-4);
        }

        .os-restaurant-label {
          font-size: var(--text-xs);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }

        .os-restaurant-name {
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          color: var(--accent-orange-light);
          text-decoration: none;
          transition: var(--transition-fast);
        }

        .os-restaurant-name:hover {
          color: var(--accent-orange);
        }

        .os-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: var(--space-1) 0;
        }

        .os-lines {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .os-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .os-line dt {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .os-line dd {
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
        }

        .os-free {
          color: var(--accent-green-light) !important;
          font-weight: var(--fw-bold) !important;
        }

        .os-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .os-total span:first-child {
          font-size: var(--text-base);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
        }

        .os-total-amount {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          font-weight: var(--fw-black);
          color: var(--accent-orange);
        }

        .os-savings {
          font-size: var(--text-xs);
          color: var(--accent-green-light);
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.18);
          border-radius: var(--radius-lg);
          padding: var(--space-2) var(--space-3);
          text-align: center;
        }

        .os-checkout-btn {
          width: 100%;
          justify-content: center;
          font-size: var(--text-base) !important;
          padding: 0.875rem 1.5rem !important;
          border-radius: var(--radius-xl) !important;
        }

        .os-clear-btn {
          width: 100%;
          justify-content: center;
          color: var(--text-muted);
          gap: var(--space-1);
          margin-top: calc(-1 * var(--space-2));
        }

        .os-clear-btn:hover {
          color: var(--accent-red-light);
          background: rgba(239,68,68,0.06);
        }

        /* ─── Empty cart ─────────────────────────────────────────── */
        .ec-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-5);
          padding: var(--space-20) 0;
          text-align: center;
        }

        .ec-icon-wrap {
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-2xl);
        }

        .ec-icon {
          color: var(--text-muted);
        }

        .ec-title {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
        }

        .ec-desc {
          font-size: var(--text-base);
          color: var(--text-secondary);
          max-width: 360px;
          line-height: var(--lh-relaxed);
        }

        /* ─── Responsive ─────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .cart-layout {
            grid-template-columns: 1fr 320px;
          }
        }

        @media (max-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }

          .os-card {
            position: static;
          }

          .ci-row {
            flex-wrap: wrap;
            gap: var(--space-2);
          }
        }

        @media (max-width: 480px) {
          .ci-name {
            white-space: normal;
          }
        }
      `}</style>
    </>
  );
}
