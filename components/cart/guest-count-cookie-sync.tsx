"use client";

import { useEffect } from "react";
import {
  GUEST_CART_COUNT_COOKIE,
  GUEST_WISHLIST_COUNT_COOKIE,
} from "@/lib/guest-cookies";
import {
  guestCartCount,
  useGuestCart,
  useGuestWishlist,
} from "@/lib/guest-store";

function writeCount(name: string, value: number) {
  if (typeof document === "undefined") return;
  // 30-day cookie so the SSR fallback survives page reloads; cleared by
  // GuestSync on sign-in alongside the underlying store.
  const v = encodeURIComponent(String(value));
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${v}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${secure}`;
}

/**
 * Mirrors the guest cart/wishlist counts into cookies so the server
 * layout can render the correct badge count in SSR HTML. Without this,
 * guest badges SSR as 0 and then "pop" to N after client hydration —
 * the most visible flicker in the header on cold load.
 */
function clearCount(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function GuestCountCookieSync({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const cartLines = useGuestCart((s) => s.lines);
  const wishlistIds = useGuestWishlist((s) => s.ids);

  useEffect(() => {
    if (isAuthenticated) {
      // Clear stale guest cookies once the user signs in — the server
      // count is now the source of truth.
      clearCount(GUEST_CART_COUNT_COOKIE);
      clearCount(GUEST_WISHLIST_COUNT_COOKIE);
      return;
    }
    writeCount(GUEST_CART_COUNT_COOKIE, guestCartCount(cartLines));
  }, [cartLines, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    writeCount(GUEST_WISHLIST_COUNT_COOKIE, wishlistIds.length);
  }, [wishlistIds, isAuthenticated]);

  return null;
}
