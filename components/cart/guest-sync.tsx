"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { mergeGuestCart } from "@/lib/actions/cart";
import { mergeGuestWishlist } from "@/lib/actions/wishlist";
import { useGuestCart, useGuestWishlist } from "@/lib/guest-store";

/**
 * Runs once after sign-in: folds any guest cart/wishlist built while logged
 * out into the member's account, then clears local storage. Mounted in the
 * shop layout so it covers sign-in from anywhere (login, signup, OTP).
 */
export function GuestSync({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const t = useTranslations();
  const done = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || done.current) return;
    const lines = useGuestCart.getState().lines;
    const ids = useGuestWishlist.getState().ids;
    if (lines.length === 0 && ids.length === 0) {
      done.current = true;
      return;
    }
    done.current = true;
    void (async () => {
      const tasks: Promise<unknown>[] = [];
      if (lines.length) tasks.push(mergeGuestCart(lines));
      if (ids.length) tasks.push(mergeGuestWishlist(ids));
      await Promise.all(tasks);
      useGuestCart.getState().clear();
      useGuestWishlist.getState().clear();
      toast.success(t("cart.merged"));
      router.refresh();
    })();
  }, [isAuthenticated, router, t]);

  return null;
}
