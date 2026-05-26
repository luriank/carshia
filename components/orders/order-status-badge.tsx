import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  DISPATCHED: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  DELIVERED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-destructive/15 text-destructive",
};

const STATUSES = ["PENDING", "DISPATCHED", "DELIVERED", "CANCELLED"] as const;

export async function OrderStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const t = await getTranslations();
  const label = (STATUSES as readonly string[]).includes(status)
    ? t(`orders.status.${status}` as "orders.status.PENDING")
    : status;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
