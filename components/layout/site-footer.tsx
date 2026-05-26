import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/wordmark";

export async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <Wordmark className="text-xl" />
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("footer.blurb")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
          <FooterCol
            title={t("footer.shop")}
            links={[
              { href: "/", label: t("footer.allProducts") },
              { href: "/wishlist", label: t("nav.wishlist") },
              { href: "/cart", label: t("nav.cart") },
            ]}
          />
          <FooterCol
            title={t("footer.account")}
            links={[
              { href: "/orders", label: t("nav.orders") },
              { href: "/profile", label: t("nav.profile") },
              { href: "/login", label: t("nav.signIn") },
            ]}
          />
          <FooterCol
            title={t("footer.about")}
            links={[
              { href: "/", label: t("footer.ourStory") },
              { href: "/", label: t("footer.sustainability") },
              { href: "/", label: t("footer.contact") },
            ]}
          />
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t("footer.rights", { year })}</p>
          <p>{t("footer.location")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-sans text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-foreground">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((l, i) => (
          <li key={`${l.href}-${i}`}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
