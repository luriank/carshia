"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetPasswordAction } from "@/lib/actions/auth";
import { TextField, PasswordField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";

type Values = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      try {
        setValue("email", atob(token));
      } catch {
        // ignore malformed token
      }
    }
  }, [params, setValue]);

  function onSubmit(values: Values) {
    startTransition(async () => {
      const res = await resetPasswordAction(values);
      if (res.ok) {
        toast.success(t("auth.reset.updated"));
        router.push("/login");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <AuthCard
      title={t("auth.reset.title")}
      description={t("auth.reset.desc")}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <TextField
          id="email"
          label={t("auth.reset.email")}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          inputClassName="h-11"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="password"
          label={t("auth.reset.password")}
          autoComplete="new-password"
          placeholder={t("auth.reset.passwordHint")}
          inputClassName="h-11"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button
          type="submit"
          className="mt-2 h-11 w-full"
          disabled={pending}
        >
          {pending
            ? t("auth.reset.submitting")
            : t("auth.reset.submit")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("auth.reset.back")}
        </Link>
      </p>
    </AuthCard>
  );
}
