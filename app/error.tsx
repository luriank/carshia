"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowCounterClockwise } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-[2rem] font-medium sm:text-[2.5rem]">
          {t("error.title")}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("error.desc")}
        </p>
      </div>
      <Button onClick={reset} className="h-11 gap-2">
        <ArrowCounterClockwise weight="bold" className="size-4" />
        {t("error.retry")}
      </Button>
    </div>
  );
}
