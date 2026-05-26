import { z } from "zod";

const postalCodeRegex = /^\d{5}$/;

/**
 * `type` and `isDefault` are required at the schema level (no `.default()`).
 * Reason: `.default()` makes a field optional on the *input* type and
 * required on the *output* type, which makes `useForm<AddressInput>`'s
 * resolver type incompatible with newer `@hookform/resolvers` (the input
 * and output sides of the schema must match). The form supplies explicit
 * `defaultValues` for both fields, so this never breaks the UX.
 */
export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(80, "Full name is too long"),
  street: z
    .string()
    .trim()
    .min(3, "Street is required")
    .max(120, "Street is too long"),
  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(60, "City is too long"),
  postalCode: z
    .string()
    .trim()
    .regex(postalCodeRegex, "Postal code must be 5 digits"),
  type: z.enum(["Home", "Work", "Other"]),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;
