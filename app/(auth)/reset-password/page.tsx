import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.reset") };
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[24rem] w-full rounded-xl" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
