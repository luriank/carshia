import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getWishlist } from "@/lib/actions/wishlist";
import { WishlistView } from "@/components/wishlist/wishlist-view";
import { PageHeader } from "@/components/shared/page-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.wishlist") };
}

export default async function WishlistPage() {
  const user = await getCurrentUser();
  const items = user ? await getWishlist() : [];
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title={t("wishlist.title")}
        description={t("wishlist.subtitle")}
        className="mb-8"
      />
      <WishlistView initial={items} isAuthenticated={Boolean(user)} />
    </div>
  );
}
