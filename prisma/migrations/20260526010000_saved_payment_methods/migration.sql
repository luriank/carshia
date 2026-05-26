-- SavedPaymentMethods: persist Stripe customer + tokenised card metadata per user.
-- We never store raw card data — only Stripe's payment_method_id plus the brand /
-- last4 / expiry the network already exposes for display purposes.

-- 1. Link each User to their (lazily created) Stripe Customer.
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- 2. PaymentMethod rows mirror Stripe PaymentMethod objects for fast listing.
CREATE TABLE "PaymentMethod" (
  "id"                    TEXT NOT NULL,
  "userId"                TEXT NOT NULL,
  "stripePaymentMethodId" TEXT NOT NULL,
  "brand"                 TEXT NOT NULL,
  "last4"                 TEXT NOT NULL,
  "expMonth"              INTEGER NOT NULL,
  "expYear"               INTEGER NOT NULL,
  "isDefault"             BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentMethod_stripePaymentMethodId_key"
  ON "PaymentMethod"("stripePaymentMethodId");

CREATE INDEX "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

ALTER TABLE "PaymentMethod"
  ADD CONSTRAINT "PaymentMethod_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. One-default-per-user, enforced at the DB level (same idiom as Address).
CREATE UNIQUE INDEX "PaymentMethod_userId_isDefault_key"
  ON "PaymentMethod"("userId")
  WHERE "isDefault" = TRUE;
