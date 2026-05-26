"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { updateProfile } from "@/lib/actions/profile";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";

export function ProfileView({
  initial,
}: {
  initial: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });

  function onSubmit(values: ProfileInput) {
    startTransition(async () => {
      const res = await updateProfile(values);
      if (res.ok) {
        toast.success(t("profile.updated"));
        reset(values);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-4 sm:grid-cols-2"
    >
      <TextField
        id="name"
        label={t("profile.fullName")}
        placeholder={t("profile.fullNamePlaceholder")}
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        id="email"
        label={t("profile.email")}
        type="email"
        placeholder={t("profile.emailPlaceholder")}
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="sm:col-span-2">
        <TextField
          id="phone"
          label={t("profile.phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t("profile.phonePlaceholder")}
          description={t("profile.phoneDesc")}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>
      <div className="sm:col-span-2">
        <Button
          type="submit"
          disabled={pending || !isDirty}
          className="h-10"
        >
          {pending ? t("profile.saving") : t("profile.saveChanges")}
        </Button>
      </div>
    </form>
  );
}
