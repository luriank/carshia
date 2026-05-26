"use client";

import { CartSheet } from "@/components/cart/cart-sheet";

/**
 * Mounts the cart drawer at the layout level so the new Amazon-style header
 * can open it via `CART_OPEN_EVENT` without rendering a duplicate trigger
 * button. Visually hides only the trigger (it stays in the DOM so Base UI's
 * Sheet can still anchor + slide open), not the drawer itself.
 */
export function CartSheetMount({
  cartCount,
  initialGuestCartCount,
  isAuthenticated,
}: {
  cartCount: number;
  initialGuestCartCount: number;
  isAuthenticated: boolean;
}) {
  return (
    <div
      aria-hidden
      // Trigger stays in the DOM (Base UI's Sheet anchors to it) but is
      // visually 0×0 and unfocusable. The drawer's content portals to <body>
      // when open, so it's unaffected by `overflow-hidden` here.
      className="pointer-events-none fixed -bottom-px -right-px size-0 overflow-hidden opacity-0"
    >
      <CartSheet
        count={cartCount}
        initialGuestCount={initialGuestCartCount}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
