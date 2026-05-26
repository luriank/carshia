"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { setTheme as persistTheme } from "@/lib/actions/theme";

export function ThemeToggle() {
  // next-themes resolves "system" → "light" | "dark" for us, then keeps
  // its own localStorage("theme") source of truth. We mirror to a cookie
  // so SSR can pre-render the right palette; the pre-paint script in
  // <head> reads the cookie before next-themes hydrates so there's no
  // light→dark flash.
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  function toggle() {
    const next = isDark ? "light" : "dark";
    setTheme(next); // updates localStorage + applies class
    void persistTheme(next); // mirrors to cookie for SSR
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggle}
      className="size-11 rounded-full transition-colors hover:bg-muted"
    >
      {/* Render-via-CSS so SSR markup matches the pre-paint script's
          .dark class — no mount-gate flash. The Sun glyph is the
          one documented duotone-signature inversion (gold-led with a
          navy accent) so day/night still reads in colour, not just
          shape — see CONTEXT.md / ADR 0005. */}
      <Sun
        className="hidden size-[1.3rem] text-gold duotone-inverted dark:block"
        weight="duotone"
      />
      <Moon
        className="size-[1.3rem] text-primary dark:hidden"
        weight="duotone"
      />
    </Button>
  );
}
