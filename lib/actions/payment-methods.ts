"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getOrCreateStripeCustomer, stripe } from "@/lib/stripe";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export type SetupIntentResult =
  | { ok: true; clientSecret: string }
  | { ok: false; error: string };

/**
 * Same race window as `setDefaultAddress` — translate a P2002 on the partial
 * unique index into a friendly retry signal instead of a 500.
 */
function isDefaultCollision(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

export type PaymentMethodRecord = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: Date;
};

export async function listPaymentMethods(): Promise<PaymentMethodRecord[]> {
  const user = await requireUser();
  return prisma.paymentMethod.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      brand: true,
      last4: true,
      expMonth: true,
      expYear: true,
      isDefault: true,
      createdAt: true,
    },
  });
}

/**
 * Returns a Stripe SetupIntent client_secret that the Payment Element confirms
 * client-side. We only ever issue SetupIntents for card payment methods to
 * match the checkout flow (`payment_method_types: ["card"]`).
 */
export async function createPaymentSetupIntent(): Promise<SetupIntentResult> {
  const user = await requireUser();
  try {
    const customerId = await getOrCreateStripeCustomer(user.id);
    const intent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
      metadata: { userId: user.id },
    });
    if (!intent.client_secret) {
      return { ok: false, error: "Could not start card setup." };
    }
    return { ok: true, clientSecret: intent.client_secret };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not start card setup.";
    return { ok: false, error: message };
  }
}

const saveSchema = z.object({
  paymentMethodId: z.string().min(1),
  makeDefault: z.boolean().optional(),
});

/**
 * Called by the client after `stripe.confirmSetup` resolves successfully. We
 * retrieve the PaymentMethod from Stripe to (a) verify the caller can't lie
 * about brand/last4 and (b) defensively ensure it's attached to *this user's*
 * Stripe Customer before persisting.
 */
export async function savePaymentMethod(
  input: unknown,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid payload." };
  }

  const customerId = await getOrCreateStripeCustomer(user.id);

  let pm;
  try {
    pm = await stripe.paymentMethods.retrieve(parsed.data.paymentMethodId);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not load this card from Stripe.";
    return { ok: false, error: message };
  }
  if (pm.customer !== customerId) {
    return { ok: false, error: "This card is not attached to your account." };
  }
  if (pm.type !== "card" || !pm.card) {
    return { ok: false, error: "Only card payment methods are supported." };
  }

  try {
    const saved = await prisma.$transaction(async (tx) => {
      const existing = await tx.paymentMethod.count({
        where: { userId: user.id },
      });
      const shouldBeDefault = existing === 0 || !!parsed.data.makeDefault;
      if (shouldBeDefault) {
        await tx.paymentMethod.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.paymentMethod.upsert({
        where: { stripePaymentMethodId: pm.id },
        update: {
          isDefault: shouldBeDefault,
          brand: pm.card!.brand,
          last4: pm.card!.last4,
          expMonth: pm.card!.exp_month,
          expYear: pm.card!.exp_year,
        },
        create: {
          userId: user.id,
          stripePaymentMethodId: pm.id,
          brand: pm.card!.brand,
          last4: pm.card!.last4,
          expMonth: pm.card!.exp_month,
          expYear: pm.card!.exp_year,
          isDefault: shouldBeDefault,
        },
      });
    });
    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { ok: true, id: saved.id };
  } catch (err) {
    if (isDefaultCollision(err)) {
      return {
        ok: false,
        error: "Default card changed in another tab — please try again.",
      };
    }
    throw err;
  }
}

export async function setDefaultPaymentMethod(
  id: string,
): Promise<ActionResult> {
  const user = await requireUser();
  try {
    const result = await prisma.$transaction(async (tx) => {
      const own = await tx.paymentMethod.findFirst({
        where: { id, userId: user.id },
        select: { id: true },
      });
      if (!own) return null;
      await tx.paymentMethod.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
      return tx.paymentMethod.update({
        where: { id: own.id },
        data: { isDefault: true },
      });
    });
    if (!result) return { ok: false, error: "Card not found." };
    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { ok: true, id: result.id };
  } catch (err) {
    if (isDefaultCollision(err)) {
      return {
        ok: false,
        error: "Default card changed in another tab — please try again.",
      };
    }
    throw err;
  }
}

export async function deletePaymentMethod(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const own = await prisma.paymentMethod.findFirst({
    where: { id, userId: user.id },
    select: { id: true, stripePaymentMethodId: true, isDefault: true },
  });
  if (!own) return { ok: false, error: "Card not found." };

  // Best-effort Stripe detach. If Stripe is unreachable we still drop the row
  // from our DB so the user sees their card gone — they can always remove the
  // dangling PaymentMethod from Stripe directly. (Common when running tests
  // against test-mode keys that have been rotated.)
  try {
    await stripe.paymentMethods.detach(own.stripePaymentMethodId);
  } catch (e) {
    console.warn("[payment-methods] detach failed", e);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.paymentMethod.delete({ where: { id: own.id } });
      if (own.isDefault) {
        const next = await tx.paymentMethod.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (next) {
          await tx.paymentMethod.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }
    });
    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (err) {
    if (isDefaultCollision(err)) {
      return {
        ok: false,
        error: "Default card changed in another tab — please try again.",
      };
    }
    throw err;
  }
}
