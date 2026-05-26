"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/session";
import { computeTotals, discountedPrice } from "@/lib/format";
import { pickLocalized } from "@/lib/i18n-content";

export type ActionResult = { ok: true } | { ok: false; error: string };

const guestLinesSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive().max(99),
    }),
  )
  .max(100);

function revalidateShop() {
  revalidatePath("/", "layout");
  revalidatePath("/cart");
}

export async function getCartCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  const agg = await prisma.cartItem.aggregate({
    where: { userId: user.id },
    _sum: { quantity: true },
  });
  return agg._sum.quantity ?? 0;
}

export async function getCart() {
  const user = await getCurrentUser();
  if (!user) {
    return { items: [], totals: computeTotals(0) };
  }
  const rows = await prisma.cartItem.findMany({
    where: { userId: user.id, product: { isDeleted: false } },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
  const locale = await getLocale();

  const items = rows.map((row) => {
    const unitPrice = discountedPrice(
      row.product.price,
      row.product.discountPercentage,
    );
    return {
      id: row.id,
      productId: row.productId,
      title: pickLocalized(row.product.title, row.product.titleEn, locale),
      slug: row.product.slug,
      thumbnail: row.product.thumbnail,
      price: row.product.price,
      discountPercentage: row.product.discountPercentage,
      unitPrice,
      quantity: row.quantity,
      stockQuantity: row.product.stockQuantity,
      lineTotal: Math.round((unitPrice * row.quantity + Number.EPSILON) * 100) / 100,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, totals: computeTotals(subtotal) };
}

export async function addToCart(
  productId: string,
  quantity = 1,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false },
  });
  if (!product) return { ok: false, error: "Product not available." };
  if (product.stockQuantity <= 0) {
    return { ok: false, error: "This product is out of stock." };
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  const nextQty = Math.min(
    (existing?.quantity ?? 0) + quantity,
    product.stockQuantity,
  );

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { quantity: nextQty },
    create: { userId: user.id, productId, quantity: nextQty },
  });
  revalidateShop();
  return { ok: true };
}

export async function setCartQuantity(
  productId: string,
  quantity: number,
): Promise<ActionResult> {
  const user = await requireUser();
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId: user.id, productId } });
    revalidateShop();
    return { ok: true };
  }
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false },
  });
  if (!product) return { ok: false, error: "Product not available." };

  const capped = Math.min(quantity, product.stockQuantity);
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { quantity: capped },
    create: { userId: user.id, productId, quantity: capped },
  });
  revalidateShop();
  return { ok: true };
}

export async function removeFromCart(
  productId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  await prisma.cartItem.deleteMany({ where: { userId: user.id, productId } });
  revalidateShop();
  return { ok: true };
}

export async function clearCart(): Promise<ActionResult> {
  const user = await requireUser();
  await prisma.cartItem.deleteMany({ where: { userId: user.id } });
  revalidateShop();
  return { ok: true };
}

/**
 * Resolve a guest cart (localStorage line items) into the same shape as
 * {@link getCart}, so the cart UI is identical for guests and members.
 * Read-only and auth-free; quantities are clamped to live stock and
 * unavailable products are dropped.
 */
export async function getGuestCartDetails(input: unknown) {
  const parsed = guestLinesSchema.safeParse(input);
  if (!parsed.success || parsed.data.length === 0) {
    return { items: [], totals: computeTotals(0) };
  }
  const lines = parsed.data;
  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, isDeleted: false },
  });
  const locale = await getLocale();

  const items = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product || product.stockQuantity <= 0) return null;
      const quantity = Math.min(line.quantity, product.stockQuantity);
      const unitPrice = discountedPrice(
        product.price,
        product.discountPercentage,
      );
      return {
        id: product.id,
        productId: product.id,
        title: pickLocalized(product.title, product.titleEn, locale),
        slug: product.slug,
        thumbnail: product.thumbnail,
        price: product.price,
        discountPercentage: product.discountPercentage,
        unitPrice,
        quantity,
        stockQuantity: product.stockQuantity,
        lineTotal:
          Math.round((unitPrice * quantity + Number.EPSILON) * 100) / 100,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, totals: computeTotals(subtotal) };
}

/**
 * Fold a guest cart into the signed-in user's DB cart (called once on
 * sign-in). Quantities are summed with any existing line and capped to stock.
 */
export async function mergeGuestCart(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = guestLinesSchema.safeParse(input);
  if (!parsed.success || parsed.data.length === 0) return { ok: true };

  const products = await prisma.product.findMany({
    where: {
      id: { in: parsed.data.map((l) => l.productId) },
      isDeleted: false,
    },
  });
  const existing = await prisma.cartItem.findMany({
    where: { userId: user.id },
  });

  for (const line of parsed.data) {
    const product = products.find((p) => p.id === line.productId);
    if (!product || product.stockQuantity <= 0) continue;
    const prior =
      existing.find((e) => e.productId === line.productId)?.quantity ?? 0;
    const nextQty = Math.min(prior + line.quantity, product.stockQuantity);
    await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId: user.id, productId: line.productId },
      },
      update: { quantity: nextQty },
      create: {
        userId: user.id,
        productId: line.productId,
        quantity: nextQty,
      },
    });
  }
  revalidateShop();
  return { ok: true };
}
