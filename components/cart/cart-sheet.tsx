"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkle,
  Trash,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getCart, getGuestCartDetails } from "@/lib/actions/cart";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/format";
import { useGuestCart, useHydrated } from "@/lib/guest-store";
import {
  CART_OPEN_EVENT,
  useCart,
} from "@/components/cart/cart-context";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CartData = Awaited<ReturnType<typeof getCart>>;

export function CartSheet({
  count,
  initialGuestCount,
  isAuthenticated,
}: {
  count: number;
  initialGuestCount: number;
  isAuthenticated: boolean;
}) {
  const t = useTranslations();
  const hydrated = useHydrated();
  const { setQty, remove } = useCart();
  const guestLines = useGuestCart((s) => s.lines);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const guestCount = guestLines.reduce((sum, l) => sum + l.quantity, 0);
  // Pre-hydration we trust the cookie-synced SSR count; once the
  // persisted store hydrates we switch to the live value. Authenticated
  // users always use the server-rendered count.
  const liveCount = isAuthenticated
    ? count
    : hydrated
      ? guestCount
      : initialGuestCount;

  useEffect(() => {
    function openSheet() {
      setOpen(true);
    }
    window.addEventListener(CART_OPEN_EVENT, openSheet);
    return () => window.removeEventListener(CART_OPEN_EVENT, openSheet);
  }, []);

  // Load on open, and (for guests) keep the list in sync as the local store
  // changes while the drawer is open.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const promise = isAuthenticated
      ? getCart()
      : getGuestCartDetails(guestLines);
    void promise
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated, guestLines]);

  function handleRemove(productId: string) {
    startTransition(async () => {
      const res = await remove(productId);
      if (res.ok) toast.message(t("cartSheet.removed"));
      else toast.error(res.error);
    });
  }

  function handleQty(productId: string, qty: number) {
    startTransition(async () => {
      const res = await setQty(productId, qty);
      if (!res.ok) toast.error(res.error);
    });
  }

  const items = data?.items ?? [];
  const subtotal = data?.totals.subtotal ?? 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("nav.cartA11y", { count: liveCount })}
            className="relative size-11 rounded-full text-primary transition-colors hover:bg-primary/10 hover:text-primary"
          />
        }
      >
        <ShoppingBag className="size-[1.3rem]" weight="duotone" />
        {liveCount > 0 ? (
          <Badge variant="actionMark" className="absolute -right-0.5 -top-0.5">
            {liveCount > 99 ? "99+" : liveCount}
          </Badge>
        ) : null}
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {t("cartSheet.title")}
            {items.length > 0 ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                {t("cartSheet.items", { count: liveCount })}
              </span>
            ) : null}
          </SheetTitle>
        </SheetHeader>

        {!isAuthenticated && items.length > 0 ? (
          <Link
            href="/login?callbackUrl=/cart"
            onClick={() => setOpen(false)}
            className="mx-4 mb-1 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-primary/10"
          >
            <Sparkle weight="duotone" className="size-3.5 shrink-0 text-primary" />
            <span>{t("cartSheet.guestHint")}</span>
          </Link>
        ) : null}

        <div className="flex-1 overflow-y-auto px-4">
          {loading && !data ? (
            <div className="space-y-4 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-16 rounded-lg" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShoppingBag weight="duotone" className="size-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("cartSheet.empty")}
              </p>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {t("cartSheet.browse")}
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted/40"
                  >
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-medium hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {formatPrice(item.unitPrice)}
                    </span>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => handleQty(item.productId, q)}
                        min={1}
                        max={Math.max(1, Math.min(item.stockQuantity, 20))}
                        disabled={pending}
                      />
                      <span className="text-sm font-semibold tabular-nums">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("common.remove")}
                    disabled={pending}
                    onClick={() => handleRemove(item.productId)}
                    className="-mt-1 self-start text-muted-foreground hover:text-destructive"
                  >
                    <Trash weight="duotone" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <SheetFooter className="gap-3 border-t">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                {remaining > 0
                  ? t("cartSheet.freeShipProgress", {
                      amount: formatPrice(remaining),
                    })
                  : t("cartSheet.freeShipReached")}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("cartSheet.subtotal")}
              </span>
              <span className="font-semibold tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "outline" }), "h-10")}
              >
                {t("cartSheet.viewCart")}
              </Link>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants(), "h-10 gap-1.5")}
              >
                {t("cartSheet.checkout")}
                <ArrowRight weight="bold" className="size-4" />
              </Link>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck weight="duotone" className="size-3.5" />
              {t("cartSheet.secure")}
            </p>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
