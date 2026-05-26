import "server-only";

import { cookies } from "next/headers";
import {
  GUEST_CART_COUNT_COOKIE,
  GUEST_WISHLIST_COUNT_COOKIE,
} from "@/lib/guest-cookies";

function parseCount(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 9999) : 0;
}

export async function getGuestCounts(): Promise<{
  cart: number;
  wishlist: number;
}> {
  const store = await cookies();
  return {
    cart: parseCount(store.get(GUEST_CART_COUNT_COOKIE)?.value),
    wishlist: parseCount(store.get(GUEST_WISHLIST_COUNT_COOKIE)?.value),
  };
}
