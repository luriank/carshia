import { cookies } from "next/headers";

export const THEME_COOKIE = "THEME";
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "system";

export async function getServerTheme(): Promise<Theme> {
  const store = await cookies();
  const raw = store.get(THEME_COOKIE)?.value;
  return raw === "light" || raw === "dark" || raw === "system"
    ? raw
    : DEFAULT_THEME;
}
