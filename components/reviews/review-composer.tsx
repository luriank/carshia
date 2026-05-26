"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { deleteReview, upsertReview } from "@/lib/actions/review";
import { RatingInput } from "@/components/reviews/rating-input";
import { TextAreaField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function ReviewComposer({
  productId,
  existing,
}: {
  productId: string;
  existing?: { rating: number; comment: string } | null;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existing?.rating ?? 0,
      comment: existing?.comment ?? "",
    },
  });

  function onSubmit(values: ReviewInput) {
    startTransition(async () => {
      const res = await upsertReview(productId, values);
      if (res.ok) {
        toast.success(
          existing
            ? t("productPage.reviewUpdated")
            : t("productPage.reviewPosted"),
        );
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function onDelete() {
    startDelete(async () => {
      const res = await deleteReview(productId);
      if (res.ok) {
        toast.message(t("productPage.reviewRemoved"));
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
      className="space-y-4 rounded-xl border bg-card p-5"
    >
      <div>
        <h3 className="text-sm font-semibold">
          {existing
            ? t("productPage.editReview")
            : t("productPage.writeReview")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("productPage.reviewHint")}
        </p>
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-medium">
          {t("productPage.yourRating")}
        </span>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <RatingInput
              value={field.value}
              onChange={field.onChange}
              disabled={pending}
            />
          )}
        />
        {errors.rating ? (
          <FieldError>{errors.rating.message}</FieldError>
        ) : null}
      </div>

      <TextAreaField
        id="comment"
        label={t("productPage.yourReview")}
        rows={4}
        placeholder={t("productPage.reviewPlaceholder")}
        error={errors.comment?.message}
        {...register("comment")}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="h-10">
          {pending
            ? t("productPage.saving")
            : existing
              ? t("productPage.updateReview")
              : t("productPage.postReview")}
        </Button>
        {existing ? (
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={onDelete}
            className="h-10"
          >
            {deleting
              ? t("productPage.removing")
              : t("productPage.deleteReview")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
