import { z } from "zod";

export const stockAdjustmentFormSchema = z.object({
  medicineId: z.string().min(1, "Please select a medicine"),
  batchId: z.string().min(1, "Please select a valid batch"),
  adjustmentType: z.enum([
    "DAMAGE_WRITE_OFF",
    "EXPIRY_REMOVAL",
    "COUNT_DISCREPANCY_ADD",
    "COUNT_DISCREPANCY_DEDUCT",
    "RETURN_TO_SUPPLIER",
    "SAMPLE_GIVEN",
  ]),
  quantityDelta: z.coerce
    .number()
    .int("Quantity must be a whole integer")
    .refine((val) => val !== 0, "Adjustment quantity cannot be 0"),
  reason: z
    .string()
    .min(3, "Reason must be at least 3 characters")
    .max(255, "Reason must not exceed 255 characters")
    .trim(),
  notes: z
    .string()
    .max(500, "Notes must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentFormSchema>;
