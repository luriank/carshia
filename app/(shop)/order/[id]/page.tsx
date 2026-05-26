import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Receipt,
  ShoppingBag,
} from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { getUserOrder } from "@/lib/queries/orders";
import { computeTotals, formatDate, formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusTracker } from "@/components/orders/order-status-tracker";
import { PaymentStatusBadge } from "@/components/orders/payment-status-badge";
import { FadeIn } from "@/components/shared/motion";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.orderDetail") };
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { success } = await searchParams;
  const order = await getUserOrder(id, user.id);
  if (!order) notFound();
  const t = await getTranslations();

  const subtotal = order.items.reduce(
    (s, i) => s + i.price * i.quantity,
    0,
  );
  const totals = computeTotals(subtotal);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/orders"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft weight="bold" className="size-4" />
        {t("orderDetail.backToOrders")}
      </Link>

      {success ? (
        order.paymentMode === "CARD" && order.paymentStatus === "UNPAID" ? (
          <FadeIn className="mb-6">
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-transparent p-6">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold/20 text-primary">
                  <CheckCircle weight="duotone" className="size-7" />
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">
                    {t("orderDetail.processingTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("orderDetail.processingDesc")}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        ) : order.paymentMode === "CARD" &&
          order.paymentStatus === "FAILED" ? (
          <FadeIn className="mb-6">
            <div className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/15 via-destructive/10 to-transparent p-6">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <CheckCircle weight="duotone" className="size-7 rotate-180" />
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">
                    {t("orderDetail.failedTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("orderDetail.failedDesc")}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        ) : (
          <FadeIn className="mb-6">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-transparent p-6">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CheckCircle weight="duotone" className="size-7" />
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">
                    {t("orderDetail.successTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("orderDetail.successDesc")}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        )
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[2rem] leading-tight font-medium sm:text-[2.5rem]">
            {t("orderDetail.orderNo", {
              id: order.id.slice(-8).toUpperCase(),
            })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("orderDetail.placedOn", {
              date: formatDate(order.createdAt),
              method:
                order.paymentMode === "COD"
                  ? t("orderDetail.cod")
                  : t("orderDetail.card"),
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {order.paymentMode === "CARD" ? (
            <PaymentStatusBadge
              status={order.paymentStatus}
              className="px-3 py-1 text-sm"
            />
          ) : null}
          <OrderStatusBadge
            status={order.status}
            className="px-3 py-1 text-sm"
          />
        </div>
      </div>

      <div className="mt-6">
        <OrderStatusTracker status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-4">
              <ShoppingBag weight="duotone" className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">
                {t("orderDetail.items", { count: order.items.length })}
              </h2>
            </div>
            <ul className="divide-y">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 p-5">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted/40">
                    <Image
                      src={i.thumbnail}
                      alt={i.title}
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">
                      {i.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {i.quantity} × {formatPrice(i.price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <MapPin weight="duotone" className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">
                {t("orderDetail.deliveryAddress")}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                {order.address.fullName}
              </span>
              <br />
              {order.address.street}
              <br />
              {order.address.city}
              {order.address.state ? `, ${order.address.state}` : ""}{" "}
              {order.address.postalCode}
              <br />
              {order.address.country}
              <br />
              {order.address.phone}
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Receipt weight="duotone" className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">
                {t("orderDetail.summary")}
              </h2>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("orderDetail.subtotal")}
                </dt>
                <dd className="tabular-nums">
                  {formatPrice(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("orderDetail.shipping")}
                </dt>
                <dd className="tabular-nums">
                  {totals.shipping === 0
                    ? t("common.free")
                    : formatPrice(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("orderDetail.tax")}
                </dt>
                <dd className="tabular-nums">{formatPrice(totals.tax)}</dd>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-base font-semibold">
                <dt>{t("orderDetail.total")}</dt>
                <dd className="tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>

          {order.status === "DELIVERED" ? (
            <p className="mt-3 px-1 text-center text-xs text-muted-foreground">
              {t("orderDetail.deliveredNote")}
            </p>
          ) : null}

          <div className="mt-4 grid gap-2">
            <Link
              href="/orders"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10",
              )}
            >
              {t("orderDetail.backToOrders")}
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-10",
              )}
            >
              {t("orderDetail.continueShopping")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
