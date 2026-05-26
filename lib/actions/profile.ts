"use server";

import { revalidatePath } from "next/cache";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { profileSchema } from "@/lib/validations/profile";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Authoritative phone check. Server-only (libphonenumber-js metadata stays
 * out of the client bundle). Accepts `XK` (Kosovo) numbers and normalizes
 * to E.164, or returns null if the input is genuinely invalid. Empty input
 * is treated as "no phone" and returns `""`.
 */
function parseKosovoPhone(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") return "";
  const parsed = parsePhoneNumberFromString(trimmed, "XK");
  return parsed?.isValid() ? parsed.number : null;
}

export async function updateProfile(
  input: unknown,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid details.",
    };
  }

  const normalizedPhone = parseKosovoPhone(parsed.data.phone);
  if (normalizedPhone === null) {
    return { ok: false, error: "Enter a valid Kosovo phone number" };
  }

  const email = parsed.data.email.toLowerCase();

  if (email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) {
      return { ok: false, error: "That email is already in use." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      email,
      phone: normalizedPhone === "" ? null : normalizedPhone,
    },
  });
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { ok: true };
}
