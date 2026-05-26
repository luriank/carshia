"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { stripe, STRIPE_CURRENCY, toStripeAmount } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/payments";
import { computeTotals, discountedPrice } from "@/lib/format";

export type PlaceOrderResult =
  | { ok: true; orderId: string; clientSecret?: string }
  | { ok: false; error: string };

export type FinalizeResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

const placeOrderSchema = z.object({
  addressId: z.string().min(1, "Select a delivery address"),
  paymentMode: z.enum(["COD", "CARD"]),
});

type CartLineRow = {
  productId: string;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
};

type CheckoutAddress = {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  type: string;
};

type CheckoutContext =
  | { ok: false; error: string }
  | {
      ok: true;
      address: CheckoutAddress;
      phone: string;
      lines: CartLineRow[];
      totals: ReturnType<typeof computeTotals>;
    };

async function loadCheckoutContext(
  userId: string,
  addressId: string,
): Promise<CheckoutContext> {
  const [address, fullUser] = await Promise.all([
    prisma.address.findFirst({ where: { id: addressId, userId } }),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { phone: true },
    }),
  ]);
  if (!address) {
    return { ok: false, error: "Delivery address not found." };
  }
  if (!fullUser.phone) {
    return {
      ok: false,
      error:
        "Add a phone number to your profile before placing this order — the courier needs to reach you.",
    };
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId, product: { isDeleted: false } },
    include: { product: true },
  });
  if (cartItems.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const lines: CartLineRow[] = cartItems.map((ci) => {
    const unit = discountedPrice(
      ci.product.price,
      ci.product.discountPercentage,
    );
    const quantity = Math.min(ci.quantity, ci.product.stockQuantity);
    return {
      productId: ci.productId,
      title: ci.product.title,
      thumbnail: ci.product.thumbnail,
      price: unit,
      quantity,
    };
  });

  const unavailable = lines.find((l) => l.quantity <= 0);
  if (unavailable) {
    return {
      ok: false,
      error: `"${unavailable.title}" is out of stock — please remove it.`,
    };
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const totals = computeTotals(subtotal);

  return {
    ok: true,
    address,
    phone: fullUser.phone,
    lines,
    totals,
  };
}

function buildAddressSnapshot(
  address: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    type: string;
  },
  phone: string,
) {
  return {
    fullName: address.fullName,
    phone,
    street: address.street,
    city: address.city,
    postalCode: address.postalCode,
    country: "Kosovë",
    type: address.type,
  };
}

export async function placeOrder(
  input: unknown,
): Promise<PlaceOrderResult> {
  const user = await requireUser();
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid order.",
    };
  }

  const ctx = await loadCheckoutContext(user.id, parsed.data.addressId);
  if (!ctx.ok) return { ok: false, error: ctx.error };

  if (parsed.data.paymentMode === "COD") {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          total: ctx.totals.total,
          paymentMode: "COD",
          paymentStatus: "UNPAID",
          addressJson: buildAddressSnapshot(ctx.address, ctx.phone),
          items: {
            create: ctx.lines.map((l) => ({
              productId: l.productId,
              title: l.title,
              thumbnail: l.thumbnail,
              price: l.price,
              quantity: l.quantity,
            })),
          },
        },
      });

      for (const l of ctx.lines) {
        await tx.product.update({
          where: { id: l.productId },
          data: { stockQuantity: { decrement: l.quantity } },
        });
      }
      await tx.cartItem.deleteMany({ where: { userId: user.id } });
      return created;
    });

    revalidatePath("/", "layout");
    revalidatePath("/orders");
    return { ok: true, orderId: order.id };
  }

  // CARD path: create the order in UNPAID state, create a PaymentIntent, and
  // return the client_secret. Stock is NOT decremented and the cart is NOT
  // cleared until the payment confirms (via the finalize action or webhook).
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total: ctx.totals.total,
      paymentMode: "CARD",
      paymentStatus: "UNPAID",
      addressJson: buildAddressSnapshot(ctx.address, ctx.phone),
      items: {
        create: ctx.lines.map((l) => ({
          productId: l.productId,
          title: l.title,
          thumbnail: l.thumbnail,
          price: l.price,
          quantity: l.quantity,
        })),
      },
    },
  });

  let intent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: toStripeAmount(ctx.totals.total),
      currency: STRIPE_CURRENCY,
      payment_method_types: ["card"],
      metadata: { orderId: order.id, userId: user.id },
      description: `Order ${order.id.slice(-8).toUpperCase()} — Autentika Gjakovë`,
    });
  } catch (e) {
    // Roll back the order so the user can retry without a phantom PENDING entry.
    await prisma.order.delete({ where: { id: order.id } });
    const message =
      e instanceof Error ? e.message : "Could not start card payment.";
    return { ok: false, error: message };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentIntentId: intent.id },
  });

  return {
    ok: true,
    orderId: order.id,
    clientSecret: intent.client_secret ?? undefined,
  };
}

const finalizeSchema = z.object({
  orderId: z.string().min(1),
  paymentIntentId: z.string().min(1),
});

/**
 * Called by the client right after `stripe.confirmPayment` resolves so the
 * order flips to PAID without waiting for the webhook round-trip. The webhook
 * is the source of truth for failures and reconciliation; this action is
 * purely a snappier-UX optimisation. Idempotent.
 */
export async function finalizeCardPayment(
  input: unknown,
): Promise<FinalizeResult> {
  const user = await requireUser();
  const parsed = finalizeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid payment payload." };
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: user.id },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentMode !== "CARD") {
    return { ok: false, error: "Order is not a card payment." };
  }
  if (order.paymentIntentId !== parsed.data.paymentIntentId) {
    return { ok: false, error: "Payment does not match this order." };
  }

  if (order.paymentStatus === "PAID") {
    return { ok: true, orderId: order.id };
  }

  const intent = await stripe.paymentIntents.retrieve(
    parsed.data.paymentIntentId,
  );
  if (intent.status !== "succeeded") {
    return {
      ok: false,
      error: `Payment is not complete (status: ${intent.status}).`,
    };
  }

  await markOrderPaid(order.id, intent.id);
  revalidatePath("/", "layout");
  revalidatePath("/orders");
  revalidatePath(`/order/${order.id}`);
  return { ok: true, orderId: order.id };
}
