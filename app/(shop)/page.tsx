import { Suspense } from "react";
import { MagnifyingGlassMinus } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import {
  getCatalog,
  parseCatalogParams,
  type CatalogSearchParams,
} from "@/lib/queries/catalog";
import { getBestsellers } from "@/lib/queries/product";
import { getWishlistProductIds } from "@/lib/actions/wishlist";
import { Storefront } from "@/components/catalog/storefront";
import { ArtisanStory } from "@/components/catalog/artisan-story";
import { TrustMarquee } from "@/components/shared/marquee";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { MobileFilter } from "@/components/catalog/mobile-filter";
import { SortSelect } from "@/components/catalog/sort-select";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import {
  CatalogTransitionProvider,
  CatalogPending,
} from "@/components/catalog/catalog-transition";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const pick = (k: string) => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const params: CatalogSearchParams = {
    q: pick("q"),
    category: pick("category"),
    brand: pick("brand"),
    sort: pick("sort"),
    page: pick("page"),
  };
  const filters = parseCatalogParams(params);

  const isBrowsing =
    !filters.q &&
    filters.categories.length === 0 &&
    filters.brands.length === 0 &&
    filters.page === 1;
  const activeFilterCount =
    filters.categories.length + filters.brands.length;

  const [catalog, wishlistIds, bestsellers] = await Promise.all([
    getCatalog(filters),
    getWishlistProductIds(),
    isBrowsing ? getBestsellers(12) : Promise.resolve([]),
  ]);
  const wishlistSet = new Set(wishlistIds);

  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
      {isBrowsing ? (
        <div className="mb-8 space-y-8">
          <Storefront
            categories={catalog.categoryFacets}
            showcase={bestsellers}
            wishlistIds={wishlistSet}
          />
          <ArtisanStory />
          <TrustMarquee />
        </div>
      ) : null}

      <CatalogTransitionProvider>
        <div
          id="catalog"
          className="grid scroll-mt-24 grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]"
        >
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border/60 bg-card p-4">
              <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                <FilterSidebar
                  categoryFacets={catalog.categoryFacets}
                  brandFacets={catalog.brandFacets}
                />
              </Suspense>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <span aria-hidden className="block gilt-rule" />
                <h1 className="font-display text-[1.75rem] leading-tight font-medium sm:text-[2rem]">
                  {filters.q
                    ? t("catalog.resultsFor", { q: filters.q })
                    : t("catalog.allProducts")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("catalog.count", { count: catalog.total })}
                  {activeFilterCount > 0
                    ? ` · ${t("catalog.filtersActive", { count: activeFilterCount })}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Suspense
                  fallback={
                    <Skeleton className="h-9 w-28 rounded-md lg:hidden" />
                  }
                >
                  <MobileFilter
                    categoryFacets={catalog.categoryFacets}
                    brandFacets={catalog.brandFacets}
                    activeCount={activeFilterCount}
                  />
                </Suspense>
                <Suspense
                  fallback={<Skeleton className="h-9 w-[180px] rounded-md" />}
                >
                  <SortSelect />
                </Suspense>
              </div>
            </div>

            {catalog.products.length === 0 ? (
              <EmptyState
                icon={MagnifyingGlassMinus}
                title={t("catalog.noProductsTitle")}
                description={t("catalog.noProductsDesc")}
              />
            ) : (
              <CatalogPending>
                <ProductGrid
                  products={catalog.products}
                  wishlistIds={wishlistSet}
                />
                <Suspense
                  fallback={<div className="mt-10 h-9" aria-hidden />}
                >
                  <CatalogPagination
                    page={catalog.page}
                    totalPages={catalog.totalPages}
                  />
                </Suspense>
              </CatalogPending>
            )}
          </div>
        </div>
      </CatalogTransitionProvider>
    </div>
  );
}
