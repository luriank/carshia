import { getCurrentUser } from "@/lib/session";
import { getCartCount } from "@/lib/actions/cart";
import { getWishlistCount } from "@/lib/actions/wishlist";
import { getGuestCounts } from "@/lib/guest-cookies-server";
import { CartProvider } from "@/components/cart/cart-context";
import { GuestSync } from "@/components/cart/guest-sync";
import { GuestCountCookieSync } from "@/components/cart/guest-count-cookie-sync";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartSheetMount } from "@/components/cart/cart-sheet-mount";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, cartCount, wishlistCount, guestCounts] = await Promise.all([
    getCurrentUser(),
    getCartCount(),
    getWishlistCount(),
    getGuestCounts(),
  ]);
  const isAuthenticated = Boolean(user);

  return (
    <CartProvider isAuthenticated={isAuthenticated}>
      <GuestSync isAuthenticated={isAuthenticated} />
      <GuestCountCookieSync isAuthenticated={isAuthenticated} />
      <div className="flex min-h-dvh flex-col">
        <SiteHeader
          user={user}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          initialGuestCartCount={isAuthenticated ? 0 : guestCounts.cart}
          initialGuestWishlistCount={
            isAuthenticated ? 0 : guestCounts.wishlist
          }
          isAuthenticated={isAuthenticated}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CartSheetMount
          cartCount={cartCount}
          initialGuestCartCount={isAuthenticated ? 0 : guestCounts.cart}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </CartProvider>
  );
}
