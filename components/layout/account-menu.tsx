"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  CaretDown,
  CreditCard,
  SquaresFour,
  SignOut,
  Package,
  User as UserIcon,
} from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  isAdmin?: boolean;
};

/**
 * `"avatar"` (default) — round gold-ringed avatar bubble, used on light
 * surfaces (profile page, light header variants).
 * `"stacked"` — Amazon-style two-line label "Hello, X / Account & Lists"
 * for the dark header bar. Adopts the surrounding white-on-navy palette.
 */
type Variant = "avatar" | "stacked";

function initials(name?: string | null, email?: string | null) {
  const base = name?.trim() || email?.split("@")[0] || "U";
  return base
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AccountMenu({
  user,
  variant = "avatar",
}: {
  user: SessionUser | null;
  variant?: Variant;
}) {
  const t = useTranslations();
  const [, startTransition] = useTransition();

  if (!user) {
    if (variant === "stacked") {
      return (
        <Link
          href="/login"
          className="flex h-10 shrink-0 items-center gap-1 rounded-md px-2 text-foreground ring-1 ring-transparent transition-colors hover:bg-primary/5 hover:ring-primary/10"
        >
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] font-normal text-muted-foreground">
              {t("nav.helloGuest")}
            </span>
            <span className="text-[13px] font-semibold">
              {t("nav.accountAndLists")}
            </span>
          </span>
          <CaretDown weight="bold" className="size-3 self-center text-muted-foreground" aria-hidden />
        </Link>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          variant="ghost"
          className="h-10 rounded-full px-4"
        >
          {t("nav.signIn")}
        </Button>
        <Button
          render={<Link href="/signup" />}
          nativeButton={false}
          className="hidden h-10 rounded-full px-5 sm:inline-flex"
        >
          {t("nav.signUp")}
        </Button>
      </div>
    );
  }

  const stackedTrigger = (
    <Button
      variant="ghost"
      aria-label={t("nav.account")}
      className="h-10 gap-1 rounded-md px-2 text-foreground ring-1 ring-transparent hover:bg-primary/5 hover:ring-primary/10 hover:text-foreground"
    />
  );
  const avatarTrigger = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("nav.account")}
      className="size-11 rounded-full transition-colors hover:bg-muted"
    />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={variant === "stacked" ? stackedTrigger : avatarTrigger}
      >
        {variant === "stacked" ? (
          <>
            {/* Generic line — was `helloName: "Hello, {name}"`, but the seeded
                demo user is literally named "Demo", which reads as placeholder
                text in screenshots. The full name still appears inside the
                dropdown header. */}
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[11px] font-normal text-muted-foreground">
                {t("nav.welcomeBack")}
              </span>
              <span className="text-[13px] font-semibold">
                {t("nav.accountAndLists")}
              </span>
            </span>
            <CaretDown
              weight="bold"
              className="size-3 self-center text-muted-foreground"
              aria-hidden
            />
          </>
        ) : (
          <Avatar className="size-9 ring-2 ring-gold/40 transition-shadow hover:ring-gold/70">
            <AvatarFallback className="bg-gradient-to-br from-primary/15 to-gold/25 text-sm font-semibold text-primary">
              {initials(user.name, user.email)}
            </AvatarFallback>
            <AvatarBadge className="size-2.5 bg-emerald-500" aria-hidden />
          </Avatar>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-10 ring-2 ring-gold/40">
            <AvatarFallback className="bg-gradient-to-br from-primary/15 to-gold/25 text-sm font-semibold text-primary">
              {initials(user.name, user.email)}
            </AvatarFallback>
            <AvatarBadge className="size-2.5 bg-emerald-500" aria-hidden />
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium leading-tight">
              {user.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
            {user.isAdmin ? (
              <Badge variant="secondary" className="mt-1 self-start">
                {t("admin.badge")}
              </Badge>
            ) : null}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <UserIcon weight="duotone" className="text-primary" />
            {t("nav.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/orders" />}>
            <Package weight="duotone" className="text-primary" />
            {t("nav.orders")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/profile#payment-methods" />}>
            <CreditCard weight="duotone" className="text-primary" />
            {t("payments.cards.title")}
          </DropdownMenuItem>
          {user.isAdmin ? (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <SquaresFour weight="duotone" className="text-primary" />
              {t("nav.admin")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => startTransition(() => signOutAction())}
        >
          <SignOut weight="duotone" />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
