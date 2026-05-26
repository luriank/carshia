-- Stripe payments: track card-payment lifecycle separately from order fulfilment status.

-- 1. Payment status enum.
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'REFUNDED');

-- 2. Add fields to Order. Default UNPAID is correct for both legacy and new orders —
--    COD orders stay UNPAID until delivery; card orders flip to PAID via webhook.
ALTER TABLE "Order"
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN "paymentIntentId" TEXT;

-- 3. Unique index so the webhook handler can look up an order by PaymentIntent id
--    idempotently and so we never reuse a PI across orders.
CREATE UNIQUE INDEX "Order_paymentIntentId_key" ON "Order" ("paymentIntentId");
