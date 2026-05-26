import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { brand } from "@/brand.config";
import { FadeIn } from "@/components/shared/motion";
import { HeroBackdrop } from "@/components/catalog/hero-backdrop";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function Hero() {
  const t = await getTranslations();
  return (
    <section className="relative isolate flex h-full min-h-[18rem] overflow-hidden rounded-2xl border border-border/60">
      <HeroBackdrop>
        <Image
          src={brand.hero.src}
          alt={brand.hero.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 75vw"
          className="object-cover will-change-transform"
        />
      </HeroBackdrop>
      {/* Left-to-right gradient — lifted from 75/45 → 55/25 so the panorama
          stays legible on the left while the title still has the contrast it
          needs to read. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"
        aria-hidden
      />
      {/* Soft bottom vignette gives the buttons enough lift without
          re-darkening the panorama. */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent"
        aria-hidden
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23E8C77A' stroke-width='1.1'%3E%3Ccircle cx='40' cy='40' r='13'/%3E%3Cpath d='M40 0v80M0 40h80M11.7 11.7l56.6 56.6M68.3 11.7L11.7 68.3'/%3E%3Ccircle cx='0' cy='0' r='6'/%3E%3Ccircle cx='80' cy='0' r='6'/%3E%3Ccircle cx='0' cy='80' r='6'/%3E%3Ccircle cx='80' cy='80' r='6'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="relative flex flex-col justify-center gap-4 px-6 py-7 sm:px-10 sm:py-8">
        <FadeIn delay={0}>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Sparkle weight="fill" className="size-3.5 text-gold" />
            {t("hero.badge")}
          </span>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="max-w-2xl font-display text-[2.75rem] leading-[1.02] font-medium text-balance text-white sm:text-[3.5rem] lg:text-[4rem]">
            {t("hero.title")}
          </h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-base">
            {t("hero.subtitle")}
          </p>
        </FadeIn>
        <FadeIn delay={0.24}>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="#catalog"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 gap-2 px-6 transition-transform hover:scale-[1.03]",
              )}
            >
              {t("hero.ctaExplore")}
              <ArrowRight weight="bold" className="size-4" />
            </Link>
            <Link
              href="/wishlist"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 border-white/30 bg-white/10 px-6 text-white hover:bg-white/20",
              )}
            >
              {t("hero.ctaWishlist")}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
