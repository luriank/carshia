"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Heart, ShoppingBag, Sparkle, Trash } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  getGuestWishlistDetails,
  getWishlist,
  moveWishlistItemToCart,
  updateWishlistNote,
} from "@/lib/actions/wishlist";
import { useGuestWishlist, useHydrated } from "@/lib/guest-store";
import {
  openCartDrawer,
  useCart,
  useWishlistActions,
} from "@/components/cart/cart-context";
import { PriceTag } from "@/components/shared/price-tag";
import { RatingStars } from "@/components/shared/rating-stars";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type WishlistData = Awaited<ReturnType<typeof getWishlist>>;

export function WishlistView({
  initial,
  isAuthenticated,
}: {
  initial: WishlistData;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const t = useTranslations();
  const hydrated = useHydrated();
  const { add } = useCart();
  const { remove } = useWishlistActions();
  const guestIds = useGuestWishlist((s) => s.ids);
  const guestRemove = useGuestWishlist((s) => s.remove);
  const [items, setItems] = useState<WishlistData>(initial);
  const [ready, setReady] = useState(isAuthenticated);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (isAuthenticated) return;
    let cancelled = false;
    void getGuestWishlistDetails(guestIds).then((d) => {
      if (cancelled) return;
      setItems(d);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, guestIds]);

  async function refreshAuthed() {
    setItems(await getWishlist());
    router.refresh();
  }

  function move(productId: string, title: string) {
    startTransition(async () => {
      if (isAuthenticated) {
        const res = await moveWishlistItemToCart(productId);
        if (res.ok) toast.success(t("wishlist.moved", { title }));
        else toast.error(res.error);
        await refreshAuthed();
        return;
      }
      const res = await add(productId, 1);
      if (res.ok) {
        guestRemove(productId);
        toast.success(t("wishlist.moved", { title }));
        openCartDrawer();
      } else {
        toast.error(res.error);
      }
    });
  }

  function removeItem(productId: string) {
    startTransition(async () => {
      const res = await remove(productId);
      if (res.ok) toast.message(t("wishlist.removed"));
      else toast.error(res.error);
      if (isAuthenticated) await refreshAuthed();
    });
  }

  function saveNote(productId: string, current: string, next: string) {
    if (current.trim() === next.trim()) return;
    startTransition(async () => {
      const res = await updateWishlistNote(productId, next);
      if (res.ok) toast.success(t("wishlist.noteSaved"));
      else toast.error(res.error);
    });
  }

  if (!ready && !hydrated) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={t("wishlist.empty")}
        description={t("wishlist.emptyDesc")}
        action={
          <Link href="/" className={cn(buttonVariants(), "h-10")}>
            {t("wishlist.discover")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("wishlist.saved", { count: items.length })}
        </p>
        {!isAuthenticated ? (
          <Link
            href="/login?callbackUrl=/wishlist"
            className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10"
          >
            <Sparkle weight="duotone" className="size-3.5 shrink-0 text-primary" />
            {t("wishlist.guestHint")}
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-xl border bg-card"
          >
            <Link
              href={`/product/${item.slug}`}
              className="relative aspect-square bg-muted/40"
            >
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-contain p-4"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <Link
                href={`/product/${item.slug}`}
                className="line-clamp-2 text-sm font-medium hover:text-primary"
              >
                {item.title}
              </Link>
              <RatingStars rating={item.rating} size="sm" />
              <PriceTag
                price={item.price}
                discountPercentage={item.discountPercentage}
                size="md"
              />
              {isAuthenticated ? (
                <Textarea
                  defaultValue={item.note ?? ""}
                  placeholder={t("wishlist.notePlaceholder")}
                  rows={2}
                  aria-label={t("a11y.noteFor", { title: item.title })}
                  disabled={pending}
                  onBlur={(e) =>
                    saveNote(item.productId, item.note ?? "", e.target.value)
                  }
                  className="mt-1 text-xs"
                />
              ) : null}
              <div className="mt-auto flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="h-9 flex-1 gap-1.5"
                  disabled={pending || item.stockQuantity <= 0}
                  onClick={() => move(item.productId, item.title)}
                >
                  <ShoppingBag weight="duotone" className="size-4" />
                  {item.stockQuantity <= 0
                    ? t("wishlist.outOfStock")
                    : t("wishlist.moveToCart")}
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-9"
                  aria-label={t("a11y.removeFromWishlist", {
                    title: item.title,
                  })}
                  disabled={pending}
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash weight="duotone" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
