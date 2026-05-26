import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/wordmark";
import { SearchBar } from "@/components/layout/search-bar";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { AccountMenu } from "@/components/layout/account-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartNavButton } from "@/components/layout/cart-nav-button";
import { CategoryNav } from "@/components/layout/category-nav";
import { DeliverTo } from "@/components/layout/deliver-to";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  isAdmin?: boolean;
} | null;

export async function SiteHeader({
  user,
  cartCount,
  wishlistCount,
  initialGuestCartCount,
  initialGuestWishlistCount,
  isAuthenticated,
}: {
  user: SessionUser;
  cartCount: number;
  wishlistCount: number;
  initialGuestCartCount: number;
  initialGuestWishlistCount: number;
  isAuthenticated: boolean;
}) {
  const t = await getTranslations();
  // wishlistCount/initialGuestWishlistCount are surfaced in the sub-nav row
  // via a plain Link, so the heavy WishlistNavButton client component is no
  // longer wired here — kept in the prop signature for layout compatibility.
  void wishlistCount;
  void initialGuestWishlistCount;

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-card pt-[env(safe-area-inset-top)] text-foreground shadow-[0_1px_0_rgb(0_0_0/0.03)]"
      data-amazon-header
    >
      {/* Top row */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <MobileNav user={user} />

        <Wordmark className="shrink-0 text-base sm:text-[1.15rem]" />

        <DeliverTo user={user} />

        <div className="mx-auto hidden w-full max-w-xl flex-1 md:block">
          <Suspense fallback={null}>
            <SearchBar variant="header" enableHotkey />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <LocaleSwitcher className="hidden md:inline-flex" />

          <div className="hidden md:block">
            <AccountMenu user={user} variant="stacked" />
          </div>

          {user ? (
            <Link
              href="/orders"
              className="hidden h-10 shrink-0 items-center rounded-md px-2 ring-1 ring-transparent transition-colors hover:bg-primary/5 hover:ring-primary/10 lg:inline-flex"
            >
              <span className="flex flex-col leading-tight">
                <span className="text-[11px] font-normal text-muted-foreground">
                  {t("nav.returnsLine1")}
                </span>
                <span className="text-[13px] font-semibold">
                  {t("nav.returnsLine2")}
                </span>
              </span>
            </Link>
          ) : null}

          <CartNavButton
            serverCount={cartCount}
            initialGuestCount={initialGuestCartCount}
          />
        </div>
      </div>

      {/* Mobile in-row search (md:hidden) */}
      <div className="border-t border-border/60 px-3 pb-2 pt-2 md:hidden">
        <Suspense fallback={null}>
          <SearchBar variant="header" />
        </Suspense>
      </div>

      <CategoryNav user={user} />
    </header>
  );
}
