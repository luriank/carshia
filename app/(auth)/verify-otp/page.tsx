import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckCircle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("meta.verify") };
}

export default async function VerifyOtpPage() {
  const t = await getTranslations();
  return (
    <AuthCard
      title={t("auth.verify.title")}
      description={t("auth.verify.desc")}
      icon={
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-foreground ring-1 ring-gold/30">
          <CheckCircle weight="duotone" className="size-6" />
        </div>
      }
    >
      <Button
        render={<Link href="/" />}
        nativeButton={false}
        className="h-11 w-full"
      >
        {t("auth.verify.continue")}
      </Button>
    </AuthCard>
  );
}
