import { Check, Clock, Package as PackageCheck, Truck, XCircle } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "PENDING", icon: Clock },
  { key: "DISPATCHED", icon: Truck },
  { key: "DELIVERED", icon: PackageCheck },
] as const;

export async function OrderStatusTracker({ status }: { status: string }) {
  const t = await getTranslations();

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
        <XCircle weight="duotone" className="size-5 shrink-0 text-destructive" />
        <p className="text-sm font-medium text-destructive">
          {t("orderDetail.cancelledNote")}
        </p>
      </div>
    );
  }

  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status),
  );

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-sm font-semibold">{t("orderDetail.tracking")}</h2>
      <ol className="flex">
        {STEPS.map((step, i) => {
          const reached = i <= currentIndex;
          const done = i < currentIndex;
          const current = i === currentIndex;
          const Icon = done ? Check : step.icon;
          return (
            <li key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i === 0
                      ? "opacity-0"
                      : reached
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    reached
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground",
                    current &&
                      "ring-4 ring-primary/15 dark:ring-primary/25",
                  )}
                >
                  <Icon weight={done ? "bold" : "duotone"} className="size-5" />
                </span>
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i === STEPS.length - 1
                      ? "opacity-0"
                      : i < currentIndex
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
              </div>
              <span
                className={cn(
                  "mt-3 text-center text-xs sm:text-sm",
                  reached
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {t(`orders.status.${step.key}` as "orders.status.PENDING")}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
