"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { signupAction } from "@/lib/actions/auth";
import { TextField, PasswordField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";

export function SignupForm() {
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  function onSubmit(values: SignupInput) {
    startTransition(async () => {
      const res = await signupAction(values);
      if (res.ok) {
        toast.success(t("auth.signup.created"));
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <AuthCard
      title={t("auth.signup.title")}
      description={t("auth.signup.desc")}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <TextField
          id="name"
          label={t("auth.signup.name")}
          autoComplete="name"
          placeholder="Arta Krasniqi"
          inputClassName="h-11"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextField
          id="email"
          label={t("auth.signup.email")}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          inputClassName="h-11"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="password"
          label={t("auth.signup.password")}
          autoComplete="new-password"
          placeholder={t("auth.signup.passwordHint")}
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
            ? t("auth.signup.submitting")
            : t("auth.signup.submit")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.signup.haveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("auth.signup.signIn")}
        </Link>
      </p>
    </AuthCard>
  );
}
