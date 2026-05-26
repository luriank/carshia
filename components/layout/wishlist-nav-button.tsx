"use client";

import Link from "next/link";
import { Heart } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { useIsAuthenticated } from "@/components/cart/cart-context";
import { useGuestWishlist, useHydrated } from "@/lib/guest-store";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WishlistNavButton({
  serverCount,
  initialGuestCount,
}: {
  serverCount: number;
  initialGuestCount: number;
}) {
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();
  const hydrated = useHydrated();
  const guestCount = useGuestWishlist((s) => s.ids.length);
  // Pre-hydration we read the SSR-rendered guest cookie count so the
  // badge does not flicker 0→N once the persisted store hydrates.
  const count = isAuthenticated
    ? serverCount
    : hydrated
      ? guestCount
      : initialGuestCount;

  const active = count > 0;
  return (
    <Link
      href="/wishlist"
      aria-label={t("nav.wishlistA11y", { count })}
      title={t("nav.wishlist")}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative size-11 rounded-full text-primary transition-colors hover:bg-primary/10",
      )}
    >
      {/* Active heart shows the duotone signature (navy + gold accent);
          inactive heart drops to the outline. */}
      <Heart
        className="size-[1.3rem]"
        weight={active ? "duotone" : "regular"}
      />
      {active ? (
        <Badge variant="actionMark" className="absolute -right-0.5 -top-0.5">
          {count > 99 ? "99+" : count}
        </Badge>
      ) : null}
    </Link>
  );
}
