"use client";

import { useRef } from "react";
import {
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  Flame,
} from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import type { ProductListItem } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

export function BestsellerCarousel({
  products,
  wishlistIds,
}: {
  products: ProductListItem[];
  wishlistIds: Set<string>;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  if (products.length === 0) return null;

  function scroll(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-surface-band px-5 py-7 sm:px-8 sm:py-9">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-gold/10 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 size-56 rounded-full bg-primary/[0.07] blur-3xl"
      />
      <div className="relative mb-6 flex items-end justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-foreground ring-1 ring-gold/30">
            <Flame weight="fill" className="size-3.5" />
            {t("bestsellers.kicker")}
          </span>
          <h2 className="font-display text-[1.75rem] font-medium sm:text-[2rem]">
            {t("bestsellers.heading")}
          </h2>
          <span aria-hidden className="block gilt-rule" />
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t("bestsellers.scrollLeft")}
            className="size-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
            onClick={() => scroll(-1)}
          >
            <ChevronLeft weight="bold" className="size-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t("bestsellers.scrollRight")}
            className="size-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
            onClick={() => scroll(1)}
          >
            <ChevronRight weight="bold" className="size-5" />
          </Button>
        </div>
      </div>

      <div
        ref={scroller}
        className="relative -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p, i) => (
          <div
            key={p.id}
            className="w-[200px] shrink-0 snap-start sm:w-[230px] lg:w-[244px]"
          >
            <ProductCard
              product={p}
              rank={i + 1}
              bestseller
              initialInWishlist={wishlistIds.has(p.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
