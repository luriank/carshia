"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { parseImages, productSchema } from "@/lib/validations/product";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

const ORDER_STATUSES = [
  "PENDING",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
] as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function createProduct(
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid product.",
    };
  }
  const data = parsed.data;
  const slug = `${slugify(data.title)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  const imageList = parseImages(data.images);

  const created = await prisma.product.create({
    data: {
      title: data.title,
      titleEn: data.titleEn?.trim() ? data.titleEn.trim() : null,
      slug,
      description: data.description,
      descriptionEn: data.descriptionEn?.trim()
        ? data.descriptionEn.trim()
        : null,
      price: data.price,
      discountPercentage: data.discountPercentage,
      stockQuantity: data.stockQuantity,
      thumbnail: data.thumbnail,
      images: imageList.length ? imageList : [data.thumbnail],
      categoryId: data.categoryId,
      brandId: data.brandId,
      isFeatured: data.isFeatured,
    },
  });
  revalidateAll();
  return { ok: true, id: created.id };
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid product.",
    };
  }
  const data = parsed.data;
  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) return { ok: false, error: "Product not found." };
  const imageList = parseImages(data.images);

  await prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      titleEn: data.titleEn?.trim() ? data.titleEn.trim() : null,
      description: data.description,
      descriptionEn: data.descriptionEn?.trim()
        ? data.descriptionEn.trim()
        : null,
      price: data.price,
      discountPercentage: data.discountPercentage,
      stockQuantity: data.stockQuantity,
      thumbnail: data.thumbnail,
      images: imageList.length ? imageList : [data.thumbnail],
      categoryId: data.categoryId,
      brandId: data.brandId,
      isFeatured: data.isFeatured,
    },
  });
  revalidateAll();
  return { ok: true, id };
}

export async function setProductDeleted(
  id: string,
  isDeleted: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { isDeleted } });
  revalidateAll();
  return { ok: true };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { ok: false, error: "Invalid status." };
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as (typeof ORDER_STATUSES)[number] },
  });
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
  return { ok: true };
}
