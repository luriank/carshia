"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { addressSchema, type AddressInput } from "@/lib/validations/address";
import { createAddress, updateAddress } from "@/lib/actions/address";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type AddressRecord = AddressInput & { id: string };

export function AddressForm({
  address,
  isFirstAddress = false,
  onDone,
}: {
  address?: AddressRecord;
  isFirstAddress?: boolean;
  onDone: () => void;
}) {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  const defaultLocked = isFirstAddress && !address;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: address?.fullName ?? "",
      street: address?.street ?? "",
      city: address?.city ?? "",
      postalCode: address?.postalCode ?? "",
      type: address?.type ?? "Home",
      isDefault: address?.isDefault ?? defaultLocked,
    },
  });

  function onSubmit(values: AddressInput) {
    startTransition(async () => {
      const res = address
        ? await updateAddress(address.id, values)
        : await createAddress(values);
      if (res.ok) {
        toast.success(address ? t("address.updated") : t("address.added"));
        onDone();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <TextField
        id="fullName"
        label={t("address.fullName")}
        placeholder={t("address.fullNamePlaceholder")}
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <TextField
        id="street"
        label={t("address.street")}
        placeholder={t("address.streetPlaceholder")}
        autoComplete="street-address"
        error={errors.street?.message}
        {...register("street")}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          id="city"
          label={t("address.city")}
          placeholder={t("address.cityPlaceholder")}
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register("city")}
        />
        <TextField
          id="postalCode"
          label={t("address.postalCode")}
          placeholder={t("address.postalCodePlaceholder")}
          inputMode="numeric"
          autoComplete="postal-code"
          description={t("address.postalCodeDesc")}
          error={errors.postalCode?.message}
          {...register("postalCode")}
        />
      </div>
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="type">{t("address.label")}</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="type" className="h-9">
                <span className="text-sm">
                  {field.value === "Home"
                    ? t("address.home")
                    : field.value === "Work"
                      ? t("address.work")
                      : t("address.other")}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">{t("address.home")}</SelectItem>
                <SelectItem value="Work">{t("address.work")}</SelectItem>
                <SelectItem value="Other">{t("address.other")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      />
      <Controller
        control={control}
        name="isDefault"
        render={({ field }) => (
          <Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/30 p-3.5 text-sm">
              <Checkbox
                checked={!!field.value}
                disabled={defaultLocked}
                onCheckedChange={(v) => field.onChange(v === true)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">
                  {t("address.setDefault")}
                </span>
                <FieldDescription className="mt-0.5">
                  {defaultLocked
                    ? t("address.setDefaultLocked")
                    : t("address.setDefaultDesc")}
                </FieldDescription>
              </span>
            </label>
          </Field>
        )}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          className="h-10"
        >
          {t("address.cancel")}
        </Button>
        <Button type="submit" disabled={pending} className="h-10">
          {pending
            ? t("address.saving")
            : address
              ? t("address.saveChanges")
              : t("address.add")}
        </Button>
      </div>
    </form>
  );
}
