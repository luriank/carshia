"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Eye, Heart, ShoppingBag } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ProductListItem } from "@/lib/types";
import {
  openCartDrawer,
  useCart,
  useWishlistItem,
} from "@/components/cart/cart-context";
import { PriceTag } from "@/components/shared/price-tag";
import { RatingStars } from "@/components/shared/rating-stars";
import { StaggerItem } from "@/components/shared/motion";
import { ProductQuickView } from "@/components/product/product-quick-view";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  initialInWishlist = false,
  rank,
  bestseller = false,
}: {
  product: ProductListItem;
  initialInWishlist?: boolean;
  rank?: number;
  bestseller?: boolean;
}) {
  const t = useTranslations();
  const { add } = useCart();
  const {
    wished,
    pending: pendingWish,
    toggle,
  } = useWishlistItem(product.id, initialInWishlist);
  const [heartBeat, setHeartBeat] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [pendingCart, startCart] = useTransition();
  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity <= 5;

  function handleAddToCart() {
    startCart(async () => {
      const res = await add(product.id, 1);
      if (res.ok) {
        toast.success(t("product.addedToCart", { title: product.title }));
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1600);
        openCartDrawer();
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleToggleWishlist() {
    setHeartBeat(true);
    setTimeout(() => setHeartBeat(false), 350);
    toggle();
  }

  return (
    <StaggerItem className="group/card relative isolate flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--gold)_55%,transparent)] hover:ring-1 hover:ring-gold/35">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gradient-to-br from-muted/60 to-muted/20"
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
          className={cn(
            "object-contain p-3 transition-all duration-500 will-change-transform group-hover/card:scale-[1.06]",
            product.hoverImage &&
              "group-hover/card:scale-100 group-hover/card:opacity-0",
          )}
        />
        {product.hoverImage ? (
          <Image
            src={product.hoverImage}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            className="object-contain p-3 opacity-0 transition-all duration-500 will-change-transform group-hover/card:scale-[1.06] group-hover/card:opacity-100"
          />
        ) : null}

        <span className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -inset-y-4 -left-2/3 w-2/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/card:translate-x-[260%]" />
        </span>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {bestseller ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-2xs font-semibold text-gold-foreground shadow-sm">
              {rank ? `#${rank} ` : ""}
              {t("product.bestseller")}
            </span>
          ) : product.discountPercentage > 0 ? (
            <span className="inline-flex w-fit rounded-full bg-primary px-2 py-0.5 text-2xs font-semibold text-primary-foreground shadow-sm">
              −{Math.round(product.discountPercentage)}%
            </span>
          ) : null}
          {outOfStock ? (
            <span className="inline-flex w-fit rounded-full bg-background/90 px-2 py-0.5 text-2xs font-medium text-muted-foreground ring-1 ring-border">
              {t("product.soldOut")}
            </span>
          ) : lowStock ? (
            <span className="inline-flex w-fit rounded-full bg-gold/20 px-2 py-0.5 text-2xs font-medium text-gold-foreground ring-1 ring-gold/30">
              {t("product.onlyLeft", { count: product.stockQuantity })}
            </span>
          ) : null}
        </div>

        {/* On touch the hover-overlay add-to-cart is unreachable, so we
            render it inline below the card for touch users. On fine-pointer
            devices the overlay still slides up on hover. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full p-3 opacity-0 transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:block">
          <Button
            type="button"
            className="h-10 w-full gap-2 shadow-lg"
            disabled={outOfStock || pendingCart}
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
          >
            {justAdded ? (
              <>
                <Check weight="bold" className="size-4" /> {t("product.added")}
              </>
            ) : (
              <>
                <ShoppingBag weight="duotone" className="size-4" />
                {outOfStock ? t("product.soldOut") : t("product.addToCart")}
              </>
            )}
          </Button>
        </div>
      </Link>

      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          type="button"
          aria-label={
            wished
              ? t("product.removeFromWishlist")
              : t("product.addToWishlist")
          }
          aria-pressed={wished}
          disabled={pendingWish}
          onClick={handleToggleWishlist}
          className="grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur-sm transition-all hover:scale-110 hover:bg-background"
        >
          <Heart
            weight={wished ? "duotone" : "regular"}
            className={cn(
              "size-4 transition-all duration-300",
              wished && "text-primary",
              heartBeat && "scale-125",
            )}
          />
        </button>
        {/* Quick view: hover/focus only on fine-pointer devices; always
            visible on touch so mobile users can preview without leaving
            the catalog. */}
        <ProductQuickView
          product={product}
          initialInWishlist={wished}
          trigger={
            <button
              type="button"
              aria-label={t("product.quickView")}
              className="grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur-sm transition-all hover:scale-110 hover:bg-background focus-visible:translate-y-0 focus-visible:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:translate-y-1 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:translate-y-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:opacity-100"
            >
              <Eye weight="duotone" className="size-4" />
            </button>
          }
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-muted-foreground">
            <span aria-hidden className="size-1 rounded-full bg-gold" />
            {product.brandName}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 font-heading text-[15px] font-medium leading-snug tracking-[-0.005em] transition-colors hover:text-primary"
          >
            {product.title}
          </Link>
        </div>
        <RatingStars
          rating={product.rating}
          count={product.reviewCount}
          size="sm"
        />
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <PriceTag
            price={product.price}
            discountPercentage={product.discountPercentage}
            size="md"
          />
          {/* Touch-only inline add-to-cart so mobile users have a tap
              path without the (unreachable) hover overlay. */}
          <Button
            type="button"
            size="icon"
            aria-label={t("product.addToCart")}
            className="size-9 shrink-0 rounded-full shadow-sm [@media(hover:hover)_and_(pointer:fine)]:hidden"
            disabled={outOfStock || pendingCart}
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
          >
            {justAdded ? <Check weight="bold" className="size-4" /> : <ShoppingBag weight="duotone" className="size-4" />}
          </Button>
        </div>
      </div>
    </StaggerItem>
  );
}
