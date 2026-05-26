import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getCart } from "@/lib/actions/cart";
import { getAddresses } from "@/lib/actions/address";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { CheckoutGuestGate } from "@/components/checkout/checkout-guest-gate";
import { PageHeader } from "@/components/shared/page-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.checkout") };
}

export default async function CheckoutPage() {
  const t = await getTranslations();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          title={t("checkout.title")}
          description={t("checkout.desc")}
          className="mb-8"
        />
        <CheckoutGuestGate />
      </div>
    );
  }

  const [cart, addresses] = await Promise.all([getCart(), getAddresses()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title={t("checkout.title")}
        description={t("checkout.desc")}
        className="mb-8"
      />
      <CheckoutView
        items={cart.items.map((i) => ({
          id: i.id,
          title: i.title,
          thumbnail: i.thumbnail,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          lineTotal: i.lineTotal,
        }))}
        totals={cart.totals}
        addresses={addresses.map((a) => ({
          id: a.id,
          fullName: a.fullName,
          street: a.street,
          city: a.city,
          postalCode: a.postalCode,
          type: a.type as "Home" | "Work" | "Other",
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}
