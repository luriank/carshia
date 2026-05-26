import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Fire } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { getBestsellers } from "@/lib/queries/product";
import { getWishlistProductIds } from "@/lib/actions/wishlist";
import { ProductGrid } from "@/components/product/product-grid";

const BESTSELLER_LIMIT = 8;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.bestsellers") };
}

export default async function BestsellersPage() {
  const t = await getTranslations();
  const [products, wishlistIds] = await Promise.all([
    getBestsellers(BESTSELLER_LIMIT),
    getWishlistProductIds().then((ids) => new Set(ids)),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 space-y-3 sm:mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft weight="bold" className="size-3.5" />
          {t("catalog.allProducts")}
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-foreground ring-1 ring-gold/30">
          <Fire weight="fill" className="size-3.5" aria-hidden />
          {t("bestsellers.kicker")}
        </span>
        <h1 className="font-display text-[2rem] leading-[1.05] font-medium sm:text-[2.5rem]">
          {t("bestsellers.pageTitle")}
        </h1>
        <p className="max-w-2xl text-[15px] text-muted-foreground">
          {t("bestsellers.pageSubtitle")}
        </p>
        <span aria-hidden className="block gilt-rule" />
      </header>
      <ProductGrid products={products} wishlistIds={wishlistIds} />
    </div>
  );
}
