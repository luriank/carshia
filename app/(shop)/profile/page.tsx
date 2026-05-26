import type { Metadata } from "next";
import {
  CreditCard,
  IdentificationCard,
  MapPin,
} from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAddresses } from "@/lib/actions/address";
import { listPaymentMethods } from "@/lib/actions/payment-methods";
import { getUserOrders } from "@/lib/queries/orders";
import { ProfileView } from "@/components/profile/profile-view";
import { ProfileHero } from "@/components/profile/profile-hero";
import { AccountHub } from "@/components/profile/account-hub";
import { RecentOrders } from "@/components/profile/recent-orders";
import { AddressManager } from "@/components/address/address-manager";
import { PaymentMethodsManager } from "@/components/payment-methods/payment-methods-manager";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.profile") };
}

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const [user, addresses, paymentMethods, orders, wishlistCount] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: sessionUser.id },
        select: {
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      }),
      getAddresses(),
      listPaymentMethods(),
      getUserOrders(sessionUser.id),
      prisma.wishlistItem.count({ where: { userId: sessionUser.id } }),
    ]);
  const t = await getTranslations();

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const clientPaymentMethods = paymentMethods.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
      <ProfileHero
        name={user.name}
        email={user.email}
        memberSince={user.createdAt}
        orderCount={orders.length}
        totalSpent={totalSpent}
      />

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-medium">
            {t("profile.hub.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("profile.hub.desc")}
          </p>
        </div>
        <AccountHub
          orderCount={orders.length}
          addressCount={addresses.length}
          wishlistCount={wishlistCount}
          paymentMethodCount={paymentMethods.length}
        />
      </section>

      <RecentOrders orders={orders} />

      <section
        id="payment-methods"
        className="space-y-4 scroll-mt-24 rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <CreditCard weight="duotone" className="size-5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("profile.section.payment")}
          </p>
        </div>
        <PaymentMethodsManager initial={clientPaymentMethods} />
      </section>

      <section
        id="addresses"
        className="space-y-4 scroll-mt-24 rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <MapPin weight="duotone" className="size-5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("profile.section.addresses")}
          </p>
        </div>
        <AddressManager
          phone={user.phone}
          initial={addresses.map((a) => ({
            id: a.id,
            fullName: a.fullName,
            street: a.street,
            city: a.city,
            postalCode: a.postalCode,
            type: a.type as "Home" | "Work" | "Other",
            isDefault: a.isDefault,
          }))}
        />
      </section>

      <section
        id="account-details"
        className="space-y-4 scroll-mt-24 rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <IdentificationCard weight="duotone" className="size-5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("profile.section.account")}
          </p>
        </div>
        <h3 className="font-display text-xl font-medium">
          {t("profile.accountDetails")}
        </h3>
        <ProfileView
          initial={{
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
          }}
        />
      </section>
    </div>
  );
}
