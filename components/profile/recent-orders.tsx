import Image from "next/image";
import Link from "next/link";
import {
  CaretRight as ChevronRight,
  Package,
} from "@phosphor-icons/react/ssr";
import { getTranslations, getFormatter } from "next-intl/server";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/generated/prisma/client";

type RecentOrder = {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  itemCount: number;
  items: { id: string; thumbnail: string; title: string; quantity: number }[];
};

export async function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  const t = await getTranslations();
  const fmt = await getFormatter();

  if (orders.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-medium">
            {t("profile.recentOrdersTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("profile.recentOrdersDesc")}
          </p>
        </div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t("profile.viewAllOrders")}
          <ChevronRight weight="bold" className="size-4" />
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {orders.slice(0, 3).map((o) => {
          const shown = o.items.slice(0, 3);
          const extra = o.items.length - shown.length;
          return (
            <li key={o.id}>
              <Link
                href={`/order/${o.id}`}
                className="group flex h-full flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-border"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Package weight="duotone" className="size-3.5" />
                    </span>
                    <span className="text-xs font-semibold tabular-nums">
                      #{o.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>

                <div className="flex -space-x-2.5">
                  {shown.map((it) => (
                    <div
                      key={it.id}
                      className="relative size-12 overflow-hidden rounded-xl border-2 border-card bg-muted/40 shadow-sm"
                    >
                      <Image
                        src={it.thumbnail}
                        alt={it.title}
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    </div>
                  ))}
                  {extra > 0 ? (
                    <div className="flex size-12 items-center justify-center rounded-xl border-2 border-card bg-muted text-[11px] font-semibold text-muted-foreground shadow-sm">
                      +{extra}
                    </div>
                  ) : null}
                </div>

                <div className="mt-auto flex items-end justify-between">
                  <span className="text-xs text-muted-foreground">
                    {fmt.dateTime(o.createdAt, {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(o.total)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
