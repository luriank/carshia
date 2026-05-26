"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/lib/actions/locale";
import type { Locale } from "@/i18n/request";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "sq", label: "AL" },
  { value: "en", label: "EN" },
];

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale || pending) return;
    // Run the cookie write + refresh inside a transition so the current
    // UI stays mounted (no fallback skeleton flash) while RSC streams
    // the new locale.
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center rounded-full border bg-muted/50 p-0.5 text-xs font-semibold",
        className,
      )}
    >
      {OPTIONS.map((o) => {
        const active = locale === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() => choose(o.value)}
            className={cn(
              "min-h-11 min-w-11 rounded-full px-3 py-2 text-sm transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
