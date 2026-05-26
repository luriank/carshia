"use client";

import { ShoppingCart } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import {
  openCartDrawer,
  useIsAuthenticated,
} from "@/components/cart/cart-context";
import { useGuestCart, useHydrated } from "@/lib/guest-store";

/**
 * Amazon-style cart trigger for the header: a stacked layout with the live
 * count overlaid on the cart icon and the "Cart" label next to it. Tapping
 * dispatches `CART_OPEN_EVENT`, which `CartSheet` listens for to slide
 * itself open — so we don't have to bring the heavy drawer into the header
 * shell.
 */
export function CartNavButton({
  serverCount,
  initialGuestCount,
}: {
  serverCount: number;
  initialGuestCount: number;
}) {
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();
  const hydrated = useHydrated();
  const guestLines = useGuestCart((s) => s.lines);
  const guestCount = guestLines.reduce((s, l) => s + l.quantity, 0);
  const count = isAuthenticated
    ? serverCount
    : hydrated
      ? guestCount
      : initialGuestCount;

  return (
    <button
      type="button"
      onClick={openCartDrawer}
      aria-label={t("nav.cartA11y", { count })}
      className="group flex h-10 shrink-0 items-center gap-1.5 rounded-md px-2 text-foreground ring-1 ring-transparent transition-colors hover:bg-primary/5 hover:ring-primary/10"
    >
      <span className="relative">
        <ShoppingCart
          weight="duotone"
          aria-hidden
          className="size-6 text-primary transition-colors group-hover:text-gold"
        />
        <span
          aria-hidden
          className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold leading-none text-gold-foreground shadow-sm ring-2 ring-card"
        >
          {count > 99 ? "99+" : count}
        </span>
      </span>
      <span className="hidden text-[13px] font-semibold leading-tight sm:inline">
        {t("nav.cartTitle")}
      </span>
    </button>
  );
}
