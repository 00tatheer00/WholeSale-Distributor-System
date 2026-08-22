import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(80, "Category name must not exceed 80 characters")
    .trim(),
  code: z
    .string()
    .max(30, "Code must not exceed 30 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(255, "Description must not exceed 255 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
