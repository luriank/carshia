"use client";

import { useState } from "react";
import { SlidersHorizontal } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type CategoryFacet = { slug: string; name: string; count: number };
type BrandFacet = { name: string; count: number };

export function MobileFilter({
  categoryFacets,
  brandFacets,
  activeCount,
}: {
  categoryFacets: CategoryFacet[];
  brandFacets: BrandFacet[];
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 lg:hidden" />
        }
      >
        <SlidersHorizontal weight="duotone" className="size-4" />
        {t("catalog.filters")}
        {activeCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-2xs font-semibold text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>{t("catalog.filters")}</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto p-4">
          <FilterSidebar
            categoryFacets={categoryFacets}
            brandFacets={brandFacets}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
