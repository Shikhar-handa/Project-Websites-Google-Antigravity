"use client";
// src/components/AddToCartButton.tsx
// Interactive quantity stepper / add-to-cart button for menu items.
// This is a Client Component — it bridges the server-rendered detail page
// to the global CartContext.

import { useCart } from "@/context/CartContext";

export type AddToCartItem = {
  itemId: string;
  name: string;
  price: number;
  isVeg: boolean;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
};

export function AddToCartButton({ item }: { item: AddToCartItem }) {
  const { addItem, increment, decrement, getQty, state } = useCart();

  const qty = getQty(item.itemId);

  // Detect if this item's restaurant differs from what's currently in the cart
  const cartHasOtherRestaurant =
    state.restaurantId !== null && state.restaurantId !== item.restaurantId;

  function handleAdd() {
    addItem(item);
  }

  return (
    <>
      <div className="atc-wrap">
        {qty === 0 ? (
          <button
            type="button"
            className="btn btn-primary btn-sm atc-add-btn"
            id={`add-to-cart-${item.itemId}`}
            onClick={handleAdd}
            aria-label={`Add ${item.name} to cart`}
            title={
              cartHasOtherRestaurant
                ? `Adding this item will clear your current cart from ${state.restaurantName}`
                : undefined
            }
          >
            {cartHasOtherRestaurant ? "⚠ Switch & Add" : "+ Add"}
          </button>
        ) : (
          <div className="atc-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
            <button
              type="button"
              className="atc-stepper-btn"
              onClick={() => decrement(item.itemId)}
              aria-label={`Remove one ${item.name}`}
              id={`decrement-${item.itemId}`}
            >
              −
            </button>
            <span className="atc-stepper-count" aria-live="polite">{qty}</span>
            <button
              type="button"
              className="atc-stepper-btn atc-stepper-btn--add"
              onClick={() => increment(item.itemId)}
              aria-label={`Add one more ${item.name}`}
              id={`increment-${item.itemId}`}
            >
              +
            </button>
          </div>
        )}
      </div>

      <style>{`
        .atc-wrap {
          flex-shrink: 0;
        }

        /* Add button overrides */
        .atc-add-btn {
          white-space: nowrap;
        }

        /* Qty stepper */
        .atc-stepper {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--border-brand);
          border-radius: var(--radius-lg);
          overflow: hidden;
          height: 32px;
        }

        .atc-stepper-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--accent-orange);
          font-size: var(--text-lg);
          font-weight: var(--fw-bold);
          cursor: pointer;
          transition: var(--transition-fast);
          line-height: 1;
        }

        .atc-stepper-btn:hover {
          background: rgba(255,107,53,0.12);
        }

        .atc-stepper-btn--add {
          color: var(--accent-orange);
        }

        .atc-stepper-count {
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
          padding: 0 var(--space-1);
        }
      `}</style>
    </>
  );
}
