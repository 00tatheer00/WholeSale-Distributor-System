import { z } from "zod";

export const batchFormSchema = z
  .object({
    medicineId: z.string().min(1, "Please select a medicine"),
    batchNumber: z
      .string()
      .min(2, "Batch number must be at least 2 characters")
      .max(50, "Batch number must not exceed 50 characters")
      .trim(),
    supplierId: z.string().optional().nullable(),
    warehouseId: z.string().min(1, "Please select a warehouse"),
    rackId: z.string().optional().nullable(),
    mfgDate: z.string().optional().nullable(),
    expiryDate: z.string().min(1, "Expiry date is required"),
    purchaseCostPrice: z.coerce
      .number()
      .min(0.01, "Purchase cost must be greater than 0"),
    tradePrice: z.coerce
      .number()
      .min(0.01, "Trade price must be greater than 0"),
    mrp: z.coerce.number().min(0.01, "MRP must be greater than 0"),
    initialQuantity: z.coerce
      .number()
      .int()
      .min(0, "Quantity cannot be negative")
      .default(0),
    status: z
      .enum(["ACTIVE", "NEAR_EXPIRY", "EXPIRED", "QUARANTINED", "EXHAUSTED"])
      .default("ACTIVE"),
  })
  .refine(
    (data) => {
      if (data.mfgDate && data.expiryDate) {
        const mfg = new Date(data.mfgDate);
        const exp = new Date(data.expiryDate);
        return exp > mfg;
      }
      return true;
    },
    {
      message: "Expiry date must be strictly after the manufacturing date",
      path: ["expiryDate"],
    }
  );

export type BatchFormValues = z.infer<typeof batchFormSchema>;
