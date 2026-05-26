"use client";

import { Minus, Plus } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = "sm",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const isMd = size === "md";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border bg-background",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn("rounded-r-none", isMd && "size-11")}
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus weight="bold" />
      </Button>
      <span
        className={cn(
          "text-center text-sm font-medium tabular-nums",
          isMd ? "w-11" : "w-9",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn("rounded-l-none", isMd && "size-11")}
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus weight="bold" />
      </Button>
    </div>
  );
}
