// Cookie-name constants — safe to import from both client and server.
// The matching server-only `getGuestCounts()` lives in
// `lib/guest-cookies-server.ts` so we don't pull `next/headers` into
// the client bundle.
export const GUEST_CART_COUNT_COOKIE = "ag:gc";
export const GUEST_WISHLIST_COUNT_COOKIE = "ag:gw";
