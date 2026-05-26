import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAdminProducts } from "@/lib/queries/admin";
import { AdminProducts } from "@/components/admin/admin-products";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.adminProducts") };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const pick = (k: string) => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const data = await getAdminProducts({
    q: pick("q"),
    page: Number.parseInt(pick("page") ?? "1", 10) || 1,
    showDeleted: pick("showDeleted") === "1",
  });

  return (
    <AdminProducts
      products={data.products}
      categories={data.categories}
      brands={data.brands}
      page={data.page}
      totalPages={data.totalPages}
      total={data.total}
    />
  );
}
