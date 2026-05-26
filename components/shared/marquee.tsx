import { Hammer, Leaf, Package, ShieldCheck, Sparkle } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";

const ITEMS = [
  { icon: Hammer, key: "marquee.handmade" },
  { icon: ShieldCheck, key: "marquee.authentic" },
  { icon: Package, key: "marquee.shipping" },
  { icon: Sparkle, key: "marquee.filigree" },
  { icon: Leaf, key: "marquee.sustainable" },
  { icon: Hammer, key: "marquee.supporting" },
] as const;

export async function TrustMarquee() {
  const t = await getTranslations();
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface-band py-3.5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-surface-band to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-surface-band to-transparent" />
      <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 text-sm font-medium text-foreground/75"
          >
            <span className="grid size-7 place-items-center rounded-full bg-gold/15 text-gold-foreground ring-1 ring-gold/30">
              <item.icon weight="fill" className="size-3.5 text-gold" />
            </span>
            <span className="whitespace-nowrap">{t(item.key)}</span>
            <span className="ml-6 size-1 rounded-full bg-gold/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
