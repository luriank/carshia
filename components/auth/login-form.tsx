"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/lib/actions/auth";
import { TextField, PasswordField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const res = await loginAction(values);
      if (res.ok) {
        toast.success(t("auth.login.welcome"));
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(t("auth.login.invalid"));
      }
    });
  }

  return (
    <AuthCard
      title={t("auth.login.title")}
      description={t("auth.login.desc")}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <TextField
          id="email"
          label={t("auth.login.email")}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          inputClassName="h-11"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="password"
          label={t("auth.login.password")}
          autoComplete="current-password"
          placeholder="••••••••"
          inputClassName="h-11"
          error={errors.password?.message}
          {...register("password")}
        />
        <Link
          href="/forgot-password"
          className="-mt-1 self-end text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("auth.login.forgot")}
        </Link>
        <Button
          type="submit"
          className="mt-2 h-11 w-full"
          disabled={pending}
        >
          {pending ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.login.newHere")}{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("auth.login.create")}
        </Link>
      </p>
      <p className="mt-4 rounded-lg bg-muted/70 px-3 py-2 text-center text-xs text-muted-foreground">
        {t("auth.login.demo")}
      </p>
    </AuthCard>
  );
}
