"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { addressSchema } from "@/lib/validations/address";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

/**
 * Two simultaneous `setDefaultAddress` (or similar isDefault transitions)
 * can race under READ COMMITTED: T1 clears the old default, T2's clearing
 * matches zero rows, both attempt to set TRUE → second commit hits the
 * partial unique index. Translate that into a clean retry signal.
 */
function isDefaultCollision(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

export async function getAddresses() {
  const user = await requireUser();
  return prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export async function createAddress(
  input: unknown,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid address.",
    };
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const existing = await tx.address.count({ where: { userId: user.id } });
      const shouldBeDefault = existing === 0 || parsed.data.isDefault;
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: { ...parsed.data, isDefault: shouldBeDefault, userId: user.id },
      });
    });
    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { ok: true, id: created.id };
  } catch (err) {
    if (isDefaultCollision(err)) {
      return {
        ok: false,
        error: "Default address changed in another tab — please try again.",
      };
    }
    throw err;
  }
}

export async function updateAddress(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid address.",
    };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const own = await tx.address.findFirst({
        where: { id, userId: user.id },
        select: { id: true, isDefault: true },
      });
      if (!own) return null;
      if (parsed.data.isDefault && !own.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      const nextIsDefault = parsed.data.isDefault || own.isDefault;
      return tx.address.update({
        where: { id: own.id },
        data: { ...parsed.data, isDefault: nextIsDefault },
      });
    });

    if (!updated) return { ok: false, error: "Address not found." };
    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { ok: true, id: updated.id };
  } catch (err) {
    if (isDefaultCollision(err)) {
      return {
        ok: false,
        error: "Default address changed in another tab — please try again.",
      };
    }
    throw err;
  }
}

export async function setDefaultAddress(id: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    const result = await prisma.$transaction(async (tx) => {
      const own = await tx.address.findFirst({
        where: { id, userId: user.id },
        select: { id: true },
      });
      if (!own) return null;
      await tx.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
      return tx.address.update({
        where: { id: own.id },
        data: { isDefault: true },
      });
    });
    if (!result) return { ok: false, error: "Address not found." };
    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { ok: true, id: result.id };
  } catch (err) {
    if (isDefaultCollision(err)) {
      return {
        ok: false,
        error: "Default address changed in another tab — please try again.",
      };
    }
    throw err;
  }
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await prisma.$transaction(async (tx) => {
      const own = await tx.address.findFirst({
        where: { id, userId: user.id },
        select: { id: true, isDefault: true },
      });
      if (!own) return;
      await tx.address.delete({ where: { id: own.id } });
      if (own.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });
        if (next) {
          await tx.address.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }
    });
    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (err) {
    if (isDefaultCollision(err)) {
      return {
        ok: false,
        error: "Default address changed in another tab — please try again.",
      };
    }
    throw err;
  }
}
