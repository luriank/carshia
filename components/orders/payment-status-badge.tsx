import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  UNPAID: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  PAID: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  FAILED: "bg-destructive/15 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
};

const STATUSES = ["UNPAID", "PAID", "FAILED", "REFUNDED"] as const;

export async function PaymentStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const t = await getTranslations();
  const label = (STATUSES as readonly string[]).includes(status)
    ? t(`payment.status.${status}` as "payment.status.PAID")
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
