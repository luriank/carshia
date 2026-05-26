/**
 * Shared pure-function helpers for search text handling. Pulled out of
 * components/layout/search-bar.tsx and lib/queries/search.ts so tests can
 * exercise them without importing client / server-only modules.
 */

/** Lower-cased, diacritic-stripped form of `s`. "Gjakovë" → "gjakove". */
export function foldDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/**
 * Locate the substring within `text` that, ignoring case and diacritics,
 * matches `q`. Returns `[from, to]` indices into the ORIGINAL `text` so the
 * caller can slice and wrap the matched range in a <mark>. Returns `null`
 * when no match is found, or when `q` is empty/only diacritics.
 */
export function findFoldedRange(
  text: string,
  q: string,
): [number, number] | null {
  const needle = foldDiacritics(q);
  if (!needle) return null;
  for (let start = 0; start <= text.length; start++) {
    let ti = start;
    let qi = 0;
    while (qi < needle.length && ti < text.length) {
      const f = foldDiacritics(text[ti]);
      if (f.length === 0) {
        // The current character folds to nothing (e.g. a stray combining
        // mark). Skip it without advancing the needle.
        ti++;
        continue;
      }
      if (f !== needle[qi]) break;
      ti++;
      qi++;
    }
    if (qi === needle.length) return [start, ti];
  }
  return null;
}

/**
 * Escape Postgres LIKE wildcards (`%`, `_`) and the chosen escape char (`!`)
 * in user input. Pair with an explicit `ESCAPE '!'` clause on the LIKE so a
 * user typing "50%" matches the literal "50%" instead of acting as a
 * match-anything wildcard.
 */
export function escapeLikePattern(s: string): string {
  return s.replace(/[!%_]/g, "!$&");
}
