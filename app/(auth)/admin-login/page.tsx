import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.adminLogin") };
}

export default async function AdminLoginPage() {
  // Already signed in as an admin — skip the form, go straight to the dashboard.
  const user = await getCurrentUser();
  if (user?.isAdmin) redirect("/admin");

  return (
    <Suspense fallback={<Skeleton className="h-[28rem] w-full rounded-3xl" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
