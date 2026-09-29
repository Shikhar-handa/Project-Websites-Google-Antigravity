"use client";
// src/context/CartContext.tsx
// Global cart state via React Context + localStorage persistence.
//
// CRITICAL RULE: A user can only add items from ONE restaurant at a time.
// Adding an item from a different restaurant clears the cart first.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CartItem = {
  /** MenuItem.id from Prisma */
  itemId: string;
  name: string;
  price: number;
  isVeg: boolean;
  qty: number;
  /** Restaurant this item belongs to */
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
};

export type CartState = {
  items: CartItem[];
  /** Which restaurant the cart currently belongs to (null = empty) */
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantSlug: string | null;
};

export type CartAction =
  | { type: "ADD_ITEM";    payload: Omit<CartItem, "qty"> }
  | { type: "REMOVE_ITEM"; payload: { itemId: string } }
  | { type: "INCREMENT";   payload: { itemId: string } }
  | { type: "DECREMENT";   payload: { itemId: string } }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE";     payload: CartState };

// ─── Reducer ──────────────────────────────────────────────────────────────────

const initialState: CartState = {
  items: [],
  restaurantId: null,
  restaurantName: null,
  restaurantSlug: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case "ADD_ITEM": {
      const incoming = action.payload;

      // ── Cross-restaurant guard ───────────────────────────────────────────
      // If the incoming item is from a different restaurant, wipe the cart.
      const baseState: CartState =
        state.restaurantId && state.restaurantId !== incoming.restaurantId
          ? { items: [], restaurantId: null, restaurantName: null, restaurantSlug: null }
          : state;

      const existing = baseState.items.find((i) => i.itemId === incoming.itemId);
      if (existing) {
        // Already in cart → just bump qty
        return {
          ...baseState,
          items: baseState.items.map((i) =>
            i.itemId === incoming.itemId ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      // New item
      return {
        ...baseState,
        restaurantId:   incoming.restaurantId,
        restaurantName: incoming.restaurantName,
        restaurantSlug: incoming.restaurantSlug,
        items: [...baseState.items, { ...incoming, qty: 1 }],
      };
    }

    case "REMOVE_ITEM": {
      const items = state.items.filter((i) => i.itemId !== action.payload.itemId);
      return {
        ...state,
        items,
        ...(items.length === 0
          ? { restaurantId: null, restaurantName: null, restaurantSlug: null }
          : {}),
      };
    }

    case "INCREMENT":
      return {
        ...state,
        items: state.items.map((i) =>
          i.itemId === action.payload.itemId ? { ...i, qty: i.qty + 1 } : i
        ),
      };

    case "DECREMENT": {
      const items = state.items
        .map((i) =>
          i.itemId === action.payload.itemId ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0);
      return {
        ...state,
        items,
        ...(items.length === 0
          ? { restaurantId: null, restaurantName: null, restaurantSlug: null }
          : {}),
      };
    }

    case "CLEAR_CART":
      return initialState;

    case "HYDRATE":
      return action.payload;

    default:
      return state;
  }
}

// ─── Derived selectors ────────────────────────────────────────────────────────

export function selectTotalItems(state: CartState) {
  return state.items.reduce((sum, i) => sum + i.qty, 0);
}

export function selectSubtotal(state: CartState) {
  return state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function selectItemQty(state: CartState, itemId: string) {
  return state.items.find((i) => i.itemId === itemId)?.qty ?? 0;
}

// ─── Context ──────────────────────────────────────────────────────────────────

type CartContextValue = {
  state: CartState;
  addItem:     (item: Omit<CartItem, "qty">) => void;
  removeItem:  (itemId: string) => void;
  increment:   (itemId: string) => void;
  decrement:   (itemId: string) => void;
  clearCart:   () => void;
  totalItems:  number;
  subtotal:    number;
  getQty:      (itemId: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

// ─── Storage key ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "cravebite_cart_v2";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: CartState = JSON.parse(raw);
        dispatch({ type: "HYDRATE", payload: saved });
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Also write the legacy key so Navbar's old hook still works during transition
      localStorage.setItem(
        "cravebite_cart",
        JSON.stringify(state.items.map((i) => ({ qty: i.qty })))
      );
      // Trigger storage event so other tabs / the old hook pick up changes
      window.dispatchEvent(new Event("storage"));
    } catch {
      /* ignore */
    }
  }, [state]);

  const addItem    = useCallback((item: Omit<CartItem, "qty">) => dispatch({ type: "ADD_ITEM",    payload: item }),    []);
  const removeItem = useCallback((itemId: string)              => dispatch({ type: "REMOVE_ITEM", payload: { itemId } }), []);
  const increment  = useCallback((itemId: string)              => dispatch({ type: "INCREMENT",   payload: { itemId } }), []);
  const decrement  = useCallback((itemId: string)              => dispatch({ type: "DECREMENT",   payload: { itemId } }), []);
  const clearCart  = useCallback(()                            => dispatch({ type: "CLEAR_CART" }), []);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        increment,
        decrement,
        clearCart,
        totalItems: selectTotalItems(state),
        subtotal:   selectSubtotal(state),
        getQty:     (id) => selectItemQty(state, id),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
