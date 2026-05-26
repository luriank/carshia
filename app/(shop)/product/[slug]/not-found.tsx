import Link from "next/link";
import { Package } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ProductNotFound() {
  const t = await getTranslations();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-card text-primary ring-1 ring-gold/30">
        <Package weight="duotone" className="size-6" />
      </div>
      <h1 className="font-display text-[2rem] font-medium">
        {t("notFound.productTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("notFound.productDesc")}
      </p>
      <Link
        href="/"
        className={cn(buttonVariants(), "mt-6 h-10")}
      >
        {t("notFound.productBack")}
      </Link>
    </div>
  );
}
