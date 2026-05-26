import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Compass } from "@phosphor-icons/react/ssr";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Wordmark />
      <div className="flex size-14 items-center justify-center rounded-full bg-card text-primary ring-1 ring-gold/30">
        <Compass weight="duotone" className="size-7" />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-[2.5rem] font-medium sm:text-[3rem]">
          {t("notFound.title")}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("notFound.desc")}
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
        {t("notFound.back")}
      </Link>
    </div>
  );
}
