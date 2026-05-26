"use client";

import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { SearchBar } from "@/components/layout/search-bar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Surfaces search on screens narrower than the inline header search.
// Previously mobile users had to open the full nav drawer to find the
// input — discoverability was bad.
export function MobileSearchButton() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("common.search")}
            className="size-11 rounded-full text-primary transition-colors hover:bg-muted md:hidden"
          />
        }
      >
        <MagnifyingGlass weight="duotone" className="size-[1.3rem]" />
      </SheetTrigger>
      <SheetContent side="top" className="max-h-[60vh] gap-2">
        <SheetHeader>
          <SheetTitle>{t("common.search")}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <SearchBar onSubmitted={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
