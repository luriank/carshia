import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Finalise a successful card payment: flip the order to PAID, decrement stock,
 * clear the cart. Driven from two places that may race — the client-side
 * `finalizeCardPayment` action (for snappy UX) and the Stripe webhook (the
 * source of truth). Idempotent on both axes:
 *
 * 1. **Payment status CAS** — `updateMany` with `paymentStatus: "UNPAID"` is
 *    atomic at the row level under Postgres' default Read Committed isolation.
 *    The second caller's WHERE no longer matches and `count === 0`, so it
 *    short-circuits before touching stock or cart.
 * 2. **Stock under-flow guard** — conditional `updateMany` with
 *    `stockQuantity: { gte: item.quantity }` so two card payments that both
 *    raced past stock checks at order-creation time cannot drive stock below
 *    zero. If a decrement is refused we log it: the customer has already been
 *    charged, so it becomes a manual refund / restock situation.
 *
 * Not a server action: kept in a `server-only` module so it's not exposed as
 * an RPC endpoint via Next's `"use server"` boundary.
 */
export async function markOrderPaid(
  orderId: string,
  paymentIntentId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // CAS: only one of competing callers (finalize vs. webhook, or redelivered
    // webhook) wins this row lock. Persisting paymentIntentId here also fixes
    // the race where `placeOrder`'s post-create `update` lost to a fast
    // webhook.
    const flipped = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: "UNPAID" },
      data: { paymentStatus: "PAID", paymentIntentId },
    });
    if (flipped.count === 0) return;

    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    for (const item of order.items) {
      const dec = await tx.product.updateMany({
        where: {
          id: item.productId,
          stockQuantity: { gte: item.quantity },
        },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (dec.count === 0) {
        console.error(
          "[payments] stock oversell — manual refund/restock needed",
          { orderId, productId: item.productId, quantity: item.quantity },
        );
      }
    }
    await tx.cartItem.deleteMany({ where: { userId: order.userId } });
  });
}

/**
 * Called by the webhook when Stripe reports a terminal payment failure. The
 * order is cancelled so the customer sees a clean "this didn't go through"
 * state and can place a new one — stock was never decremented and their cart
 * was never cleared, so they keep their items. Idempotent; the
 * `paymentStatus: { not: "PAID" }` guard means a delayed-redelivery failed
 * event can't cancel an order that meanwhile succeeded.
 *
 * Persists `paymentIntentId` in the same write so we don't lose the link if
 * the post-`paymentIntents.create` update in `placeOrder` raced and lost.
 */
export async function markOrderFailed(
  orderId: string,
  paymentIntentId: string,
): Promise<void> {
  await prisma.order.updateMany({
    where: {
      id: orderId,
      paymentStatus: { not: "PAID" },
    },
    data: {
      paymentStatus: "FAILED",
      status: "CANCELLED",
      paymentIntentId,
    },
  });
}
