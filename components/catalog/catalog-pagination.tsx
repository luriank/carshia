"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { useCatalogTransition } from "@/components/catalog/catalog-transition";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CatalogPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useTranslations();
  const { navigate } = useCatalogTransition();

  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const next = new URLSearchParams(params.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function onLinkClick(e: React.MouseEvent, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    navigate(href);
  }

  const pages: (number | "ellipsis")[] = [];
  const add = (p: number) => pages.push(p);
  add(1);
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) add(p);
  if (end < totalPages - 1) pages.push("ellipsis");
  if (totalPages > 1) add(totalPages);

  return (
    <nav
      aria-label={t("a11y.pagination")}
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <Link
        href={hrefFor(page - 1)}
        onClick={(e) => onLinkClick(e, hrefFor(page - 1))}
        aria-label={t("a11y.prevPage")}
        aria-disabled={page <= 1}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1",
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft weight="bold" className="size-4" />
        <span className="hidden sm:inline">{t("catalog.prev")}</span>
      </Link>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`e-${i}`}
            className="px-2 text-sm text-muted-foreground"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            onClick={(e) => onLinkClick(e, hrefFor(p))}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: p === page ? "outline" : "ghost",
                size: "icon-sm",
              }),
              "tabular-nums",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={hrefFor(page + 1)}
        onClick={(e) => onLinkClick(e, hrefFor(page + 1))}
        aria-label={t("a11y.nextPage")}
        aria-disabled={page >= totalPages}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1",
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        <span className="hidden sm:inline">{t("catalog.next")}</span>
        <ChevronRight weight="bold" className="size-4" />
      </Link>
    </nav>
  );
}
