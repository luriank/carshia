import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAdminOrders } from "@/lib/queries/admin";
import { AdminOrders } from "@/components/admin/admin-orders";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.adminOrders") };
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return <AdminOrders orders={orders} />;
}
