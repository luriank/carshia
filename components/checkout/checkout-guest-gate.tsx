"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SignIn as LogIn, ShoppingBag, UserPlus } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { getGuestCartDetails } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/format";
import { useGuestCart, useHydrated } from "@/lib/guest-store";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/motion";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CartData = Awaited<ReturnType<typeof getGuestCartDetails>>;

export function CheckoutGuestGate() {
  const t = useTranslations();
  const hydrated = useHydrated();
  const guestLines = useGuestCart((s) => s.lines);
  const [data, setData] = useState<CartData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getGuestCartDetails(guestLines).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [guestLines]);

  if (!hydrated || !data) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={t("checkout.emptyCart")}
        description={t("cart.emptyDesc")}
        action={
          <Link href="/" className={cn(buttonVariants(), "h-10 px-5")}>
            {t("checkout.browseProducts")}
          </Link>
        }
      />
    );
  }

  return (
    <FadeIn className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-12">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogIn weight="duotone" className="size-6" />
        </span>
        <h2 className="mt-5 font-display text-[1.75rem] font-medium">
          {t("checkout.guestTitle")}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t("checkout.guestDesc")}
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Link
            href="/login?callbackUrl=/checkout"
            className={cn(buttonVariants({ size: "lg" }), "h-12 gap-2")}
          >
            <LogIn weight="duotone" className="size-4" />
            {t("checkout.guestSignIn")}
          </Link>
          <Link
            href="/signup?callbackUrl=/checkout"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 gap-2",
            )}
          >
            <UserPlus weight="duotone" className="size-4" />
            {t("checkout.guestCreate")}
          </Link>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          {t("checkout.guestNote")}
        </p>
      </div>

      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-display text-xl font-medium">
            {t("checkout.orderSummary")}
          </h2>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("checkout.itemsTitle")}
          </p>
          <ul className="max-h-56 space-y-3 overflow-y-auto">
            {data.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted/40">
                  <Image
                    src={i.thumbnail}
                    alt={i.title}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm">{i.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.quantity} × {formatPrice(i.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {formatPrice(i.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
          <Separator />
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t("checkout.subtotal")}
              </dt>
              <dd className="tabular-nums">
                {formatPrice(data.totals.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t("checkout.shipping")}
              </dt>
              <dd className="tabular-nums">
                {data.totals.shipping === 0
                  ? t("common.free")
                  : formatPrice(data.totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("checkout.tax")}</dt>
              <dd className="tabular-nums">{formatPrice(data.totals.tax)}</dd>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-base font-semibold">
              <dt>{t("checkout.total")}</dt>
              <dd className="tabular-nums">{formatPrice(data.totals.total)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </FadeIn>
  );
}
