import type { ProductListItem } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { StaggerContainer } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  wishlistIds,
  className,
}: {
  products: ProductListItem[];
  wishlistIds?: Set<string>;
  className?: string;
}) {
  return (
    <StaggerContainer
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          initialInWishlist={wishlistIds?.has(product.id) ?? false}
        />
      ))}
    </StaggerContainer>
  );
}
