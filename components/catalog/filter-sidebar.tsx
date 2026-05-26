"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { useCatalogTransition } from "@/components/catalog/catalog-transition";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CategoryFacet = { slug: string; name: string; count: number };
type BrandFacet = { name: string; count: number };

export function FilterSidebar({
  categoryFacets,
  brandFacets,
  onNavigate,
}: {
  categoryFacets: CategoryFacet[];
  brandFacets: BrandFacet[];
  onNavigate?: () => void;
}) {
  const { navigate } = useCatalogTransition();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useTranslations();
  const [brandQuery, setBrandQuery] = useState("");

  const selectedCategories = useMemo(
    () =>
      new Set(
        (params.get("category") ?? "")
          .split(",")
          .map((s) => decodeURIComponent(s))
          .filter(Boolean),
      ),
    [params],
  );
  const selectedBrands = useMemo(
    () =>
      new Set(
        (params.get("brand") ?? "")
          .split(",")
          .map((s) => decodeURIComponent(s))
          .filter(Boolean),
      ),
    [params],
  );

  const activeCount = selectedCategories.size + selectedBrands.size;

  function commit(next: URLSearchParams) {
    next.delete("page");
    const qs = next.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    onNavigate?.();
  }

  function toggle(key: "category" | "brand", value: string) {
    const current = new Set(
      (params.get(key) ?? "")
        .split(",")
        .map((s) => decodeURIComponent(s))
        .filter(Boolean),
    );
    if (current.has(value)) current.delete(value);
    else current.add(value);

    const next = new URLSearchParams(params.toString());
    if (current.size) {
      next.set(
        key,
        Array.from(current)
          .map((v) => encodeURIComponent(v))
          .join(","),
      );
    } else {
      next.delete(key);
    }
    commit(next);
  }

  function clearAll() {
    const next = new URLSearchParams(params.toString());
    next.delete("category");
    next.delete("brand");
    commit(next);
  }

  const filteredBrands = brandFacets.filter((b) =>
    b.name.toLowerCase().includes(brandQuery.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 pb-0.5">
        <h2 className="inline-flex items-center gap-2 text-eyebrow text-foreground">
          <SlidersHorizontal
            weight="duotone"
            className="size-3.5 text-gold"
            aria-hidden
          />
          {t("catalog.filters")}
        </h2>
        {activeCount > 0 ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={clearAll}
            className="-mr-1.5 h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            {t("catalog.clearAll", { count: activeCount })}
          </Button>
        ) : null}
      </div>

      <Accordion defaultValue={["category"]} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground hover:no-underline">
            {t("catalog.category")}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="-mx-2 pt-0.5">
              {categoryFacets.map((c) => {
                const id = `cat-${c.slug}`;
                const checked = selectedCategories.has(c.slug);
                return (
                  <li key={c.slug}>
                    <label
                      htmlFor={id}
                      className="group/row flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 transition-colors hover:bg-secondary/60"
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={() => toggle("category", c.slug)}
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate font-sans text-[13px]",
                          checked
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground/85",
                        )}
                      >
                        {t(`categories.${c.slug}`)}
                      </span>
                      <span className="tabular-nums text-[11px] font-medium text-muted-foreground">
                        {c.count}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground hover:no-underline">
            {t("catalog.brand")}
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-0.5">
              <Input
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder={t("catalog.filterBrands")}
                aria-label={t("a11y.filterBrands")}
                className="mb-2 h-8 text-[13px]"
              />
              <ul className="-mx-2 max-h-72 overflow-y-auto pr-1">
                {filteredBrands.map((b) => {
                  const id = `brand-${b.name}`;
                  const checked = selectedBrands.has(b.name);
                  return (
                    <li key={b.name}>
                      <label
                        htmlFor={id}
                        className="group/row flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 transition-colors hover:bg-secondary/60"
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={() => toggle("brand", b.name)}
                        />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate font-sans text-[13px]",
                            checked
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/85",
                          )}
                        >
                          {b.name}
                        </span>
                        <span className="ml-2 tabular-nums text-[11px] font-medium text-muted-foreground">
                          {b.count}
                        </span>
                      </label>
                    </li>
                  );
                })}
                {filteredBrands.length === 0 ? (
                  <li className="px-2 py-2 text-[13px] text-muted-foreground">
                    {t("catalog.noBrands")}
                  </li>
                ) : null}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
