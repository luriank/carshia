"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { reviewSchema } from "@/lib/validations/review";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function recomputeRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
  });
  const avg = agg._avg.rating ?? 0;
  await prisma.product.update({
    where: { id: productId },
    data: { rating: Math.round(avg * 100) / 100 },
  });
}

export async function upsertReview(
  productId: string,
  input: unknown,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid review.",
    };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false },
    select: { id: true },
  });
  if (!product) return { ok: false, error: "Product not available." };

  await prisma.review.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: {
      userId: user.id,
      productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });
  await recomputeRating(productId);
  revalidatePath(`/product`, "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteReview(
  productId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  await prisma.review.deleteMany({
    where: { userId: user.id, productId },
  });
  await recomputeRating(productId);
  revalidatePath(`/product`, "layout");
  revalidatePath("/", "layout");
  return { ok: true };
}
