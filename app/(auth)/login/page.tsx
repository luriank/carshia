import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.login") };
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[28rem] w-full rounded-3xl" />}>
      <LoginForm />
    </Suspense>
  );
}
