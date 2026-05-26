"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/lib/actions/admin";
import { TextField, TextAreaField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type Option = { id: string; name: string };

type ExistingProduct = {
  id: string;
  title: string;
  titleEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  price: number;
  discountPercentage: number;
  stockQuantity: number;
  thumbnail: string;
  images: string[];
  categoryId: string;
  brandId: string;
  isFeatured?: boolean;
};

export function ProductForm({
  product,
  categories,
  brands,
  onDone,
}: {
  product?: ExistingProduct;
  categories: Option[];
  brands: Option[];
  onDone: () => void;
}) {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title ?? "",
      titleEn: product?.titleEn ?? "",
      description: product?.description ?? "",
      descriptionEn: product?.descriptionEn ?? "",
      price: product?.price ?? 0,
      discountPercentage: product?.discountPercentage ?? 0,
      stockQuantity: product?.stockQuantity ?? 0,
      thumbnail: product?.thumbnail ?? "",
      images: product?.images.join("\n") ?? "",
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      isFeatured: product?.isFeatured ?? false,
    },
  });

  function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const res = product
        ? await updateProduct(product.id, values)
        : await createProduct(values);
      if (res.ok) {
        toast.success(
          product
            ? t("admin.products.edited")
            : t("admin.products.created"),
        );
        onDone();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="title"
          label={t("admin.form.titleField")}
          error={errors.title?.message}
          {...register("title")}
        />
        <TextField
          id="titleEn"
          label={t("admin.form.titleEnField")}
          error={errors.titleEn?.message}
          {...register("titleEn")}
        />
      </div>
      <TextAreaField
        id="description"
        label={t("admin.form.description")}
        rows={3}
        error={errors.description?.message}
        {...register("description")}
      />
      <TextAreaField
        id="descriptionEn"
        label={t("admin.form.descriptionEnField")}
        rows={3}
        error={errors.descriptionEn?.message}
        {...register("descriptionEn")}
      />
      <div className="grid grid-cols-3 gap-4">
        <TextField
          id="price"
          label={t("admin.form.price")}
          type="number"
          inputMode="decimal"
          step="0.01"
          error={errors.price?.message}
          {...register("price")}
        />
        <TextField
          id="discountPercentage"
          label={t("admin.form.discount")}
          type="number"
          inputMode="decimal"
          step="0.01"
          error={errors.discountPercentage?.message}
          {...register("discountPercentage")}
        />
        <TextField
          id="stockQuantity"
          label={t("admin.form.stock")}
          type="number"
          inputMode="numeric"
          error={errors.stockQuantity?.message}
          {...register("stockQuantity")}
        />
      </div>
      <TextField
        id="thumbnail"
        label={t("admin.form.thumbnail")}
        error={errors.thumbnail?.message}
        {...register("thumbnail")}
      />
      <TextAreaField
        id="images"
        label={t("admin.form.images")}
        description={t("admin.form.imagesHint")}
        rows={3}
        error={errors.images?.message}
        {...register("images")}
      />
      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="categoryId">
                {t("admin.form.category")}
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="categoryId" className="h-9">
                  <span className="truncate text-sm">
                    {categories.find((c) => c.id === field.value)?.name ??
                      t("admin.form.select")}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId ? (
                <FieldError>{errors.categoryId.message}</FieldError>
              ) : null}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="brandId"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="brandId">
                {t("admin.form.brand")}
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="brandId" className="h-9">
                  <span className="truncate text-sm">
                    {brands.find((b) => b.id === field.value)?.name ??
                      t("admin.form.select")}
                  </span>
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brandId ? (
                <FieldError>{errors.brandId.message}</FieldError>
              ) : null}
            </Field>
          )}
        />
      </div>
      <Controller
        control={control}
        name="isFeatured"
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-muted/30 p-3.5 text-sm">
            <Checkbox
              checked={!!field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
            />
            <span>
              <span className="font-medium">
                {t("admin.form.featured")}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t("admin.form.featuredHint")}
              </span>
            </span>
          </label>
        )}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          className="h-10"
        >
          {t("admin.form.cancel")}
        </Button>
        <Button type="submit" disabled={pending} className="h-10">
          {pending
            ? t("admin.form.saving")
            : product
              ? t("admin.form.save")
              : t("admin.form.createSubmit")}
        </Button>
      </div>
    </form>
  );
}
