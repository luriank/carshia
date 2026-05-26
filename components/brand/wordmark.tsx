import Link from "next/link";
import { brand } from "@/brand.config";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  href = "/",
  tone = "default",
}: {
  className?: string;
  href?: string;
  tone?: "default" | "light";
}) {
  const light = tone === "light";
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-baseline gap-2",
        light && "text-white",
        className,
      )}
      aria-label={`${brand.fullName} — home`}
    >
      <span className="inline-flex items-baseline">
        <span className="font-heading text-[1.7em] leading-none font-medium tracking-[-0.01em]">
          {brand.name}
        </span>
        <span
          aria-hidden
          className="mx-[0.18em] mb-[0.18em] size-[0.32em] self-end rounded-full bg-gold ring-1 ring-gold/30"
        />
      </span>
      <span
        className={cn(
          "font-sans text-[0.72em] font-semibold uppercase tracking-[0.22em]",
          light ? "text-white/65" : "text-muted-foreground",
        )}
      >
        {brand.location}
      </span>
    </Link>
  );
}
