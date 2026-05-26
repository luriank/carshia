import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// The skeleton mirrors the storefront shape (hero + category rail) so the
// page does not "expand" once content streams in. Catalog-only pages
// (with filters/search/pagination) keep showing the previous list via
// CatalogPending instead of routing through this skeleton, so the
// storefront branch is the dominant cold-load shape.
export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
      {/* Storefront hero + side rail */}
      <div className="mb-8 grid items-start gap-3 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <Skeleton className="h-[24rem] w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[18rem] w-full rounded-2xl" />
      </div>

      {/* Bestseller rail */}
      <div className="mb-10 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="hidden h-7 w-20 sm:block" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square w-full rounded-2xl"
            />
          ))}
        </div>
      </div>

      {/* Catalog */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <Skeleton className="h-96 w-full rounded-xl" />
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-44" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
