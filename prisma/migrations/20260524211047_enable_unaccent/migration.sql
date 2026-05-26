-- Enable the `unaccent` extension so substring search can fold diacritics
-- (e.g. typing "gjakove" matches "Gjakovë"). Used by lib/queries/search.ts
-- and consumed by both /api/search/suggest and lib/queries/catalog.ts.
CREATE EXTENSION IF NOT EXISTS unaccent;
