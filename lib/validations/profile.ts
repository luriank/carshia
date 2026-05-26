import { z } from "zod";

/**
 * Client-safe phone validation. Just structural — accepts a phone-shaped
 * string (digits with optional `+` / spaces / dashes, 6–20 chars). The
 * authoritative Kosovo-region check (libphonenumber-js, `XK`) runs only
 * server-side in `lib/actions/profile.ts`, so the libphonenumber metadata
 * blob never reaches the client bundle.
 *
 * No `.default("")` here for the same reason as `addressSchema` — keeping
 * input and output types equal so `zodResolver` stays happy under newer
 * `@hookform/resolvers`. The form passes `phone: user.phone ?? ""` so the
 * field is always defined.
 */
const clientPhoneRegex = /^[+\d][\d\s-]{5,19}$/;

const phoneField = z
  .string()
  .trim()
  .refine((v) => v === "" || clientPhoneRegex.test(v), {
    message: "Enter a valid Kosovo phone number",
  });

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email"),
  phone: phoneField,
});

export type ProfileInput = z.infer<typeof profileSchema>;
