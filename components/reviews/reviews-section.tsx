import Link from "next/link";
import { ChatCircle as MessageSquare } from "@phosphor-icons/react/ssr";
import { getTranslations } from "next-intl/server";
import type { ProductDetail } from "@/lib/queries/product";
import { RatingStars } from "@/components/shared/rating-stars";
import { ReviewComposer } from "@/components/reviews/review-composer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export async function ReviewsSection({
  product,
  currentUserId,
}: {
  product: ProductDetail;
  currentUserId: string | null;
}) {
  const t = await getTranslations();
  const myReview = currentUserId
    ? product.reviews.find((r) => r.userId === currentUserId)
    : undefined;
  const others = product.reviews.filter((r) => r.userId !== currentUserId);
  const maxBar = Math.max(1, ...product.distribution.map((d) => d.count));

  return (
    <section id="reviews" className="scroll-mt-20">
      <h2 className="font-display text-[1.625rem] font-medium sm:text-[1.875rem]">
        {t("productPage.ratingsAndReviews")}
      </h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-5 text-center">
            <div className="text-4xl font-semibold tabular-nums">
              {(product.average || 0).toFixed(1)}
            </div>
            <div className="mt-2 flex justify-center">
              <RatingStars rating={product.average} size="md" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("productPage.reviewsCount", { count: product.reviewCount })}
            </p>
          </div>
          <div className="space-y-2">
            {product.distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-3 text-sm">
                <span className="w-3 tabular-nums text-muted-foreground">
                  {d.star}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${(d.count / maxBar) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right tabular-nums text-muted-foreground">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {currentUserId ? (
            <ReviewComposer
              productId={product.id}
              existing={
                myReview
                  ? { rating: myReview.rating, comment: myReview.comment }
                  : null
              }
            />
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed bg-muted/30 p-5">
              <p className="text-sm text-muted-foreground">
                {t("productPage.signInToReview")}
              </p>
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                {t("productPage.signInCta")}
              </Link>
            </div>
          )}

          {product.reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
              <MessageSquare weight="duotone" className="size-6 text-primary" />
              <p className="text-sm text-muted-foreground">
                {t("productPage.noReviews")}
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {myReview ? (
                <ReviewRow
                  review={myReview}
                  initials={initials(myReview.userName)}
                  mineLabel={t("productPage.yourReviewBadge")}
                  mine
                />
              ) : null}
              {others.map((r) => (
                <ReviewRow
                  key={r.id}
                  review={r}
                  initials={initials(r.userName)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewRow({
  review,
  initials,
  mine,
  mineLabel,
}: {
  review: ProductDetail["reviews"][number];
  initials: string;
  mine?: boolean;
  mineLabel?: string;
}) {
  return (
    <li className="flex gap-4 border-b pb-5 last:border-b-0">
      <Avatar className="size-9">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{review.userName}</span>
          {mine ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-2xs font-medium text-secondary-foreground">
              {mineLabel}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {formatDate(review.createdAt)}
          </span>
        </div>
        <RatingStars rating={review.rating} size="sm" />
        <p className="text-sm leading-relaxed text-foreground/90">
          {review.comment}
        </p>
      </div>
    </li>
  );
}
