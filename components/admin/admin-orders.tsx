"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateOrderStatus } from "@/lib/actions/admin";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminOrder = {
  id: string;
  total: number;
  status: string;
  paymentMode: string;
  paymentStatus: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  itemCount: number;
};

const STATUSES = [
  "PENDING",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
] as const;

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  UNPAID: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  PAID: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  FAILED: "bg-destructive/15 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
};

export function AdminOrders({ orders }: { orders: AdminOrder[] }) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeStatus(orderId: string, status: string | null) {
    if (!status) return;
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status);
      if (res.ok) {
        toast.success(t("admin.orders.statusUpdated"));
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[1.875rem] font-medium sm:text-[2.25rem]">
          {t("admin.orders.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.orders.count", { count: orders.length })}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.orders.colOrder")}</TableHead>
              <TableHead>{t("admin.orders.colCustomer")}</TableHead>
              <TableHead>{t("admin.orders.colDate")}</TableHead>
              <TableHead className="text-right">
                {t("admin.orders.colItems")}
              </TableHead>
              <TableHead className="text-right">
                {t("admin.orders.colTotal")}
              </TableHead>
              <TableHead>{t("admin.orders.colPayment")}</TableHead>
              <TableHead>{t("admin.orders.colStatus")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {t("admin.orders.none")}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    #{o.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{o.customerName}</span>
                      <span className="text-xs text-muted-foreground">
                        {o.customerEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {o.itemCount}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">
                    {formatPrice(o.total)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex flex-col items-start gap-1">
                      <span>
                        {o.paymentMode === "COD"
                          ? t("admin.orders.cash")
                          : t("admin.orders.card")}
                      </span>
                      {o.paymentMode === "CARD" ? (
                        <span
                          className={cn(
                            "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                            PAYMENT_STATUS_STYLES[o.paymentStatus] ??
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {t(
                            `payment.status.${o.paymentStatus}` as "payment.status.PAID",
                          )}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(v) => changeStatus(o.id, v)}
                    >
                      <SelectTrigger
                        className="h-8 w-36"
                        disabled={pending}
                        aria-label="Order status"
                      >
                        <span className="text-sm">
                          {t(`orders.status.${o.status}`)}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`orders.status.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
