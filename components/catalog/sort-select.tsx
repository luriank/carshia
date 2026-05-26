"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCatalogTransition } from "@/components/catalog/catalog-transition";
import { SORT_OPTIONS } from "@/lib/catalog-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const SORT_LABEL_KEYS: Record<string, string> = {
  newest: "catalog.sortNewest",
  "price-asc": "catalog.sortPriceAsc",
  "price-desc": "catalog.sortPriceDesc",
  rating: "catalog.sortRating",
};

export function SortSelect() {
  const { navigate } = useCatalogTransition();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useTranslations();
  const current = params.get("sort") ?? "newest";
  const currentLabel = t(SORT_LABEL_KEYS[current] ?? "catalog.sortNewest");

  function onValueChange(value: string | null) {
    if (!value) return;
    const next = new URLSearchParams(params.toString());
    next.set("sort", value);
    next.delete("page");
    navigate(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <Select value={current} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-[180px]" aria-label={t("catalog.sort")}>
        <span className="text-sm">{currentLabel}</span>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {t(SORT_LABEL_KEYS[o.value] ?? "catalog.sortNewest")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
