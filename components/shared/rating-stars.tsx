import { Star } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  const sizes = { sm: "size-3.5", md: "size-4", lg: "size-5" } as const;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className="flex items-center"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = rounded - i;
          return (
            <span key={i} className="relative">
              <Star
                weight="regular"
                className={cn(sizes[size], "text-muted-foreground/40")}
              />
              {fill > 0 ? (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: fill >= 1 ? "100%" : "50%" }}
                >
                  <Star
                    weight="fill"
                    className={cn(sizes[size], "text-gold")}
                  />
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
      {typeof count === "number" ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          {rating.toFixed(1)}
          {count > 0 ? ` (${count})` : ""}
        </span>
      ) : null}
    </div>
  );
}
