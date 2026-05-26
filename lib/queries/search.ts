import "server-only";
import { prisma } from "@/lib/prisma";
import { escapeLikePattern } from "@/lib/search-text";

const SIMILARITY_THRESHOLD = 0.3;
const MAX_QUERY_LENGTH = 80;

export type SearchMode = "substring" | "fuzzy";

export type SearchMatch = {
  ids: string[];
  mode: SearchMode;
};

/**
 * Returns the IDs of non-deleted products whose title / titleEn / brand name /
 * category name matches the user's query, with two-tier semantics:
 *
 *   1. **Primary** — case- and diacritic-insensitive substring match via the
 *      Postgres `unaccent` extension. Typing "gjakove" finds "Gjakovë".
 *   2. **Fallback** — when the substring pass returns nothing, fall back to
 *      trigram `word_similarity` (pg_trgm) above {@link SIMILARITY_THRESHOLD},
 *      so a small typo like "filgree" still surfaces "Filigree".
 *
 * The two-tier structure keeps exact substring hits ranked above fuzzy hits
 * (callers preserve order via Prisma's own `orderBy`), and avoids fuzzy
 * matches polluting good searches. The returned `mode` lets callers surface
 * a "Closest matches" hint when only fuzzy fired.
 *
 * Returns `null` for blank `q`, meaning "no text filter" — callers should
 * treat that as no `id` constraint at all.
 *
 * Backed by migrations 20260524211047_enable_unaccent and
 * 20260524212835_enable_pg_trgm. See docs/adr/0001 and 0002.
 */
export async function searchMatchingProductIds(
  q: string,
): Promise<SearchMatch | null> {
  const trimmed = q.trim().slice(0, MAX_QUERY_LENGTH);
  if (!trimmed) return null;

  const pattern = `%${escapeLikePattern(trimmed)}%`;

  const substringRows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id
    FROM "Product" p
    JOIN "Brand" b ON b.id = p."brandId"
    JOIN "Category" c ON c.id = p."categoryId"
    WHERE p."isDeleted" = false
      AND (
        unaccent(lower(p.title)) LIKE unaccent(lower(${pattern})) ESCAPE '!'
        OR unaccent(lower(p."titleEn")) LIKE unaccent(lower(${pattern})) ESCAPE '!'
        OR unaccent(lower(b.name)) LIKE unaccent(lower(${pattern})) ESCAPE '!'
        OR unaccent(lower(c.name)) LIKE unaccent(lower(${pattern})) ESCAPE '!'
      )
  `;
  if (substringRows.length > 0) {
    return { ids: substringRows.map((r) => r.id), mode: "substring" };
  }

  const fuzzyRows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id
    FROM "Product" p
    JOIN "Brand" b ON b.id = p."brandId"
    JOIN "Category" c ON c.id = p."categoryId"
    WHERE p."isDeleted" = false
      AND (
        word_similarity(unaccent(lower(${trimmed})), unaccent(lower(p.title))) > ${SIMILARITY_THRESHOLD}
        OR word_similarity(unaccent(lower(${trimmed})), unaccent(lower(coalesce(p."titleEn", '')))) > ${SIMILARITY_THRESHOLD}
        OR word_similarity(unaccent(lower(${trimmed})), unaccent(lower(b.name))) > ${SIMILARITY_THRESHOLD}
        OR word_similarity(unaccent(lower(${trimmed})), unaccent(lower(c.name))) > ${SIMILARITY_THRESHOLD}
      )
  `;
  return { ids: fuzzyRows.map((r) => r.id), mode: "fuzzy" };
}

/** Visible for tests. */
export const __testing = { SIMILARITY_THRESHOLD, MAX_QUERY_LENGTH };
