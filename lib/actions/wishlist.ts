"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/session";
import { discountedPrice } from "@/lib/format";
import { pickLocalized } from "@/lib/i18n-content";
import { addToCart } from "@/lib/actions/cart";

export type ActionResult = { ok: true } | { ok: false; error: string };

const guestIdsSchema = z.array(z.string().min(1)).max(200);

function revalidateShop() {
  revalidatePath("/", "layout");
  revalidatePath("/wishlist");
}

export async function getWishlistProductIds(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}

export async function getWishlistCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  return prisma.wishlistItem.count({ where: { userId: user.id } });
}

export async function getWishlist() {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await prisma.wishlistItem.findMany({
    where: { userId: user.id, product: { isDeleted: false } },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  const locale = await getLocale();
  return rows.map((row) => ({
    id: row.id,
    productId: row.productId,
    note: row.note,
    title: pickLocalized(row.product.title, row.product.titleEn, locale),
    slug: row.product.slug,
    thumbnail: row.product.thumbnail,
    price: row.product.price,
    discountPercentage: row.product.discountPercentage,
    unitPrice: discountedPrice(
      row.product.price,
      row.product.discountPercentage,
    ),
    rating: row.product.rating,
    stockQuantity: row.product.stockQuantity,
  }));
}

export async function toggleWishlist(
  productId: string,
): Promise<{ ok: true; added: boolean } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidateShop();
    return { ok: true, added: false };
  }
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false },
  });
  if (!product) return { ok: false, error: "Product not available." };
  await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidateShop();
  return { ok: true, added: true };
}

export async function removeFromWishlist(
  productId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  await prisma.wishlistItem.deleteMany({
    where: { userId: user.id, productId },
  });
  revalidateShop();
  return { ok: true };
}

export async function updateWishlistNote(
  productId: string,
  note: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const trimmed = note.trim().slice(0, 280);
  await prisma.wishlistItem.updateMany({
    where: { userId: user.id, productId },
    data: { note: trimmed.length ? trimmed : null },
  });
  revalidateShop();
  return { ok: true };
}

export async function moveWishlistItemToCart(
  productId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const result = await addToCart(productId, 1);
  if (!result.ok) return result;
  await prisma.wishlistItem.deleteMany({
    where: { userId: user.id, productId },
  });
  revalidateShop();
  return { ok: true };
}

/**
 * Resolve a guest wishlist (localStorage product ids) into the same shape as
 * {@link getWishlist}. Read-only and auth-free; unavailable products drop out.
 */
export async function getGuestWishlistDetails(input: unknown) {
  const parsed = guestIdsSchema.safeParse(input);
  if (!parsed.success || parsed.data.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: parsed.data }, isDeleted: false },
  });
  const locale = await getLocale();
  // Preserve the order the guest saved items in (most recent first).
  const ordered = parsed.data
    .map((id) => rows.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .reverse();
  return ordered.map((product) => ({
    id: product.id,
    productId: product.id,
    note: null as string | null,
    title: pickLocalized(product.title, product.titleEn, locale),
    slug: product.slug,
    thumbnail: product.thumbnail,
    price: product.price,
    discountPercentage: product.discountPercentage,
    unitPrice: discountedPrice(product.price, product.discountPercentage),
    rating: product.rating,
    stockQuantity: product.stockQuantity,
  }));
}

/** Fold a guest wishlist into the signed-in user's wishlist on sign-in. */
export async function mergeGuestWishlist(
  input: unknown,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = guestIdsSchema.safeParse(input);
  if (!parsed.success || parsed.data.length === 0) return { ok: true };

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data }, isDeleted: false },
    select: { id: true },
  });
  if (products.length === 0) return { ok: true };
  const valid = new Set(products.map((p) => p.id));
  const existing = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });
  const have = new Set(existing.map((e) => e.productId));

  // Insert in the order the guest saved them so createdAt stays monotonic
  // (getWishlist orders by createdAt desc — a bulk createMany would tie all
  // rows and scramble the guest's ordering).
  for (const id of parsed.data) {
    if (!valid.has(id) || have.has(id)) continue;
    await prisma.wishlistItem.create({
      data: { userId: user.id, productId: id },
    });
  }
  revalidateShop();
  return { ok: true };
}
