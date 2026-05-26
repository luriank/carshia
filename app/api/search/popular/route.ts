import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TAKE = 4;

export type PopularCategory = {
  slug: string;
  name: string;
  count: number;
};

export type PopularResponse = {
  categories: PopularCategory[];
};

export async function GET() {
  // Rank by non-deleted product count. The previous implementation ordered
  // categories by total products (including soft-deleted) and only filtered
  // the displayed count, which let a heavily soft-deleted category outrank
  // a healthy one.
  const grouped = await prisma.product.groupBy({
    by: ["categoryId"],
    where: { isDeleted: false },
    _count: { _all: true },
    orderBy: { _count: { categoryId: "desc" } },
    take: TAKE,
  });

  if (grouped.length === 0) {
    return NextResponse.json<PopularResponse>(
      { categories: [] },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  }

  const categories = await prisma.category.findMany({
    where: { id: { in: grouped.map((g) => g.categoryId) } },
    select: { id: true, slug: true, name: true },
  });

  const byId = new Map(categories.map((c) => [c.id, c]));
  const popular: PopularCategory[] = grouped.flatMap((g) => {
    const c = byId.get(g.categoryId);
    return c ? [{ slug: c.slug, name: c.name, count: g._count._all }] : [];
  });

  return NextResponse.json<PopularResponse>(
    { categories: popular },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
