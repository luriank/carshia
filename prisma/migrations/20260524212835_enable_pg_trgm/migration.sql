-- Enable the `pg_trgm` extension so search can score trigram similarity and
-- forgive small typos (e.g. "filgree" still finds "filigree"). The substring
-- ILIKE in lib/queries/search.ts ORs against similarity(unaccent(lower(field)),
-- unaccent(lower($q))) > 0.3.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
