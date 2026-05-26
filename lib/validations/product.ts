import { z } from "zod";

export const productSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  titleEn: z.string().trim().max(160).optional(),
  description: z.string().trim().min(10, "Description is too short").max(4000),
  descriptionEn: z.string().trim().max(4000).optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  discountPercentage: z.coerce
    .number()
    .min(0, "Min 0")
    .max(90, "Max 90%"),
  stockQuantity: z.coerce
    .number()
    .int("Must be a whole number")
    .min(0, "Min 0"),
  thumbnail: z.string().trim().url("Must be a valid image URL"),
  images: z.string().trim().optional(),
  categoryId: z.string().min(1, "Select a category"),
  brandId: z.string().min(1, "Select a brand"),
  isFeatured: z.coerce.boolean().optional().default(false),
});

export type ProductFormValues = z.input<typeof productSchema>;

export function parseImages(images: string | undefined): string[] {
  if (!images) return [];
  return images
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
