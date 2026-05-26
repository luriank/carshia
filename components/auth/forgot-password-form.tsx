"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";

type Values = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const res = await forgotPasswordAction(values);
      if (res.ok) {
        setSent(true);
        toast.success(t("auth.forgot.sentToast"));
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <AuthCard
      title={t("auth.forgot.title")}
      description={t("auth.forgot.desc")}
    >
      {sent ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg bg-muted/70 px-3 py-3 text-sm text-muted-foreground">
            {t("auth.forgot.sentDesc")}
          </p>
          <Button
            render={<Link href="/reset-password" />}
            nativeButton={false}
            variant="outline"
            className="h-11 w-full"
          >
            {t("auth.forgot.continue")}
          </Button>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
          >
            <TextField
              id="email"
              label={t("auth.forgot.email")}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              inputClassName="h-11"
              error={errors.email?.message}
              {...register("email")}
            />
            <Button
              type="submit"
              className="mt-2 h-11 w-full"
              disabled={pending}
            >
              {pending
                ? t("auth.forgot.submitting")
                : t("auth.forgot.submit")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.forgot.remembered")}{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {t("auth.forgot.back")}
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
