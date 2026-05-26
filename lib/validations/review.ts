import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number({ error: "Select a rating" })
    .int()
    .min(1, "Select a rating")
    .max(5),
  comment: z
    .string()
    .trim()
    .min(3, "Tell us a little more (min 3 characters)")
    .max(1000, "Keep it under 1000 characters"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
