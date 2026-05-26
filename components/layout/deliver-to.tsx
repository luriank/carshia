import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

/**
 * "Deliver to / {city}" pill — pulls the user's default Address.
 * Renders three states:
 *   - signed-out → "Sign in to set location"  (links to /login)
 *   - no address → "Add a delivery address"   (links to /profile#addresses)
 *   - has address → "Deliver to / {City}"     (links to /profile#addresses)
 *
 * We deliberately do NOT echo the recipient's first name on line 1 — leaking
 * a personal name into the persistent header chrome reads as placeholder
 * text in screenshots and adds nothing the city line doesn't.
 */
export async function DeliverTo({
  user,
}: {
  user: { id: string; name?: string | null } | null;
}) {
  const t = await getTranslations();

  if (!user) {
    return (
      <DeliverPill
        href="/login"
        line1={t("nav.deliverTo")}
        line2={t("nav.deliverSignedOut")}
      />
    );
  }

  const defaultAddress = await prisma.address.findFirst({
    where: { userId: user.id, isDefault: true },
    select: { city: true },
  });

  if (!defaultAddress) {
    return (
      <DeliverPill
        href="/profile#addresses"
        line1={t("nav.deliverTo")}
        line2={t("nav.deliverNoAddress")}
      />
    );
  }

  return (
    <DeliverPill
      href="/profile#addresses"
      line1={t("nav.deliverTo")}
      line2={defaultAddress.city}
    />
  );
}

function DeliverPill({
  href,
  line1,
  line2,
}: {
  href: string;
  line1: string;
  line2: string;
}) {
  return (
    <Link
      href={href}
      className="hidden h-10 shrink-0 items-center gap-1.5 rounded-md px-2 ring-1 ring-transparent transition-colors hover:bg-primary/5 hover:ring-primary/10 lg:inline-flex"
    >
      <MapPin
        weight="duotone"
        aria-hidden
        className="size-5 self-end pb-0.5 text-gold"
      />
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] font-normal text-muted-foreground">
          {line1}
        </span>
        <span className="max-w-[10rem] truncate text-[13px] font-semibold text-foreground">
          {line2}
        </span>
      </span>
    </Link>
  );
}
