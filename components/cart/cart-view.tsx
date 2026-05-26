"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  ArrowRight,
  ShieldCheck,
  ShoppingCart,
  Sparkle,
  Trash,
  Truck,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getCart, getGuestCartDetails } from "@/lib/actions/cart";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/format";
import { useGuestCart, useHydrated } from "@/lib/guest-store";
import { useCart } from "@/components/cart/cart-context";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CartData = Awaited<ReturnType<typeof getCart>>;

export function CartView({
  initial,
  isAuthenticated,
}: {
  initial: CartData;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const t = useTranslations();
  const hydrated = useHydrated();
  const { setQty, remove } = useCart();
  const guestLines = useGuestCart((s) => s.lines);
  const [data, setData] = useState<CartData>(initial);
  const [ready, setReady] = useState(isAuthenticated);
  const [pending, startTransition] = useTransition();

  // Guests: hydrate the cart from localStorage and keep it in sync with the
  // store (covers quantity edits here and adds made elsewhere).
  useEffect(() => {
    if (isAuthenticated) return;
    let cancelled = false;
    void getGuestCartDetails(guestLines).then((d) => {
      if (cancelled) return;
      setData(d);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, guestLines]);

  async function refreshAuthed() {
    setData(await getCart());
    router.refresh();
  }

  function changeQty(productId: string, qty: number) {
    startTransition(async () => {
      const res = await setQty(productId, qty);
      if (!res.ok) toast.error(res.error);
      if (isAuthenticated) await refreshAuthed();
    });
  }

  function removeItem(productId: string) {
    startTransition(async () => {
      const res = await remove(productId);
      if (res.ok) toast.message(t("cart.removed"));
      else toast.error(res.error);
      if (isAuthenticated) await refreshAuthed();
    });
  }

  if (!ready && !hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title={t("cart.empty")}
        description={t("cart.emptyDesc")}
        action={
          <Link href="/" className={cn(buttonVariants(), "h-10 px-5")}>
            {t("cart.startShopping")}
          </Link>
        }
      />
    );
  }

  const itemCount = data.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = data.totals.subtotal;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <FadeIn className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        {!isAuthenticated ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkle weight="duotone" className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{t("cart.guestTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("cart.guestDesc")}
                </p>
              </div>
            </div>
            <Link
              href="/login?callbackUrl=/cart"
              className={cn(buttonVariants({ size: "sm" }), "h-9")}
            >
              {t("cart.guestSignIn")}
            </Link>
          </div>
        ) : null}

        <p className="mb-3 text-sm text-muted-foreground">
          {t("cart.itemCount", { count: itemCount })}
        </p>
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 p-4 transition-colors hover:bg-muted/30 sm:p-5"
            >
              <Link
                href={`/product/${item.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl border bg-muted/40"
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/product/${item.slug}`}
                    className="line-clamp-2 text-sm font-medium hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("common.remove")}
                    disabled={pending}
                    onClick={() => removeItem(item.productId)}
                    className="-mr-1 -mt-1 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash weight="duotone" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("cart.each", { price: formatPrice(item.unitPrice) })}
                </span>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(q) => changeQty(item.productId, q)}
                    min={1}
                    max={Math.max(1, item.stockQuantity)}
                    disabled={pending}
                  />
                  <span className="text-base font-semibold tabular-nums">
                    {formatPrice(item.lineTotal)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-display text-xl font-medium">
            {t("cart.orderSummary")}
          </h2>

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">
              {remaining > 0
                ? t("cart.freeShipProgress", {
                    amount: formatPrice(remaining),
                  })
                : t("cart.freeShipReached")}
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <dl className="space-y-2.5 text-sm">
            <Row
              label={t("cart.subtotal")}
              value={formatPrice(data.totals.subtotal)}
            />
            <Row
              label={t("cart.shipping")}
              value={
                data.totals.shipping === 0
                  ? t("common.free")
                  : formatPrice(data.totals.shipping)
              }
            />
            <Row label={t("cart.tax")} value={formatPrice(data.totals.tax)} />
            <Separator className="my-2" />
            <Row
              label={t("cart.total")}
              value={formatPrice(data.totals.total)}
              strong
            />
          </dl>

          {data.totals.shipping === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-gold/15 px-3 py-2 text-xs font-medium text-gold-foreground">
              <Truck weight="duotone" className="size-3.5" />
              {t("cart.freeShippingHint")}
            </div>
          ) : null}

          <Link
            href="/checkout"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 w-full gap-2 text-sm",
            )}
          >
            {t("cart.checkout")}
            <ArrowRight weight="bold" className="size-4" />
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full",
            )}
          >
            {t("cart.continueShopping")}
          </Link>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck weight="duotone" className="size-3.5" />
            {t("cart.secure")}
          </p>
        </div>
      </aside>
    </FadeIn>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        strong && "text-base font-semibold",
      )}
    >
      <dt className={cn(!strong && "text-muted-foreground")}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
