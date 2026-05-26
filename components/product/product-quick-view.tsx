"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Heart, ShoppingBag } from "@phosphor-icons/react/ssr";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ProductQuickView({
  product,
  initialInWishlist = false,
  trigger,
}: {
  product: ProductListItem;
  initialInWishlist?: boolean;
  trigger: React.ReactElement;
}) {
  const t = useTranslations();
  const { add } = useCart();
  const {
    wished,
    pending: pendingWish,
    toggle: handleToggleWishlist,
  } = useWishlistItem(product.id, initialInWishlist);
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

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>{product.brandName}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-2">
          <Link
            href={`/product/${product.slug}`}
            className="relative block aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-muted/60 to-muted/20"
          >
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 90vw, 40vw"
              className="object-contain p-4"
            />
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.discountPercentage > 0 ? (
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
          </Link>

          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <p className="text-2xs font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-muted-foreground">
                {product.brandName}
              </p>
              <Link
                href={`/product/${product.slug}`}
                className="font-display text-[1.625rem] font-medium leading-tight text-balance transition-colors hover:text-primary"
              >
                {product.title}
              </Link>
            </div>
            <RatingStars
              rating={product.rating}
              count={product.reviewCount}
              size="sm"
            />
            <PriceTag
              price={product.price}
              discountPercentage={product.discountPercentage}
              size="lg"
            />
            <div className="mt-auto flex gap-3 pt-2">
              <Button
                type="button"
                size="lg"
                className="h-11 flex-1 gap-2"
                disabled={outOfStock || pendingCart}
                onClick={handleAddToCart}
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
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 gap-2"
                aria-label={
                  wished
                    ? t("product.removeFromWishlist")
                    : t("product.addToWishlist")
                }
                aria-pressed={wished}
                disabled={pendingWish}
                onClick={handleToggleWishlist}
              >
                <Heart
                  weight={wished ? "duotone" : "regular"}
                  className={cn(
                    "size-4 transition-colors",
                    wished && "text-primary",
                  )}
                />
                <span className="hidden sm:inline">
                  {wished ? t("product.saved") : t("product.wishlist")}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
