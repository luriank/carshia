"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Client-side guest cart & wishlist.
 *
 * Guests can build a cart/wishlist without an account; it lives in
 * localStorage. On sign-in `GuestSync` merges it into the DB-backed cart and
 * clears these stores. Authenticated users never touch these — they go
 * straight to the server actions.
 */

export type GuestCartLine = { productId: string; quantity: number };

type GuestCartState = {
  lines: GuestCartLine[];
  add: (productId: string, quantity?: number) => void;
  setQty: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useGuestCart = create<GuestCartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (productId, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.productId === productId);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.productId === productId
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return { lines: [...s.lines, { productId, quantity }] };
        }),
      setQty: (productId, quantity) =>
        set((s) =>
          quantity <= 0
            ? { lines: s.lines.filter((l) => l.productId !== productId) }
            : {
                lines: s.lines.map((l) =>
                  l.productId === productId ? { ...l, quantity } : l,
                ),
              },
        ),
      remove: (productId) =>
        set((s) => ({
          lines: s.lines.filter((l) => l.productId !== productId),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "ag:guest-cart:v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

type GuestWishlistState = {
  ids: string[];
  toggle: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useGuestWishlist = create<GuestWishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const has = get().ids.includes(productId);
        set((s) => ({
          ids: has
            ? s.ids.filter((id) => id !== productId)
            : [...s.ids, productId],
        }));
        return !has;
      },
      remove: (productId) =>
        set((s) => ({ ids: s.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "ag:guest-wishlist:v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function guestCartCount(lines: GuestCartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

/**
 * `true` only after the first client commit. Persisted zustand state is empty
 * during SSR/first paint, so any UI that reflects guest state must wait for
 * this to avoid a hydration mismatch on the cart/wishlist badges.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
