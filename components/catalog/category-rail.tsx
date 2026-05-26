import Link from "next/link";
import {
  CaretRight as ChevronRight,
  Flag,
  Diamond as Gem,
  TShirt as Shirt,
  Couch as Sofa,
  Stamp,
  Basket as Wheat,
} from "@phosphor-icons/react/ssr";
import type { Icon as LucideIcon } from "@phosphor-icons/react/lib";
import { getTranslations } from "next-intl/server";

const ICONS: Record<string, LucideIcon> = {
  "filigree-silver": Gem,
  "traditional-wear": Shirt,
  "home-decor": Sofa,
  "souvenirs-prints": Stamp,
  "flags-pennants": Flag,
  "artisan-pantry": Wheat,
};

export async function CategoryRail({
  categories,
}: {
  categories: { slug: string; name: string; count: number }[];
}) {
  const t = await getTranslations();
  return (
    <nav
      aria-label={t("storefront.shopByCraft")}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card"
    >
      <div className="border-b border-border/60 px-4 pb-2 pt-3">
        <h2 className="text-eyebrow text-muted-foreground">
          {t("storefront.shopByCraft")}
        </h2>
      </div>
      <ul className="py-1">
        {categories.map((c) => {
          const Icon = ICONS[c.slug] ?? Gem;
          return (
            <li key={c.slug}>
              <Link
                href={`/?category=${c.slug}#catalog`}
                className="group/row relative flex h-14 items-center gap-3 px-3.5 transition-colors hover:bg-secondary/60"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-2.5 left-0 w-0 rounded-r-full bg-gold transition-all duration-300 ease-out group-hover/row:w-[3px]"
                />
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover/row:bg-gold/15 group-hover/row:text-primary">
                  <Icon weight="duotone" className="size-[1.05rem]" />
                </span>
                <span className="min-w-0 flex-1 truncate font-sans text-[13.5px] font-medium text-foreground">
                  {t(`categories.${c.slug}`)}
                </span>
                <span className="inline-flex items-center gap-2 pl-1 text-muted-foreground transition-colors group-hover/row:text-foreground">
                  <span className="tabular-nums text-[11px] font-medium">
                    {c.count}
                  </span>
                  <ChevronRight
                    weight="bold"
                    className="size-3 text-muted-foreground/70 transition-transform group-hover/row:translate-x-0.5 group-hover/row:text-foreground"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Footer CTA — uses mt-auto so the rail bottom-aligns with the hero
          when the grid stretches them; reads as the natural "all crafts"
          exit from the rail. */}
      <Link
        href="/#catalog"
        className="group/all mt-auto flex items-center justify-between gap-2 border-t border-border/60 px-4 py-3 transition-colors hover:bg-secondary/60"
      >
        <span className="text-eyebrow text-muted-foreground transition-colors group-hover/all:text-foreground">
          {t("catalog.allProducts")}
        </span>
        <ChevronRight
          weight="bold"
          className="size-3 text-muted-foreground/70 transition-transform group-hover/all:translate-x-0.5 group-hover/all:text-foreground"
        />
      </Link>
    </nav>
  );
}
