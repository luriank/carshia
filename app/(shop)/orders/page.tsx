import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CaretRight as ChevronRight, Package } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { getUserOrders } from "@/lib/queries/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.orders") };
}

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await getUserOrders(user.id);
  const t = await getTranslations();
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader
        title={t("orders.title")}
        description={t("orders.desc")}
        className="mb-8"
        actions={
          orders.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium shadow-sm">
                <Package weight="duotone" className="size-4 text-primary" />
                {t("orders.count", { count: orders.length })}
              </span>
              <span className="hidden items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm shadow-sm sm:inline-flex">
                <span className="text-muted-foreground">
                  {t("orders.totalSpent")}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatPrice(totalSpent)}
                </span>
              </span>
            </div>
          ) : null
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t("orders.empty")}
          description={t("orders.emptyDesc")}
          action={
            <Link href="/" className={cn(buttonVariants(), "h-10 px-5")}>
              {t("orders.startShopping")}
            </Link>
          }
        />
      ) : (
        <StaggerContainer className="space-y-4">
          {orders.map((o) => {
            const shown = o.items.slice(0, 4);
            const extra = o.items.length - shown.length;
            return (
              <StaggerItem key={o.id}>
                <Link
                  href={`/order/${o.id}`}
                  className="group block overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-border"
                >
                  <div className="flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Package weight="duotone" className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">
                          {t("orders.orderNo", {
                            id: o.id.slice(-8).toUpperCase(),
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(o.createdAt)}
                        </p>
                      </div>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </div>

                  <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {shown.map((it) => (
                          <div
                            key={it.id}
                            className="relative size-14 overflow-hidden rounded-xl border-2 border-card bg-muted/40 shadow-sm"
                          >
                            <Image
                              src={it.thumbnail}
                              alt={it.title}
                              fill
                              sizes="56px"
                              className="object-contain p-1.5"
                            />
                          </div>
                        ))}
                        {extra > 0 ? (
                          <div className="flex size-14 items-center justify-center rounded-xl border-2 border-card bg-muted text-xs font-semibold text-muted-foreground shadow-sm">
                            {t("orders.moreItems", { count: extra })}
                          </div>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("orders.items", { count: o.itemCount })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <div className="text-right">
                        <p className="text-lg font-semibold tabular-nums">
                          {formatPrice(o.total)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        {t("orders.viewDetails")}
                        <ChevronRight weight="bold" className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
