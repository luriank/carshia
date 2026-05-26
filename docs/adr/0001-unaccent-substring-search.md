# Diacritic-insensitive substring search via Postgres `unaccent`

The storefront's catalog and header typeahead both let users search products
by free text. Plain Prisma `contains` with `mode: "insensitive"` translates to
Postgres `ILIKE`, which is case-insensitive but **not** diacritic-insensitive
— so typing "gjakove" returns nothing despite the catalog being full of
"Gjakovë" products. We fix that at the database layer by enabling the
`unaccent` extension and rewriting the substring match as
`unaccent(lower(field)) LIKE unaccent(lower($q))`.

## Considered options

- **Generated/STORED columns** (e.g. `titleSearch String GENERATED ALWAYS AS
  (lower(unaccent(title))) STORED`). Rejected: would require backfill and
  hits a Postgres limitation — `unaccent` is `STABLE`, not `IMMUTABLE`, so it
  can't appear in a stored generated column without a wrapper function and
  the matching index machinery. Cost > benefit at our scale.
- **Application-side normalization on read** (fetch all, fold + filter in
  Node). Works for ~50 demo rows; doesn't scale and forfeits Prisma's count /
  groupBy facet queries.
- **`pg_trgm` similarity ranking** in place of substring `LIKE`. Different
  semantics (similarity score, fuzzy match) and overkill for the typeahead
  UX we already shipped.

## Consequences

- One small raw-SQL hop per text-filtered search ([lib/queries/search.ts]):
  `searchMatchingProductIds(q)` returns matching IDs, and the existing Prisma
  builders in `/api/search/suggest` and `lib/queries/catalog.ts` consume them
  via `id: { in: ids }`. Keeps `count`, `findMany`, and the two `groupBy`
  facet queries in `getCatalog` on the same shared filter without rewriting
  the module in raw SQL.
- Postgres lock-in deepens slightly — `unaccent` is a Postgres-only
  extension. The schema is already Postgres-only (Prisma `postgresql`
  provider, neon in prod), so this is not a new constraint.
- No index yet. At 50–500 rows the sequential scan is fine; if the catalog
  grows past ~10k rows the expression should get a GIN trigram index
  (`CREATE EXTENSION pg_trgm; CREATE INDEX ... USING GIN (unaccent(lower(title)) gin_trgm_ops)`).
- The pre-existing quirk that user-typed `%` and `_` are passed through as
  ILIKE wildcards is preserved (deliberately out of scope here — same
  behavior the catalog has had since launch).

[lib/queries/search.ts]: ../../lib/queries/search.ts
