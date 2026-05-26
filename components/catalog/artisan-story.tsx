import { MapPin } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";

export async function ArtisanStory() {
  const t = await getTranslations();
  return (
    <section
      aria-labelledby="artisan-story-heading"
      className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-gold/[0.1] px-6 py-9 sm:px-10 sm:py-11"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-gold/15 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full bg-primary/[0.08] blur-3xl"
      />
      <div className="relative flex max-w-3xl flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-foreground ring-1 ring-gold/30">
          <span className="size-1.5 rounded-full bg-gold" />
          {t("storefront.artisanBadge")}
        </span>
        <h2
          id="artisan-story-heading"
          className="font-display text-[2rem] leading-[1.05] font-medium text-balance sm:text-[2.5rem]"
        >
          {t("hero.title")}
        </h2>
        <span aria-hidden className="gilt-rule" />
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {t("footer.blurb")}
        </p>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
          <MapPin weight="fill" className="size-4 shrink-0 text-gold" />
          {t("footer.location")}
        </p>
      </div>
    </section>
  );
}
