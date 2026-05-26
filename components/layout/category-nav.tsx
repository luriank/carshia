import Link from "next/link";
import {
  Fire,
  Heart,
  Sparkle,
  Tag,
} from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { MobileNav } from "@/components/layout/mobile-nav";

const MAX_DESKTOP_CATEGORIES = 6;

type SessionUser = {
  name?: string | null;
  email?: string | null;
  isAdmin?: boolean;
} | null;

/**
 * The second header row: a subtly tinted band with the hamburger "All"
 * drawer (reuses the existing MobileNav), pinned quick-links, and the top
 * categories by live product count. Categories with zero live products are
 * excluded so we never link to an empty page. The category strip scrolls
 * horizontally without a visible scrollbar; a soft fade-edge on the right
 * hints there is more.
 */
export async function CategoryNav({ user }: { user: SessionUser }) {
  const t = await getTranslations();
  const grouped = await prisma.product.groupBy({
    by: ["categoryId"],
    where: { isDeleted: false },
    _count: { _all: true },
    orderBy: { _count: { categoryId: "desc" } },
    take: MAX_DESKTOP_CATEGORIES,
  });
  const cats =
    grouped.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: grouped.map((g) => g.categoryId) } },
          select: { id: true, slug: true, name: true },
        })
      : [];
  const byId = new Map(cats.map((c) => [c.id, c]));
  const orderedCats = grouped.flatMap((g) => {
    const c = byId.get(g.categoryId);
    return c ? [c] : [];
  });

  const pinned = [
    {
      href: "/new-arrivals",
      label: t("nav.newArrivals"),
      icon: Sparkle,
    },
    {
      href: "/bestsellers",
      label: t("nav.bestsellers"),
      icon: Fire,
    },
  ];

  return (
    <div className="hidden border-t border-border/60 bg-background/60 md:block">
      <div className="mx-auto flex h-10 max-w-7xl items-stretch gap-1 px-4 text-[13px] text-foreground/85 sm:px-6">
        <MobileNav user={user} variant="header" />

        {pinned.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="my-1 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 ring-1 ring-transparent transition-colors hover:bg-primary/5 hover:ring-primary/10"
          >
            <item.icon
              weight="duotone"
              className="size-4 text-gold"
              aria-hidden
            />
            {item.label}
          </Link>
        ))}

        <span aria-hidden className="my-2 w-px bg-border" />

        {/* Scrollable categories — hidden scrollbar + soft right fade. */}
        <div className="relative min-w-0 flex-1">
          <nav
            aria-label={t("nav.browseAll")}
            className="flex h-full items-stretch gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {orderedCats.map((c) => (
              <Link
                key={c.id}
                // `category` (singular) is the parser key in
                // lib/catalog-params.ts — using `categories` here silently
                // did nothing.
                href={`/?category=${encodeURIComponent(c.slug)}#catalog`}
                className="my-1 inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2.5 ring-1 ring-transparent transition-colors hover:bg-primary/5 hover:ring-primary/10"
              >
                {/* Resolve via locale messages so the sub-nav matches the
                    sidebar rail when the language switches. The DB stores
                    English names; categories.* in messages/* are the
                    canonical localized strings. */}
                {t(`categories.${c.slug}`)}
              </Link>
            ))}
          </nav>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/80 to-transparent"
          />
        </div>

        <span className="ml-2 hidden shrink-0 items-center gap-1 whitespace-nowrap text-[12px] text-muted-foreground lg:inline-flex">
          <Tag weight="duotone" className="size-3.5 text-gold" aria-hidden />
          {t("nav.freeShip", { amount: `€${FREE_SHIPPING_THRESHOLD}` })}
        </span>
        <Link
          href="/wishlist"
          className="my-1 ml-2 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 ring-1 ring-transparent transition-colors hover:bg-primary/5 hover:ring-primary/10"
        >
          <Heart weight="duotone" className="size-4 text-gold" aria-hidden />
          {t("nav.wishlist")}
        </Link>
      </div>
    </div>
  );
}
