"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  CreditCard,
  Heart,
  SquaresFour,
  SignOut,
  List,
  Package,
  ShoppingBag,
  Storefront,
  User as UserIcon,
} from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { brand } from "@/brand.config";
import { signOutAction } from "@/lib/actions/auth";
import { SearchBar } from "@/components/layout/search-bar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function initials(name?: string | null, email?: string | null) {
  const base = name?.trim() || email?.split("@")[0] || "U";
  return base
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

type SessionUser = {
  name?: string | null;
  email?: string | null;
  isAdmin?: boolean;
} | null;

const links = [
  {
    href: "/",
    labelKey: "nav.shop",
    icon: Storefront,
  },
  {
    href: "/wishlist",
    labelKey: "nav.wishlist",
    icon: Heart,
  },
  {
    href: "/cart",
    labelKey: "nav.cart",
    icon: ShoppingBag,
  },
  {
    href: "/orders",
    labelKey: "nav.orders",
    icon: Package,
  },
  {
    href: "/profile",
    labelKey: "nav.profile",
    icon: UserIcon,
  },
] as const;

export function MobileNav({
  user,
  variant = "default",
}: {
  user: SessionUser;
  /** `"default"` — round icon-only trigger, mobile-only (md:hidden).
   *  `"header"` — text-label "All" trigger for the desktop sub-nav row. */
  variant?: "default" | "header";
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const close = () => setOpen(false);

  const triggerEl =
    variant === "header" ? (
      <button
        type="button"
        aria-label={t("nav.menu")}
        className="my-1 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[13px] font-semibold text-foreground ring-1 ring-transparent transition-colors hover:bg-primary/5 hover:ring-primary/10"
      >
        <List weight="bold" className="size-4 text-gold" />
        {t("nav.browseAll")}
      </button>
    ) : (
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("nav.menu")}
        className="size-11 rounded-full text-primary transition-colors hover:bg-muted md:hidden"
      />
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={triggerEl}>
        {variant === "header" ? null : (
          <List weight="duotone" className="size-[1.4rem]" />
        )}
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col gap-0">
        <SheetHeader>
          <SheetTitle>{brand.fullName}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {user ? (
            <Link
              href="/profile"
              onClick={close}
              className="mb-3 flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/40"
            >
              <Avatar className="size-10 ring-2 ring-gold/40">
                <AvatarFallback className="bg-gradient-to-br from-primary/15 to-gold/25 text-sm font-semibold text-primary">
                  {initials(user.name, user.email)}
                </AvatarFallback>
                <AvatarBadge className="size-2.5 bg-emerald-500" aria-hidden />
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold leading-tight">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </Link>
          ) : null}
          <SearchBar className="mb-3" onSubmitted={close} />
          {links.map(({ href, labelKey, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Icon weight="duotone" className="size-4 text-primary" />
              {t(labelKey)}
            </Link>
          ))}
          {user ? (
            <Link
              href="/profile#payment-methods"
              onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <CreditCard weight="duotone" className="size-4 text-primary" />
              {t("payments.cards.title")}
            </Link>
          ) : null}
          {user?.isAdmin ? (
            <Link
              href="/admin"
              onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <SquaresFour
                weight="duotone"
                className="size-4 text-primary"
              />
              {t("nav.admin")}
            </Link>
          ) : null}
          <Separator className="my-3" />
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">
              {t("nav.theme")}
            </span>
            <ThemeToggle />
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">
              {t("locale.language")}
            </span>
            <LocaleSwitcher />
          </div>
          <Separator className="my-3" />
          {user ? (
            <Button
              variant="outline"
              className="justify-start gap-3"
              onClick={() => {
                close();
                startTransition(() => signOutAction());
              }}
            >
              <SignOut weight="duotone" className="size-4" />
              {t("nav.signOut")}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={close}
                className={cn(buttonVariants({ variant: "outline" }), "h-10")}
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/signup"
                onClick={close}
                className={cn(buttonVariants(), "h-10")}
              >
                {t("nav.signUp")}
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
