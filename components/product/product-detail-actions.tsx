"use client";

import { useState, useTransition } from "react";
import { Heart, ShoppingBag } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  openCartDrawer,
  useCart,
  useWishlistItem,
} from "@/components/cart/cart-context";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductDetailActions({
  productId,
  stockQuantity,
  initialInWishlist,
}: {
  productId: string;
  stockQuantity: number;
  initialInWishlist: boolean;
}) {
  const t = useTranslations();
  const { add } = useCart();
  const {
    wished,
    pending: pendingWish,
    toggle: handleWish,
  } = useWishlistItem(productId, initialInWishlist);
  const [qty, setQty] = useState(1);
  const [pendingCart, startCart] = useTransition();
  const outOfStock = stockQuantity <= 0;

  function handleAdd() {
    startCart(async () => {
      const res = await add(productId, qty);
      if (res.ok) {
        toast.success(t("product.addedQty", { count: qty }));
        openCartDrawer();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      {/* Inline actions — hidden on mobile because the sticky bar below
          renders an equivalent CTA; previously both were visible so users
          saw two add-to-cart buttons. */}
      <div className="hidden flex-col gap-4 md:flex">
        {!outOfStock ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {t("product.quantity")}
            </span>
            <QuantityStepper
              value={qty}
              onChange={setQty}
              min={1}
              max={Math.max(1, stockQuantity)}
              disabled={pendingCart}
            />
            <span className="text-xs text-muted-foreground">
              {t("product.stockCount", { count: stockQuantity })}
            </span>
          </div>
        ) : null}

        <div className="flex gap-3">
          <Button
            type="button"
            size="lg"
            className="h-12 flex-1 gap-2 text-base"
            disabled={outOfStock || pendingCart}
            onClick={handleAdd}
          >
            <ShoppingBag weight="duotone" className="size-5" />
            {outOfStock ? t("product.outOfStock") : t("product.addToCart")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 gap-2"
            aria-pressed={wished}
            disabled={pendingWish}
            onClick={handleWish}
          >
            <Heart
              weight={wished ? "duotone" : "regular"}
              className={cn(
                "size-5 transition-colors",
                wished && "text-primary",
              )}
            />
            <span className="hidden sm:inline">
              {wished ? t("product.saved") : t("product.wishlist")}
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile sticky bar — reserve the same vertical space below so
          the page bottom isn't covered by the bar. */}
      <div className="pb-24 md:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          {!outOfStock ? (
            <QuantityStepper
              value={qty}
              onChange={setQty}
              min={1}
              max={Math.max(1, stockQuantity)}
              disabled={pendingCart}
              size="md"
            />
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={
              wished ? t("product.saved") : t("product.wishlist")
            }
            aria-pressed={wished}
            disabled={pendingWish}
            onClick={handleWish}
            className="size-12 shrink-0"
          >
            <Heart
              weight={wished ? "duotone" : "regular"}
              className={cn(
                "size-5 transition-colors",
                wished && "text-primary",
              )}
            />
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-12 flex-1 gap-2 text-base"
            disabled={outOfStock || pendingCart}
            onClick={handleAdd}
          >
            <ShoppingBag weight="duotone" className="size-5" />
            {outOfStock ? t("product.outOfStock") : t("product.addToCart")}
          </Button>
        </div>
      </div>
    </>
  );
}
