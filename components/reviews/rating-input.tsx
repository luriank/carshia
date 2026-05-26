"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

export function RatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const t = useTranslations();
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label={t("a11y.ratingGroup")}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={t("a11y.starLabel", { count: star })}
          disabled={disabled}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <Star
            weight={star <= active ? "fill" : "regular"}
            className={cn(
              "size-6 transition-colors",
              star <= active ? "text-gold" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
