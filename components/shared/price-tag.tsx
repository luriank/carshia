import { formatPrice, discountedPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PriceTag({
  price,
  discountPercentage = 0,
  size = "md",
  className,
}: {
  price: number;
  discountPercentage?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hasDiscount = discountPercentage > 0;
  const final = discountedPrice(price, discountPercentage);
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  } as const;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold tabular-nums", sizes[size])}>
        {formatPrice(final)}
      </span>
      {hasDiscount ? (
        <>
          <span className="text-sm text-muted-foreground line-through tabular-nums">
            {formatPrice(price)}
          </span>
          <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-2xs font-semibold text-gold-foreground">
            -{Math.round(discountPercentage)}%
          </span>
        </>
      ) : null}
    </div>
  );
}
