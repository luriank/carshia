"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const safeImages = images.length ? images : [];
  const len = safeImages.length;
  const go = (next: number) => setIndex((next + len) % len);

  // Swipe support for touch users — fine-pointer devices use the
  // chevron buttons.
  const startRef = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    const t0 = e.touches[0];
    startRef.current = { x: t0.clientX, y: t0.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = startRef.current;
    startRef.current = null;
    if (!start || len < 2) return;
    const t0 = e.changedTouches[0];
    const dx = t0.clientX - start.x;
    const dy = t0.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? index + 1 : index - 1);
    }
  }

  // Keep the thumbnail strip scrolled to the active image.
  const stripRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(
      `[data-thumb-index="${index}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl border bg-muted/30"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {safeImages[index] ? (
          <Image
            src={safeImages[index]}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8"
          />
        ) : null}
        {len > 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("a11y.prevImage")}
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 size-11 -translate-y-1/2 bg-background/85 backdrop-blur transition-opacity [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
            >
              <ChevronLeft weight="bold" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("a11y.nextImage")}
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 size-11 -translate-y-1/2 bg-background/85 backdrop-blur transition-opacity [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
            >
              <ChevronRight weight="bold" />
            </Button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-background/85 px-2 py-1 backdrop-blur">
              {safeImages.map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full transition-colors",
                    i === index ? "bg-foreground" : "bg-foreground/30",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {len > 1 ? (
        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]"
        >
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              type="button"
              data-thumb-index={i}
              onClick={() => setIndex(i)}
              aria-label={t("a11y.viewImage", { n: i + 1 })}
              aria-current={i === index}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted/30 transition-all",
                i === index
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt={t("a11y.thumbnailAlt", { title, n: i + 1 })}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
