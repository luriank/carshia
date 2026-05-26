import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CaretRight as ChevronRight } from "@phosphor-icons/react/ssr";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/queries/product";
import { getCurrentUser } from "@/lib/session";
import { getWishlistProductIds } from "@/lib/actions/wishlist";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductDetailActions } from "@/components/product/product-detail-actions";
import { ProductGrid } from "@/components/product/product-grid";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { RatingStars } from "@/components/shared/rating-stars";
import { PriceTag } from "@/components/shared/price-tag";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations();
  const product = await getProductBySlug(slug);
  if (!product) return { title: t("meta.productNotFound") };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: [product.thumbnail],
    },
  };
}

function stockLabel(
  stock: number,
  t: Awaited<ReturnType<typeof getTranslations>>,
) {
  if (stock <= 0)
    return {
      text: t("product.outOfStock"),
      cls: "bg-muted text-muted-foreground",
    };
  if (stock <= 10)
    return {
      text: t("product.onlyLeft", { count: stock }),
      cls: "bg-gold/15 text-gold-foreground",
    };
  return {
    text: t("product.inStock"),
    cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [t, user, wishlistIds, related] = await Promise.all([
    getTranslations(),
    getCurrentUser(),
    getWishlistProductIds(),
    getRelatedProducts(product.categorySlug, product.id),
  ]);

  const inWishlist = wishlistIds.includes(product.id);
  const stock = stockLabel(product.stockQuantity, t);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground">
          {t("productPage.breadcrumbShop")}
        </Link>
        <ChevronRight weight="bold" className="size-3.5" />
        <Link
          href={`/?category=${product.categorySlug}`}
          className="hover:text-foreground"
        >
          {t(`categories.${product.categorySlug}`)}
        </Link>
        <ChevronRight weight="bold" className="size-3.5" />
        <span className="line-clamp-1 text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {product.brandName} · {t(`categories.${product.categorySlug}`)}
              </p>
              <h1 className="font-display text-[2rem] leading-[1.05] font-medium text-balance sm:text-[2.5rem]">
                {product.title}
              </h1>
              <Link
                href="#reviews"
                className="inline-flex w-fit items-center gap-2"
              >
                <RatingStars
                  rating={product.rating}
                  count={product.reviewCount}
                  size="md"
                />
              </Link>
            </div>

            <PriceTag
              price={product.price}
              discountPercentage={product.discountPercentage}
              size="lg"
            />

            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${stock.cls}`}
            >
              {stock.text}
            </span>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <Separator />

            <ProductDetailActions
              productId={product.id}
              stockQuantity={product.stockQuantity}
              initialInWishlist={inWishlist}
            />
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      <ReviewsSection product={product} currentUserId={user?.id ?? null} />

      {related.length > 0 ? (
        <div className="mt-16">
          <h2 className="mb-6 font-display text-[1.625rem] font-medium sm:text-[1.875rem]">
            {t("productPage.youMightLike")}
          </h2>
          <ProductGrid
            products={related}
            wishlistIds={new Set(wishlistIds)}
          />
        </div>
      ) : null}
    </div>
  );
}
