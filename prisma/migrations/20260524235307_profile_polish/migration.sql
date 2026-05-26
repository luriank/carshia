-- ProfilePolish: consolidate phone onto User, scope Address to Kosovo,
-- introduce a default-address flag enforced by a partial unique index.

-- 1. Add the new User.phone column (nullable, backfilled below).
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- 2. Backfill: copy each user's oldest address phone into User.phone.
--    Picks the first address by createdAt; if a user has no address, phone stays NULL.
UPDATE "User" u
SET "phone" = a."phone"
FROM (
  SELECT DISTINCT ON ("userId") "userId", "phone"
  FROM "Address"
  ORDER BY "userId", "createdAt" ASC
) a
WHERE u."id" = a."userId";

-- 3. Add Address.isDefault. Existing rows get FALSE; we promote one per user below.
ALTER TABLE "Address" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. Promote each user's oldest address to default so existing users get a sensible pick.
UPDATE "Address" a
SET "isDefault" = TRUE
FROM (
  SELECT DISTINCT ON ("userId") "id"
  FROM "Address"
  ORDER BY "userId", "createdAt" ASC
) oldest
WHERE a."id" = oldest."id";

-- 5. Drop per-address fields that are now redundant: phone (lives on User),
--    state (Komuna confusion — dropped entirely for Kosovo-only scope),
--    country (implicit Kosovo).
ALTER TABLE "Address" DROP COLUMN "phone";
ALTER TABLE "Address" DROP COLUMN "state";
ALTER TABLE "Address" DROP COLUMN "country";

-- 6. Enforce one-default-per-user at the database level.
CREATE UNIQUE INDEX "Address_userId_isDefault_key"
ON "Address" ("userId")
WHERE "isDefault" = TRUE;
