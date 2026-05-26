/**
 * Picks the locale-appropriate value for DB content that has an optional
 * English variant. The primary column holds Albanian (the main language);
 * `en` is used only when the active locale is English and a value exists.
 */
export function pickLocalized(
  primary: string,
  en: string | null | undefined,
  locale: string,
): string {
  if (locale === "en" && en && en.trim().length > 0) return en;
  return primary;
}
