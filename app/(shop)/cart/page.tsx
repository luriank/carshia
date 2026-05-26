import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getCart } from "@/lib/actions/cart";
import { computeTotals } from "@/lib/format";
import { CartView } from "@/components/cart/cart-view";
import { PageHeader } from "@/components/shared/page-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.cart") };
}

export default async function CartPage() {
  const user = await getCurrentUser();
  const cart = user
    ? await getCart()
    : { items: [], totals: computeTotals(0) };
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title={t("cart.title")}
        description={t("cart.desc")}
        className="mb-8"
      />
      <CartView initial={cart} isAuthenticated={Boolean(user)} />
    </div>
  );
}
