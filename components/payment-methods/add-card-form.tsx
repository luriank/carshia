"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Lock } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  createPaymentSetupIntent,
  savePaymentMethod,
} from "@/lib/actions/payment-methods";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription } from "@/components/ui/field";

let stripePromiseSingleton: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (stripePromiseSingleton) return stripePromiseSingleton;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  stripePromiseSingleton = key ? loadStripe(key) : Promise.resolve(null);
  return stripePromiseSingleton;
}

function CardSetupFields({
  hasCards,
  onSaved,
  onCancel,
}: {
  hasCards: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations();
  const stripe = useStripe();
  const elements = useElements();
  const [makeDefault, setMakeDefault] = useState(!hasCards);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });
    if (error) {
      const msg = error.message ?? t("payments.cards.cardError");
      toast.error(msg);
      setSubmitting(false);
      return;
    }
    if (!setupIntent || typeof setupIntent.payment_method !== "string") {
      toast.error(t("payments.cards.cardError"));
      setSubmitting(false);
      return;
    }
    const paymentMethodId = setupIntent.payment_method;
    startTransition(async () => {
      const res = await savePaymentMethod({
        paymentMethodId,
        makeDefault,
      });
      if (!res.ok) {
        toast.error(res.error);
        setSubmitting(false);
        return;
      }
      toast.success(t("payments.cards.added"));
      onSaved();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
          wallets: { applePay: "never", googlePay: "never" },
        }}
      />

      {hasCards ? (
        <Field>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/30 p-3.5 text-sm">
            <Checkbox
              checked={makeDefault}
              onCheckedChange={(v) => setMakeDefault(v === true)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">
                {t("payments.cards.setDefault")}
              </span>
              <FieldDescription className="mt-0.5">
                {t("payments.cards.setDefaultDesc")}
              </FieldDescription>
            </span>
          </label>
        </Field>
      ) : null}

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="h-10"
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || submitting}
          className="h-10 gap-2"
        >
          <Lock weight="duotone" className="size-4" />
          {submitting
            ? t("payments.cards.saving")
            : t("payments.cards.saveCard")}
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock weight="duotone" className="size-3.5" />
        {t("payments.cards.securedByStripe")}
      </p>
    </form>
  );
}

export function AddCardForm({
  hasCards,
  onSaved,
  onCancel,
}: {
  hasCards: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations();
  const { resolvedTheme } = useTheme();
  const stripePromise = useMemo(() => getStripePromise(), []);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await createPaymentSetupIntent();
      if (cancelled) return;
      if (res.ok) {
        setClientSecret(res.clientSecret);
      } else {
        setError(res.error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel} className="h-10">
            {t("common.close")}
          </Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {t("payments.cards.preparing")}
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: resolvedTheme === "dark" ? "night" : "stripe",
          variables: { colorPrimary: "#b8893f", borderRadius: "10px" },
        },
      }}
    >
      <CardSetupFields
        hasCards={hasCards}
        onSaved={onSaved}
        onCancel={onCancel}
      />
    </Elements>
  );
}
