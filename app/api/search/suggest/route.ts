import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/i18n-content";
import {
  searchMatchingProductIds,
  type SearchMode,
} from "@/lib/queries/search";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 6;
const MAX_QUERY_LENGTH = 80;

export type SuggestItem = {
  id: string;
  slug: string;
  title: string;
  brandName: string;
  categoryName: string;
  categorySlug: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
};

export type SuggestResponse = {
  q: string;
  items: SuggestItem[];
  mode: SearchMode | "empty";
};

const CACHE_HEADER = "private, max-age=10";

function suggestResponse(body: SuggestResponse) {
  return NextResponse.json<SuggestResponse>(body, {
    headers: {
      "Cache-Control": CACHE_HEADER,
      // Response is locale-dependent (cookie-driven via getLocale), so vary
      // the browser cache key on Cookie too.
      Vary: "Cookie",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

  if (q.length < 2) {
    return suggestResponse({ q, items: [], mode: "empty" });
  }

  const match = await searchMatchingProductIds(q);
  if (match !== null && match.ids.length === 0) {
    return suggestResponse({ q, items: [], mode: "empty" });
  }

  const locale = await getLocale();

  const rows = await prisma.product.findMany({
    where: {
      isDeleted: false,
      ...(match ? { id: { in: match.ids } } : {}),
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: MAX_RESULTS,
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  const items: SuggestItem[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: pickLocalized(p.title, p.titleEn, locale),
    brandName: p.brand.name,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    thumbnail: p.thumbnail,
    price: p.price,
    discountPercentage: p.discountPercentage,
  }));

  return suggestResponse({ q, items, mode: match?.mode ?? "empty" });
}
