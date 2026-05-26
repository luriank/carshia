import type { ProductListItem } from "@/lib/types";
import { CategoryRail } from "@/components/catalog/category-rail";
import { Hero } from "@/components/catalog/hero";
import { BestsellerCarousel } from "@/components/catalog/bestseller-carousel";

export function Storefront({
  categories,
  showcase,
  wishlistIds,
}: {
  categories: { slug: string; name: string; count: number }[];
  showcase: ProductListItem[];
  wishlistIds: Set<string>;
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <CategoryRail categories={categories} />
        </div>
        <Hero />
      </div>

      <BestsellerCarousel products={showcase} wishlistIds={wishlistIds} />
    </div>
  );
}
