import "server-only";
import Stripe from "stripe";

// Stripe SDK is constructed lazily so the build (which evaluates this module
// during page-data collection) doesn't fail when STRIPE_SECRET_KEY is absent.
// API calls will throw with a clear message at runtime if the key is missing.
let stripeSingleton: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — card payments are disabled. Add it to your environment to enable Stripe.",
    );
  }
  stripeSingleton = new Stripe(secret, { typescript: true });
  return stripeSingleton;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver);
  },
});

export const STRIPE_CURRENCY = "eur";

export function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

import { prisma } from "@/lib/prisma";

/**
 * Resolve the Stripe Customer for a user, creating it lazily on first use.
 * We persist `stripeCustomerId` on `User` so subsequent calls are a no-op.
 * Idempotent under concurrent calls thanks to the unique index — the second
 * writer's `update` short-circuits when the first wins the race.
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, email: true, stripeCustomerId: true },
  });
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });

  // Atomic guarded update: only swap in `customer.id` if no concurrent caller
  // already set one. `updateMany` lets us scope on a non-unique column;
  // count === 0 means we lost the race — detach our duplicate Customer and
  // adopt the winner's. `stripeCustomerId` is `@unique` so a concurrent
  // `create` could also raise P2002, which we treat the same way.
  try {
    const result = await prisma.user.updateMany({
      where: { id: user.id, stripeCustomerId: null },
      data: { stripeCustomerId: customer.id },
    });
    if (result.count === 1) return customer.id;
  } catch {
    // Fall through to the lookup-and-detach path below.
  }

  const fresh = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });
  if (fresh.stripeCustomerId && fresh.stripeCustomerId !== customer.id) {
    try {
      await stripe.customers.del(customer.id);
    } catch {
      // Ignore — best-effort cleanup.
    }
    return fresh.stripeCustomerId;
  }
  return customer.id;
}
