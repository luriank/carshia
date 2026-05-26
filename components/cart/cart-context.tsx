"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  setCartQuantity as setCartQuantityAction,
} from "@/lib/actions/cart";
import {
  removeFromWishlist as removeFromWishlistAction,
  toggleWishlist as toggleWishlistAction,
} from "@/lib/actions/wishlist";
import { useGuestCart, useGuestWishlist, useHydrated } from "@/lib/guest-store";

type CartResult = { ok: true } | { ok: false; error: string };

const AuthContext = createContext(false);

export function CartProvider({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  return (
    <AuthContext.Provider value={isAuthenticated}>
      {children}
    </AuthContext.Provider>
  );
}

export function useIsAuthenticated(): boolean {
  return useContext(AuthContext);
}

/** Custom event the header cart drawer listens for to slide itself open. */
export const CART_OPEN_EVENT = "ag:open-cart";

export function openCartDrawer(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT));
  }
}

/**
 * One cart API for guests and members. Members hit the DB-backed server
 * actions (and refresh so server-rendered totals/badges update); guests
 * mutate the localStorage store, which is reactive so badges update on their
 * own.
 */
export function useCart() {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const guestAdd = useGuestCart((s) => s.add);
  const guestSetQty = useGuestCart((s) => s.setQty);
  const guestRemove = useGuestCart((s) => s.remove);

  const add = useCallback(
    async (productId: string, quantity = 1): Promise<CartResult> => {
      if (!isAuthenticated) {
        guestAdd(productId, quantity);
        return { ok: true };
      }
      const res = await addToCartAction(productId, quantity);
      if (res.ok) router.refresh();
      return res;
    },
    [isAuthenticated, guestAdd, router],
  );

  const setQty = useCallback(
    async (productId: string, quantity: number): Promise<CartResult> => {
      if (!isAuthenticated) {
        guestSetQty(productId, quantity);
        return { ok: true };
      }
      const res = await setCartQuantityAction(productId, quantity);
      if (res.ok) router.refresh();
      return res;
    },
    [isAuthenticated, guestSetQty, router],
  );

  const remove = useCallback(
    async (productId: string): Promise<CartResult> => {
      if (!isAuthenticated) {
        guestRemove(productId);
        return { ok: true };
      }
      const res = await removeFromCartAction(productId);
      if (res.ok) router.refresh();
      return res;
    },
    [isAuthenticated, guestRemove, router],
  );

  return { isAuthenticated, add, setQty, remove };
}

/**
 * Self-contained wishlist heart: owns optimistic state, the toast, and the
 * guest/member branch. Components just render `wished` and call `toggle`.
 */
export function useWishlistItem(
  productId: string,
  initialInWishlist: boolean,
) {
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();
  const hydrated = useHydrated();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(initialInWishlist);
  const guestWished = useGuestWishlist((s) => s.ids.includes(productId));
  const guestToggle = useGuestWishlist((s) => s.toggle);

  const wished = isAuthenticated
    ? optimistic
    : hydrated
      ? guestWished
      : false;

  const toggle = useCallback(() => {
    if (!isAuthenticated) {
      const added = guestToggle(productId);
      if (added) toast.success(t("product.savedToWishlist"));
      else toast.message(t("product.removedFromWishlist"));
      return;
    }
    const next = !optimistic;
    setOptimistic(next);
    startTransition(async () => {
      const res = await toggleWishlistAction(productId);
      if (!res.ok) {
        setOptimistic(!next);
        toast.error(res.error);
      } else {
        if (res.added) toast.success(t("product.savedToWishlist"));
        else toast.message(t("product.removedFromWishlist"));
        router.refresh();
      }
    });
  }, [isAuthenticated, optimistic, productId, guestToggle, router, t]);

  return { wished, pending, toggle };
}

/** Wishlist actions for the full wishlist page (member + guest). */
export function useWishlistActions() {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const guestRemove = useGuestWishlist((s) => s.remove);

  const remove = useCallback(
    async (productId: string): Promise<CartResult> => {
      if (!isAuthenticated) {
        guestRemove(productId);
        return { ok: true };
      }
      const res = await removeFromWishlistAction(productId);
      if (res.ok) router.refresh();
      return res;
    },
    [isAuthenticated, guestRemove, router],
  );

  return { isAuthenticated, remove };
}
