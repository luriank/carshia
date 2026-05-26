import "server-only";
import { cache } from "react";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { discountedPrice } from "@/lib/format";
import { pickLocalized } from "@/lib/i18n-content";
import type { ProductListItem } from "@/lib/types";

/**
 * Memoized per request so the product page and its `generateMetadata`
 * (which both call this) share a single DB round-trip instead of running
 * this heavy query twice on every product navigation.
 */
export const getProductBySlug = cache(async (slug: string) => {
  const product = await prisma.product.findFirst({
    where: { slug, isDeleted: false },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  const locale = await getLocale();
  const count = product.reviews.length;
  const sum = product.reviews.reduce((s, r) => s + r.rating, 0);
  const average = count ? Math.round((sum / count) * 100) / 100 : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));

  return {
    id: product.id,
    slug: product.slug,
    title: pickLocalized(product.title, product.titleEn, locale),
    description: pickLocalized(
      product.description,
      product.descriptionEn,
      locale,
    ),
    brandName: product.brand.name,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    price: product.price,
    discountPercentage: product.discountPercentage,
    unitPrice: discountedPrice(product.price, product.discountPercentage),
    rating: average || product.rating,
    stockQuantity: product.stockQuantity,
    thumbnail: product.thumbnail,
    images: product.images.length ? product.images : [product.thumbnail],
    reviewCount: count,
    average,
    distribution,
    reviews: product.reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    })),
  };
});

export async function getRelatedProducts(
  categorySlug: string,
  excludeId: string,
): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: {
      isDeleted: false,
      category: { slug: categorySlug },
      id: { not: excludeId },
    },
    orderBy: { rating: "desc" },
    take: 4,
    include: {
      brand: { select: { name: true } },
      _count: { select: { reviews: true } },
    },
  });
  const locale = await getLocale();
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: pickLocalized(p.title, p.titleEn, locale),
    brandName: p.brand.name,
    thumbnail: p.thumbnail,
    hoverImage: p.images.find((src) => src !== p.thumbnail) ?? undefined,
    price: p.price,
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    reviewCount: p._count.reviews,
    stockQuantity: p.stockQuantity,
  }));
}

function toListItem(
  p: {
    id: string;
    slug: string;
    title: string;
    titleEn: string | null;
    brand: { name: string };
    thumbnail: string;
    images: string[];
    price: number;
    discountPercentage: number;
    rating: number;
    stockQuantity: number;
    _count: { reviews: number };
  },
  locale: string,
): ProductListItem {
  return {
    id: p.id,
    slug: p.slug,
    title: pickLocalized(p.title, p.titleEn, locale),
    brandName: p.brand.name,
    thumbnail: p.thumbnail,
    hoverImage: p.images.find((src) => src !== p.thumbnail) ?? undefined,
    price: p.price,
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    reviewCount: p._count.reviews,
    stockQuantity: p.stockQuantity,
  };
}

/**
 * Bestsellers carousel feed. Order of preference:
 *   1. Admin-curated `isFeatured` products
 *   2. Best-selling by units sold
 *   3. Top-rated in-stock back-fill
 * so the carousel is always populated.
 */
export async function getBestsellers(
  take = 8,
): Promise<ProductListItem[]> {
  const include = {
    brand: { select: { name: true } },
    _count: { select: { reviews: true } },
  } as const;

  const locale = await getLocale();
  const ordered: ProductListItem[] = [];
  const have = new Set<string>();
  const push = (item: ProductListItem) => {
    if (have.has(item.id)) return;
    have.add(item.id);
    ordered.push(item);
  };

  // 1) Admin-curated featured
  const featured = await prisma.product.findMany({
    where: { isFeatured: true, isDeleted: false },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take,
    include,
  });
  featured.forEach((r) => push(toListItem(r, locale)));

  // 2) Best-selling by units sold
  const grouped =
    ordered.length >= take
      ? []
      : await prisma.orderItem.groupBy({
          by: ["productId"],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: take * 2,
        });

  if (grouped.length) {
    const ids = grouped.map((g) => g.productId);
    const rows = await prisma.product.findMany({
      where: { id: { in: ids }, isDeleted: false },
      include,
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    for (const g of grouped) {
      const row = byId.get(g.productId);
      if (row) push(toListItem(row, locale));
      if (ordered.length >= take) break;
    }
  }

  // 3) Top-rated in-stock back-fill
  if (ordered.length < take) {
    const fill = await prisma.product.findMany({
      where: { isDeleted: false, stockQuantity: { gt: 0 } },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: take * 2,
      include,
    });
    for (const r of fill) {
      push(toListItem(r, locale));
      if (ordered.length >= take) break;
    }
  }

  return ordered.slice(0, take);
}

/**
 * Newest first — for the `/new-arrivals` landing. Filters out soft-deleted
 * rows and orders strictly by `createdAt desc` so a slow-seller surfaces as
 * long as it just landed.
 */
export async function getNewArrivals(
  take = 12,
): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      brand: { select: { name: true } },
      _count: { select: { reviews: true } },
    },
  });
  const locale = await getLocale();
  return rows.map((r) => toListItem(r, locale));
}

export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductBySlug>>
>;
