import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// /cart, /wishlist and /checkout are intentionally NOT protected: guests can
// build a cart/wishlist and review checkout. Auth is enforced where it
// actually matters — the checkout page renders a sign-in gate and
// `placeOrder` still requires a user.
const PROTECTED: RegExp[] = [
  /^\/orders(\/|$)/,
  /^\/order\//,
  /^\/profile(\/|$)/,
  /^\/admin(\/|$)/,
];

export default auth((req) => {
  const { pathname, search, origin } = req.nextUrl;
  const isProtected = PROTECTED.some((re) => re.test(pathname));
  if (!isProtected) return;

  if (!req.auth) {
    const loginPath = pathname.startsWith("/admin") ? "/admin-login" : "/login";
    const url = new URL(loginPath, origin);
    url.searchParams.set("callbackUrl", pathname + search);
    return Response.redirect(url);
  }

  if (pathname.startsWith("/admin") && !req.auth.user?.isAdmin) {
    return Response.redirect(new URL("/", origin));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
