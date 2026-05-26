import { THEME_COOKIE } from "@/lib/theme";

// Runs synchronously before paint. We resolve the theme using the SAME
// priority order next-themes uses on hydration — localStorage first,
// then the THEME cookie (mirrored by our server action for SSR), then
// the OS preference — so the pre-paint class always matches what
// next-themes will land on. Without that ordering, a divergent
// localStorage value would cause a brief light↔dark flash when
// next-themes hydrates and removes/re-adds the .dark class.
//
// THEME_COOKIE is a constant string defined in lib/theme.ts; if it ever
// becomes user-controlled, the interpolation below needs sanitizing.
const SCRIPT = `(() => {
  try {
    var stored = null;
    try { stored = window.localStorage.getItem("theme"); } catch (_) {}
    if (stored !== "light" && stored !== "dark" && stored !== "system") {
      var m = document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);
      stored = m ? decodeURIComponent(m[1]) : null;
    }
    var resolved =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    var root = document.documentElement;
    if (resolved === "dark") root.classList.add("dark");
    root.style.colorScheme = resolved;
  } catch (_) {}
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
