# Typo tolerance via pg_trgm as a fallback to substring search

Substring `ILIKE` (with `unaccent`, per ADR-0001) finds products when the user
types a real fragment of the title. It does nothing for small typos — a user
typing "filgree" gets zero results even though every "Filigree" product is
sitting one character away. We layer Postgres `pg_trgm` `word_similarity` on
top: **substring is primary, fuzzy is fallback** — if the substring pass
returns any rows, we use those; otherwise we run a second query that returns
products where the trigram similarity between the query and any of
`title / titleEn / brand.name / category.name` is above
`SIMILARITY_THRESHOLD = 0.3`.

## Why fallback, not OR'd

A naive `OR similarity > 0.3` mixes substring hits and fuzzy hits in one
result set, then `getCatalog` and the suggest route both sort by Prisma's
`[rating desc, createdAt desc]`. That would let a high-rated fuzzy match jump
ahead of an exact substring match. The two-tier structure preserves the
intuition that an exact-substring hit beats a typo-corrected hit, and avoids
fuzzy false-positives polluting good searches.

## Threshold

`0.3` was picked from an empirical probe of the seeded catalog
(see commit message): "filgree" / "filagree" / "varse" all surface their
intended products at `word_similarity` between 0.33 and 0.50, while
unrelated rows hover at 0.09–0.25. A tighter threshold (e.g. 0.5) misses
real typos like "filgree" (0.38); a looser one (0.2) starts pulling in
trigram-overlap noise like "Filxhan" for "filgree". 0.3 is the
documented Postgres `pg_trgm` default for `similarity_threshold` and
matches what we measured.

## Consequences

- **One extra round-trip on bad-input searches.** When the substring pass
  hits, fuzzy doesn't run. When the substring pass misses, we do a second
  raw query. At ~50 rows, both are sub-millisecond.
- **No index yet.** Both passes do sequential scans. Acceptable at our
  scale; production-scale (~10k+ rows) would want
  `CREATE INDEX product_title_trgm_idx ON "Product" USING GIN
  (unaccent(lower(title)) gin_trgm_ops)` — which also requires wrapping
  `unaccent` in an `IMMUTABLE` SQL function because pg_trgm GIN indexes
  reject `STABLE` expressions. Future work.
- **Threshold is tunable in one place** (`SIMILARITY_THRESHOLD` in
  `lib/queries/search.ts`). If fuzzy starts misbehaving as the catalog
  grows, dial it up.
- The fuzzy pass coalesces `titleEn` to `''` so NULL values don't blow up
  `word_similarity`. Substring pass relies on `LIKE NULL = NULL` correctly
  evaluating to false in the OR.
