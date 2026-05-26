"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldCheck } from "@phosphor-icons/react/ssr";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { adminLoginAction } from "@/lib/actions/auth";
import { TextField, PasswordField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";

export function AdminLoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
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
      const res = await adminLoginAction(values);
      if (res.ok) {
        toast.success(t("auth.adminLogin.welcome"));
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(t("auth.adminLogin.invalid"));
      }
    });
  }

  return (
    <AuthCard
      title={t("auth.adminLogin.title")}
      description={t("auth.adminLogin.desc")}
      icon={
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/10">
          <ShieldCheck weight="duotone" className="size-6" />
        </div>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <TextField
          id="email"
          label={t("auth.adminLogin.email")}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          inputClassName="h-11"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="password"
          label={t("auth.adminLogin.password")}
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
          {t("auth.adminLogin.forgot")}
        </Link>
        <Button type="submit" className="mt-2 h-11 w-full" disabled={pending}>
          {pending
            ? t("auth.adminLogin.submitting")
            : t("auth.adminLogin.submit")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.adminLogin.notStore")}{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("auth.adminLogin.storeLogin")}
        </Link>
      </p>
    </AuthCard>
  );
}
