"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  MapPin,
  PencilSimple as Pencil,
  Plus,
  Star,
  Trash as Trash2,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  deleteAddress,
  getAddresses,
  setDefaultAddress,
} from "@/lib/actions/address";
import { AddressForm } from "@/components/address/address-form";
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

type AddressRecord = {
  id: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  type: "Home" | "Work" | "Other";
  isDefault: boolean;
};

export function AddressManager({
  initial,
  phone,
}: {
  initial: AddressRecord[];
  phone: string | null;
}) {
  const router = useRouter();
  const t = useTranslations();
  const [addresses, setAddresses] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AddressRecord | null>(null);
  const [deleting, setDeleting] = useState<AddressRecord | null>(null);
  const [pending, startTransition] = useTransition();

  async function refresh() {
    setAddresses((await getAddresses()) as AddressRecord[]);
    router.refresh();
  }

  function onDone() {
    setAdding(false);
    setEditing(null);
    void refresh();
  }

  function onConfirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const res = await deleteAddress(deleting.id);
      if (res.ok) {
        toast.message(t("address.removed"));
        setDeleting(null);
        await refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function onSetDefault(id: string) {
    startTransition(async () => {
      const res = await setDefaultAddress(id);
      if (res.ok) {
        toast.success(t("address.defaultSet"));
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
          {t("address.managerTitle")}
        </h2>
        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger
            render={<Button size="sm" variant="outline" className="gap-1.5" />}
          >
            <Plus weight="bold" className="size-4" />
            {t("address.add")}
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("address.addNew")}</DialogTitle>
            </DialogHeader>
            <AddressForm
              isFirstAddress={addresses.length === 0}
              onDone={onDone}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={t("address.none")}
          description={t("address.noneDesc")}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="space-y-2 rounded-xl border bg-card p-4 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {a.type === "Home"
                      ? t("address.home")
                      : a.type === "Work"
                        ? t("address.work")
                        : t("address.other")}
                  </span>
                  {a.isDefault ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold-foreground ring-1 ring-gold/30">
                      <Star weight="fill" className="size-3" aria-hidden />
                      {t("address.defaultBadge")}
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  {!a.isDefault ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={t("address.makeDefault")}
                      title={t("address.makeDefault")}
                      disabled={pending}
                      onClick={() => onSetDefault(a.id)}
                    >
                      <Star weight="duotone" />
                    </Button>
                  ) : null}
                  <Dialog
                    open={editing?.id === a.id}
                    onOpenChange={(o) => setEditing(o ? a : null)}
                  >
                    <DialogTrigger
                      render={
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={t("common.edit")}
                        />
                      }
                    >
                      <Pencil weight="duotone" />
                    </DialogTrigger>
                    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{t("address.editTitle")}</DialogTitle>
                      </DialogHeader>
                      <AddressForm address={a} onDone={onDone} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("common.delete")}
                    disabled={pending}
                    onClick={() => setDeleting(a)}
                  >
                    <Trash2 weight="duotone" />
                  </Button>
                </div>
              </div>
              <p className="font-medium">{a.fullName}</p>
              <p className="text-muted-foreground">
                {a.street}, {a.city} {a.postalCode}
                {phone ? (
                  <>
                    <br />
                    {phone}
                  </>
                ) : null}
              </p>
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
            <DialogTitle>{t("address.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("address.deleteConfirmDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={pending}
            >
              {t("address.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={pending}
            >
              {t("address.deleteAction")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
