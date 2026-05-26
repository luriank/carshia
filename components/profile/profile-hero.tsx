"use client";

import {
  CalendarBlank,
  CurrencyEur,
  Package,
} from "@phosphor-icons/react/ssr";
import { useFormatter, useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/format";

function initials(name?: string | null, email?: string | null) {
  const base = name?.trim() || email?.split("@")[0] || "U";
  return base
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function ProfileHero({
  name,
  email,
  memberSince,
  orderCount,
  totalSpent,
}: {
  name: string;
  email: string;
  memberSince: Date;
  orderCount: number;
  totalSpent: number;
}) {
  const t = useTranslations();
  const fmt = useFormatter();
  const memberSinceLabel = fmt.dateTime(memberSince, {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-card to-card p-5 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-gold/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 ring-2 ring-gold/40 sm:size-20">
            <AvatarFallback className="bg-primary/15 text-xl font-semibold text-primary sm:text-2xl">
              {initials(name, email)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("profile.hello")}
            </p>
            <h1 className="font-display text-2xl font-medium leading-tight sm:text-3xl">
              {name}
            </h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-3 text-center sm:gap-4">
          <div className="rounded-xl border bg-card/80 px-3 py-2.5 shadow-sm backdrop-blur">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Package weight="duotone" className="size-3 text-primary" />
              {t("profile.statsOrders")}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">
              {orderCount}
            </dd>
          </div>
          <div className="rounded-xl border bg-card/80 px-3 py-2.5 shadow-sm backdrop-blur">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <CurrencyEur weight="duotone" className="size-3 text-primary" />
              {t("profile.statsSpent")}
            </dt>
            <dd className="mt-1 truncate text-lg font-semibold tabular-nums sm:text-xl">
              {formatPrice(totalSpent)}
            </dd>
          </div>
          <div className="rounded-xl border bg-card/80 px-3 py-2.5 shadow-sm backdrop-blur">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarBlank weight="duotone" className="size-3 text-primary" />
              {t("profile.statsMember")}
            </dt>
            <dd className="mt-1 text-[13px] font-semibold leading-tight sm:text-sm">
              {memberSinceLabel}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
