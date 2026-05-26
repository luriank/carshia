"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  CreditCard,
  Lock,
  MapPin,
  Plus,
  ShoppingBag,
  Truck,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { getAddresses } from "@/lib/actions/address";
import { finalizeCardPayment, placeOrder } from "@/lib/actions/order";
import { formatPrice } from "@/lib/format";
import { AddressForm } from "@/components/address/address-form";
import { EmptyState } from "@/components/shared/empty-state";
import { FadeIn } from "@/components/shared/motion";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AddressRecord = {
  id: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  type: "Home" | "Work" | "Other";
  isDefault: boolean;
};

type CartLine = {
  id: string;
  title: string;
  thumbnail: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type Totals = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

type CardSession = {
  clientSecret: string;
  orderId: string;
};

let stripePromiseSingleton: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (stripePromiseSingleton) return stripePromiseSingleton;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  stripePromiseSingleton = key ? loadStripe(key) : Promise.resolve(null);
  return stripePromiseSingleton;
}

function CheckoutSteps({ current }: { current: number }) {
  const t = useTranslations();
  const steps = [
    { icon: ShoppingBag, label: t("checkout.stepCart") },
    { icon: MapPin, label: t("checkout.stepDelivery") },
    { icon: CreditCard, label: t("checkout.stepPayment") },
    { icon: CheckCircle, label: t("checkout.stepConfirm") },
  ];
  return (
    <ol className="mb-8 flex items-center">
      {steps.map((step, i) => {
        const reached = i <= current;
        const done = i < current;
        const Icon = done ? Check : step.icon;
        return (
          <li
            key={step.label}
            className="flex flex-1 flex-col items-center"
          >
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  i === 0
                    ? "opacity-0"
                    : reached
                      ? "bg-primary"
                      : "bg-border",
                )}
              />
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground",
                  i === current &&
                    "ring-4 ring-primary/15 dark:ring-primary/25",
                )}
              >
                <Icon weight="duotone" className="size-4" />
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  i === steps.length - 1
                    ? "opacity-0"
                    : i < current
                      ? "bg-primary"
                      : "bg-border",
                )}
              />
            </div>
            <span
              className={cn(
                "mt-2 text-center text-[0.7rem] sm:text-xs",
                reached
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function CardPaymentForm({
  total,
  orderId,
  onBack,
}: {
  total: number;
  orderId: string;
  onBack: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}?success=1`,
      },
    });

    if (confirmError) {
      const msg = confirmError.message ?? t("checkout.cardGenericError");
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      const finalize = await finalizeCardPayment({
        orderId,
        paymentIntentId: paymentIntent.id,
      });
      if (!finalize.ok) {
        // Payment succeeded with Stripe but our finalize couldn't run — the
        // webhook will still settle the order. Send the user through anyway.
        console.warn("[checkout] finalize failed", finalize.error);
      }
      toast.success(t("checkout.orderPlaced"));
      router.push(`/order/${orderId}?success=1`);
      return;
    }

    // Some flows (e.g. 3DS redirect) won't return paymentIntent — they'll
    // navigate to return_url instead. If we're still here without a status,
    // treat it as pending.
    if (paymentIntent && paymentIntent.status === "processing") {
      toast.message(t("checkout.cardProcessingTitle"));
      router.push(`/order/${orderId}?success=1`);
      return;
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
        }}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
        <Button
          type="button"
          variant="outline"
          className="h-12 gap-1.5"
          onClick={onBack}
          disabled={submitting}
        >
          <ArrowLeft weight="bold" className="size-4" />
          {t("checkout.back")}
        </Button>
        <Button
          type="submit"
          className="h-12 gap-2"
          disabled={!stripe || !elements || submitting}
        >
          <Lock weight="duotone" className="size-4" />
          {submitting
            ? t("checkout.cardConfirming")
            : t("checkout.cardPayNow", { amount: formatPrice(total) })}
        </Button>
      </div>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock weight="duotone" className="size-3.5" />
        {t("checkout.cardSecuredByStripe")}
      </p>
    </form>
  );
}

export function CheckoutView({
  items,
  totals,
  addresses: initialAddresses,
}: {
  items: CartLine[];
  totals: Totals;
  addresses: AddressRecord[];
}) {
  const router = useRouter();
  const t = useTranslations();
  const { resolvedTheme } = useTheme();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [addressId, setAddressId] = useState(
    (initialAddresses.find((a) => a.isDefault) ?? initialAddresses[0])?.id ??
      "",
  );
  const [payment, setPayment] = useState<"COD" | "CARD">("COD");
  const [addOpen, setAddOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [cardSession, setCardSession] = useState<CardSession | null>(null);

  // Invalidate any in-flight card session if the customer changes their
  // address or payment method — totals or recipient may have moved.
  useEffect(() => {
    setCardSession(null);
  }, [addressId, payment]);

  const stripePromise = useMemo(() => getStripePromise(), []);

  async function onAddressAdded() {
    setAddOpen(false);
    const fresh = (await getAddresses()) as AddressRecord[];
    setAddresses(fresh);
    if (fresh.length) setAddressId(fresh[fresh.length - 1].id);
    router.refresh();
  }

  function submit() {
    if (!addressId) {
      toast.error(t("checkout.selectAddress"));
      return;
    }
    startTransition(async () => {
      const res = await placeOrder({ addressId, paymentMode: payment });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      if (payment === "COD") {
        toast.success(t("checkout.orderPlaced"));
        router.push(`/order/${res.orderId}?success=1`);
        return;
      }

      if (!res.clientSecret) {
        toast.error(t("checkout.cardGenericError"));
        return;
      }
      setCardSession({
        clientSecret: res.clientSecret,
        orderId: res.orderId,
      });
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={t("checkout.emptyCart")}
        description={t("cart.emptyDesc")}
        action={
          <Link href="/" className={cn(buttonVariants(), "h-10 px-5")}>
            {t("checkout.browseProducts")}
          </Link>
        }
      />
    );
  }

  const currentStep = cardSession ? 3 : addressId ? 3 : 1;

  return (
    <FadeIn>
      <CheckoutSteps current={currentStep} />

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-medium">
                <MapPin weight="duotone" className="size-4 text-primary" />
                {t("checkout.deliveryAddress")}
              </h2>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm" className="gap-1.5" />
                  }
                >
                  <Plus weight="bold" className="size-4" />
                  {t("checkout.new")}
                </DialogTrigger>
                <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t("checkout.addAddress")}</DialogTitle>
                  </DialogHeader>
                  <AddressForm onDone={onAddressAdded} />
                </DialogContent>
              </Dialog>
            </div>

            {addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                {t("checkout.addPrompt")}
              </div>
            ) : (
              <RadioGroup
                value={addressId}
                onValueChange={(v) => setAddressId(String(v))}
                className="gap-3"
                disabled={!!cardSession}
              >
                {addresses.map((a) => {
                  const selected = addressId === a.id;
                  return (
                    <label
                      key={a.id}
                      htmlFor={`addr-${a.id}`}
                      className={cn(
                        "relative flex cursor-pointer gap-3 rounded-2xl border bg-card p-4 text-sm shadow-sm transition-all",
                        selected
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/40 hover:bg-muted/40",
                        cardSession && "pointer-events-none opacity-60",
                      )}
                    >
                      <RadioGroupItem
                        id={`addr-${a.id}`}
                        value={a.id}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {a.fullName}{" "}
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({a.type})
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          {a.street}, {a.city} {a.postalCode}
                        </p>
                      </div>
                      {selected ? (
                        <CheckCircle weight="duotone" className="size-5 shrink-0 text-primary" />
                      ) : null}
                    </label>
                  );
                })}
              </RadioGroup>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 font-display text-xl font-medium">
              <CreditCard weight="duotone" className="size-4 text-primary" />
              {t("checkout.payment")}
            </h2>
            <RadioGroup
              value={payment}
              onValueChange={(v) => setPayment(v as "COD" | "CARD")}
              className="gap-3"
              disabled={!!cardSession}
            >
              {[
                {
                  v: "COD" as const,
                  icon: Truck,
                  title: t("checkout.codTitle"),
                  desc: t("checkout.codDesc"),
                },
                {
                  v: "CARD" as const,
                  icon: CreditCard,
                  title: t("checkout.cardTitle"),
                  desc: t("checkout.cardDesc"),
                },
              ].map((p) => {
                const selected = payment === p.v;
                return (
                  <label
                    key={p.v}
                    htmlFor={`pay-${p.v}`}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-4 text-sm shadow-sm transition-all",
                      selected
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-primary/40 hover:bg-muted/40",
                      cardSession && "pointer-events-none opacity-60",
                    )}
                  >
                    <RadioGroupItem id={`pay-${p.v}`} value={p.v} />
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full",
                        selected
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <p.icon weight="duotone" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-muted-foreground">{p.desc}</p>
                    </div>
                    {selected ? (
                      <CheckCircle weight="duotone" className="size-5 shrink-0 text-primary" />
                    ) : null}
                  </label>
                );
              })}
            </RadioGroup>

            {cardSession ? (
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                  <CreditCard weight="duotone" className="size-4 text-primary" />
                  {t("checkout.cardEnterDetails")}
                </p>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: cardSession.clientSecret,
                    appearance: {
                      theme: resolvedTheme === "dark" ? "night" : "stripe",
                      variables: {
                        colorPrimary: "#b8893f",
                        borderRadius: "10px",
                      },
                    },
                  }}
                >
                  <CardPaymentForm
                    total={totals.total}
                    orderId={cardSession.orderId}
                    onBack={() => setCardSession(null)}
                  />
                </Elements>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-display text-xl font-medium">
              {t("checkout.orderSummary")}
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("checkout.itemsTitle")}
            </p>
            <ul className="max-h-56 space-y-3 overflow-y-auto">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted/40">
                    <Image
                      src={i.thumbnail}
                      alt={i.title}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm">{i.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.quantity} × {formatPrice(i.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {formatPrice(i.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator />
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("checkout.subtotal")}
                </dt>
                <dd className="tabular-nums">
                  {formatPrice(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("checkout.shipping")}
                </dt>
                <dd className="tabular-nums">
                  {totals.shipping === 0
                    ? t("common.free")
                    : formatPrice(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("checkout.tax")}</dt>
                <dd className="tabular-nums">{formatPrice(totals.tax)}</dd>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-base font-semibold">
                <dt>{t("checkout.total")}</dt>
                <dd className="tabular-nums">{formatPrice(totals.total)}</dd>
              </div>
            </dl>
            {cardSession ? (
              <p className="text-center text-xs text-muted-foreground">
                {t("checkout.cardCompletePayment")}
              </p>
            ) : (
              <>
                <Button
                  className="h-12 w-full gap-2"
                  disabled={pending || !addressId}
                  onClick={submit}
                >
                  <Lock weight="duotone" className="size-4" />
                  {pending
                    ? payment === "CARD"
                      ? t("checkout.cardPreparing")
                      : t("checkout.placing")
                    : payment === "CARD"
                      ? t("checkout.continueToCard")
                      : t("checkout.placeOrder")}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock weight="duotone" className="size-3.5" />
                  {t("checkout.secure")}
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </FadeIn>
  );
}
