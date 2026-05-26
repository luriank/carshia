"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CreditCard,
  Plus,
  Star,
  Trash as Trash2,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  deletePaymentMethod,
  listPaymentMethods,
  setDefaultPaymentMethod,
  type PaymentMethodRecord,
} from "@/lib/actions/payment-methods";
import { AddCardForm } from "@/components/payment-methods/add-card-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

type ClientPaymentMethod = Omit<PaymentMethodRecord, "createdAt"> & {
  createdAt: string;
};

const BRAND_LABEL: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  diners: "Diners Club",
  jcb: "JCB",
  unionpay: "UnionPay",
  unknown: "Card",
};

function brandLabel(brand: string): string {
  return BRAND_LABEL[brand.toLowerCase()] ?? brand;
}

/**
 * Pure-CSS card art keyed off the network's brand colour. Looks like an
 * Apple Wallet pass — much friendlier than a plain "•••• 1234" row.
 */
function CardArt({
  brand,
  last4,
  expMonth,
  expYear,
  isDefault,
}: {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}) {
  const palettes: Record<string, string> = {
    visa: "from-[#1a1f71] via-[#2a3a8c] to-[#0f9af7]",
    mastercard: "from-[#231f20] via-[#a44a1a] to-[#f79e1b]",
    amex: "from-[#016fd0] via-[#0a85e6] to-[#26c6da]",
    discover: "from-[#231f20] via-[#544b3d] to-[#f48120]",
    diners: "from-[#0079be] via-[#1d5bbf] to-[#4d8de4]",
    jcb: "from-[#0a4ea2] via-[#b21f24] to-[#26852e]",
    unionpay: "from-[#d10429] via-[#022f63] to-[#00447c]",
  };
  const gradient =
    palettes[brand.toLowerCase()] ??
    "from-slate-800 via-slate-700 to-slate-900";

  const expDisplay = `${String(expMonth).padStart(2, "0")}/${String(
    expYear,
  ).slice(-2)}`;

  return (
    <div
      className={cn(
        "relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)]",
        gradient,
      )}
    >
      {/* sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)]"
      />
      <div className="relative flex items-start justify-between">
        <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ring-1 ring-white/20 backdrop-blur">
          {brandLabel(brand)}
        </span>
        {isDefault ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-foreground shadow-sm">
            <Star weight="fill" className="size-2.5" />
            Default
          </span>
        ) : null}
      </div>
      <div className="relative space-y-2">
        <div className="font-mono text-[1.1rem] tracking-[0.18em] tabular-nums">
          •••• {last4}
        </div>
        <div className="flex items-end justify-between text-[10px] uppercase tracking-wider text-white/75">
          <span>
            <span className="block text-[8px] tracking-widest text-white/50">
              Exp
            </span>
            <span className="font-mono tabular-nums">{expDisplay}</span>
          </span>
          <CreditCard weight="duotone" className="size-7 text-white/85" />
        </div>
      </div>
    </div>
  );
}

export function PaymentMethodsManager({
  initial,
}: {
  initial: ClientPaymentMethod[];
}) {
  const router = useRouter();
  const t = useTranslations();
  const [methods, setMethods] = useState<ClientPaymentMethod[]>(initial);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<ClientPaymentMethod | null>(null);
  const [pending, startTransition] = useTransition();

  async function refresh() {
    const fresh = await listPaymentMethods();
    setMethods(
      fresh.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    );
    router.refresh();
  }

  function onAdded() {
    setAdding(false);
    void refresh();
  }

  function onSetDefault(id: string) {
    startTransition(async () => {
      const res = await setDefaultPaymentMethod(id);
      if (res.ok) {
        toast.success(t("payments.cards.defaultSet"));
        await refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function onConfirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const res = await deletePaymentMethod(deleting.id);
      if (res.ok) {
        toast.message(t("payments.cards.removed"));
        setDeleting(null);
        await refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-medium">
          {t("payments.cards.title")}
        </h2>
        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger
            render={<Button size="sm" variant="outline" className="gap-1.5" />}
          >
            <Plus weight="bold" className="size-4" />
            {t("payments.cards.add")}
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("payments.cards.addNew")}</DialogTitle>
              <DialogDescription>
                {t("payments.cards.addDesc")}
              </DialogDescription>
            </DialogHeader>
            {adding ? (
              <AddCardForm
                hasCards={methods.length > 0}
                onSaved={onAdded}
                onCancel={() => setAdding(false)}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>

      {methods.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={t("payments.cards.none")}
          description={t("payments.cards.noneDesc")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {methods.map((m) => (
            <div key={m.id} className="space-y-3">
              <CardArt
                brand={m.brand}
                last4={m.last4}
                expMonth={m.expMonth}
                expYear={m.expYear}
                isDefault={m.isDefault}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {brandLabel(m.brand)} •••• {m.last4}
                </span>
                <div className="flex items-center gap-1">
                  {!m.isDefault ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={() => onSetDefault(m.id)}
                      disabled={pending}
                      title={t("payments.cards.makeDefault")}
                    >
                      <Star weight="duotone" className="size-3.5" />
                      {t("payments.cards.makeDefault")}
                    </Button>
                  ) : null}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("common.delete")}
                    title={t("common.delete")}
                    onClick={() => setDeleting(m)}
                    disabled={pending}
                  >
                    <Trash2 weight="duotone" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("payments.cards.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("payments.cards.deleteConfirmDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={pending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={pending}
            >
              {t("common.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
