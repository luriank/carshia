import { toast } from "sonner";

/**
 * Shown when a guest triggers an auth-gated mutation (add to cart / wishlist).
 * Replaces the old hard `redirect("/login")` with a non-destructive toast that
 * keeps the user where they are and offers an opt-in sign-in that returns them
 * to the same page.
 */
export function authRequiredToast(
  message: string,
  signInLabel: string,
  callbackUrl: string,
  navigate: (href: string) => void,
) {
  toast(message, {
    action: {
      label: signInLabel,
      onClick: () =>
        navigate(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`),
    },
  });
}
