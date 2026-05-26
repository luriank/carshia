"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  PencilSimple as Pencil,
  Plus,
  ArrowCounterClockwise as RotateCcw,
  Star,
  Trash as Trash2,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { setProductDeleted } from "@/lib/actions/admin";
import type { AdminProduct } from "@/lib/queries/admin";
import { formatPrice } from "@/lib/format";
import { ProductForm } from "@/components/admin/product-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

export function AdminProducts({
  products,
  categories,
  brands,
  page,
  totalPages,
  total,
}: {
  products: AdminProduct[];
  categories: Option[];
  brands: Option[];
  page: number;
  totalPages: number;
  total: number;
}) {
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [pending, startTransition] = useTransition();
  const showDeleted = params.get("showDeleted") === "1";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/admin?${next.toString()}`);
  }

  function toggleDeleted(id: string, isDeleted: boolean) {
    startTransition(async () => {
      const res = await setProductDeleted(id, isDeleted);
      if (res.ok) {
        toast.success(
          isDeleted
            ? t("admin.products.archivedToast")
            : t("admin.products.restoredToast"),
        );
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function pageHref(p: number) {
    const next = new URLSearchParams(params.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    return `/admin?${next.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[1.875rem] font-medium sm:text-[2.25rem]">
            {t("admin.products.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.products.count", { count: total })}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button className="h-10 gap-1.5" />}>
            <Plus weight="bold" className="size-4" />
            {t("admin.products.new")}
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("admin.products.create")}</DialogTitle>
            </DialogHeader>
            <ProductForm
              categories={categories}
              brands={brands}
              onDone={() => {
                setCreateOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          defaultValue={params.get("q") ?? ""}
          placeholder={t("admin.products.searchPlaceholder")}
          aria-label="Search products"
          className="h-9 w-full max-w-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter")
              setParam("q", (e.target as HTMLInputElement).value || null);
          }}
        />
        <Button
          variant={showDeleted ? "secondary" : "outline"}
          size="sm"
          onClick={() => setParam("showDeleted", showDeleted ? null : "1")}
        >
          {showDeleted
            ? t("admin.products.showingArchived")
            : t("admin.products.showArchived")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.products.colProduct")}</TableHead>
              <TableHead>{t("admin.products.colCategory")}</TableHead>
              <TableHead>{t("admin.products.colBrand")}</TableHead>
              <TableHead className="text-right">
                {t("admin.products.colPrice")}
              </TableHead>
              <TableHead className="text-right">
                {t("admin.products.colStock")}
              </TableHead>
              <TableHead>{t("admin.products.colStatus")}</TableHead>
              <TableHead className="text-right">
                {t("admin.products.colActions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {t("admin.products.none")}
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted/40">
                        <Image
                          src={p.thumbnail}
                          alt={p.title}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      </div>
                      <span className="line-clamp-1 max-w-[16rem] text-sm font-medium">
                        {p.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.categoryName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.brandName}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatPrice(p.price)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {p.stockQuantity}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        p.isDeleted
                          ? "bg-destructive/15 text-destructive"
                          : "bg-primary/15 text-primary",
                      )}
                    >
                      {p.isDeleted
                        ? t("admin.products.archived")
                        : t("admin.products.active")}
                    </span>
                    {p.isFeatured ? (
                      <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold-foreground">
                        <Star weight="fill" className="size-3" />
                        {t("admin.products.featured")}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Dialog
                        open={editing?.id === p.id}
                        onOpenChange={(o) => setEditing(o ? p : null)}
                      >
                        <DialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edit"
                            />
                          }
                        >
                          <Pencil weight="duotone" />
                        </DialogTrigger>
                        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                            {t("admin.products.edit")}
                          </DialogTitle>
                          </DialogHeader>
                          <ProductForm
                            product={p}
                            categories={categories}
                            brands={brands}
                            onDone={() => {
                              setEditing(null);
                              router.refresh();
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={p.isDeleted ? "Restore" : "Archive"}
                        disabled={pending}
                        onClick={() => toggleDeleted(p.id, !p.isDeleted)}
                      >
                        {p.isDeleted ? <RotateCcw weight="duotone" /> : <Trash2 weight="duotone" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={pageHref(page - 1)}
            aria-disabled={page <= 1}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              page <= 1 && "pointer-events-none opacity-40",
            )}
          >
            {t("admin.products.prev")}
          </Link>
          <span className="text-sm text-muted-foreground tabular-nums">
            {t("admin.products.page", { page, total: totalPages })}
          </span>
          <Link
            href={pageHref(page + 1)}
            aria-disabled={page >= totalPages}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              page >= totalPages && "pointer-events-none opacity-40",
            )}
          >
            {t("admin.products.next")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
