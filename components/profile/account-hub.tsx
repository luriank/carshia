"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  CaretRight as ChevronRight,
  CreditCard,
  Heart,
  IdentificationCard,
  MapPin,
  Package,
  SignOut,
} from "@phosphor-icons/react/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react/lib";
import { useTranslations } from "next-intl";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type HubCard = {
  href: string;
  icon: PhosphorIcon;
  titleKey: string;
  descKey: string;
  hint?: string;
  scroll: boolean;
};

function HubTile({ card }: { card: HubCard }) {
  const t = useTranslations();
  const Icon = card.icon;
  return (
    <Link
      href={card.href}
      scroll={card.scroll ? false : undefined}
      className={cn(
        "group relative flex items-start gap-4 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm",
        "ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-border",
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary/15">
        <Icon weight="duotone" className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold leading-tight">
            {t(card.titleKey)}
          </p>
          <ChevronRight
            weight="bold"
            className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(card.descKey)}
        </p>
        {card.hint ? (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
            {card.hint}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function AccountHub({
  orderCount,
  addressCount,
  wishlistCount,
  paymentMethodCount,
}: {
  orderCount: number;
  addressCount: number;
  wishlistCount: number;
  paymentMethodCount: number;
}) {
  const t = useTranslations();
  const [, startTransition] = useTransition();

  const cards: HubCard[] = [
    {
      href: "/orders",
      icon: Package,
      titleKey: "profile.hub.ordersTitle",
      descKey: "profile.hub.ordersDesc",
      hint: t("orders.count", { count: orderCount }),
      scroll: true,
    },
    {
      href: "#payment-methods",
      icon: CreditCard,
      titleKey: "profile.hub.paymentTitle",
      descKey: "profile.hub.paymentDesc",
      hint:
        paymentMethodCount > 0
          ? t("profile.hub.paymentSaved", { count: paymentMethodCount })
          : t("profile.hub.paymentNone"),
      scroll: false,
    },
    {
      href: "#addresses",
      icon: MapPin,
      titleKey: "profile.hub.addressesTitle",
      descKey: "profile.hub.addressesDesc",
      hint:
        addressCount > 0
          ? t("profile.hub.addressesSaved", { count: addressCount })
          : t("profile.hub.addressesNone"),
      scroll: false,
    },
    {
      href: "#account-details",
      icon: IdentificationCard,
      titleKey: "profile.hub.accountTitle",
      descKey: "profile.hub.accountDesc",
      scroll: false,
    },
    {
      href: "/wishlist",
      icon: Heart,
      titleKey: "profile.hub.wishlistTitle",
      descKey: "profile.hub.wishlistDesc",
      hint:
        wishlistCount > 0
          ? t("wishlist.saved", { count: wishlistCount })
          : undefined,
      scroll: true,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <HubTile key={c.href} card={c} />
      ))}
      <button
        type="button"
        onClick={() => startTransition(() => signOutAction())}
        className={cn(
          "group relative flex items-start gap-4 overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm",
          "ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:border-destructive/40 hover:shadow-md hover:ring-destructive/30",
        )}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/15">
          <SignOut weight="duotone" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">
            {t("profile.hub.signOutTitle")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("profile.hub.signOutDesc")}
          </p>
        </div>
        <ChevronRight
          weight="bold"
          className="size-4 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-destructive"
        />
      </button>
    </div>
  );
}
