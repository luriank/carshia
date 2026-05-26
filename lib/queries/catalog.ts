import "server-only";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/i18n-content";
import { searchMatchingProductIds } from "@/lib/queries/search";
import type { ProductListItem } from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";
import {
  PAGE_SIZE,
  type CatalogFilters,
  type SortValue,
} from "@/lib/catalog-params";

export {
  PAGE_SIZE,
  SORT_OPTIONS,
  parseCatalogParams,
} from "@/lib/catalog-params";
export type {
  SortValue,
  CatalogFilters,
  CatalogSearchParams,
} from "@/lib/catalog-params";

function orderByForSort(
  sort: SortValue,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "rating":
      return { rating: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function getCatalog(filters: CatalogFilters) {
  const { q, categories, brands, sort, page } = filters;

  // Diacritic-insensitive substring match across title/titleEn/brand/category
  // is delegated to a raw-SQL helper (Postgres `unaccent`), so plain Prisma
  // can stay in charge of the count/facet/list shape below.
  const match = await searchMatchingProductIds(q);

  const baseWhere: Prisma.ProductWhereInput = {
    isDeleted: false,
    ...(match ? { id: { in: match.ids } } : {}),
  };

  const where: Prisma.ProductWhereInput = {
    ...baseWhere,
    ...(categories.length ? { category: { slug: { in: categories } } } : {}),
    ...(brands.length ? { brand: { name: { in: brands } } } : {}),
  };

  const locale = await getLocale();

  const [total, rows, categoryFacet, brandFacet, allCategories, allBrands] =
    await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: orderByForSort(sort),
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          brand: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.groupBy({
        by: ["categoryId"],
        where: baseWhere,
        _count: { _all: true },
      }),
      prisma.product.groupBy({
        by: ["brandId"],
        where: baseWhere,
        _count: { _all: true },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
    ]);

  const catCount = new Map(
    categoryFacet.map((f) => [f.categoryId, f._count._all]),
  );
  const brandCount = new Map(
    brandFacet.map((f) => [f.brandId, f._count._all]),
  );

  const products: ProductListItem[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: pickLocalized(p.title, p.titleEn, locale),
    brandName: p.brand.name,
    thumbnail: p.thumbnail,
    hoverImage:
      p.images.find((src) => src !== p.thumbnail) ?? undefined,
    price: p.price,
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    reviewCount: p._count.reviews,
    stockQuantity: p.stockQuantity,
  }));

  const categoryFacets = allCategories
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      count: catCount.get(c.id) ?? 0,
    }))
    .filter((c) => c.count > 0);

  const brandFacets = allBrands
    .map((b) => ({
      name: b.name,
      count: brandCount.get(b.id) ?? 0,
    }))
    .filter((b) => b.count > 0);

  return {
    products,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    categoryFacets,
    brandFacets,
  };
}
