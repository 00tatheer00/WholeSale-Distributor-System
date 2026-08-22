import { z } from "zod";

export const stockAdjustmentTypeEnum = z.enum([
  "DAMAGE_WRITE_OFF",
  "EXPIRY_REMOVAL",
  "COUNT_DISCREPANCY_ADD",
  "COUNT_DISCREPANCY_DEDUCT",
  "RETURN_TO_SUPPLIER",
  "SAMPLE_GIVEN",
]);

export const stockAdjustmentSchema = z.object({
  batchId: z.string().min(1, "Batch selection is required"),
  adjustmentType: stockAdjustmentTypeEnum,
  quantityChange: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().min(3, "Audit reason is required (minimum 3 characters)"),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

export const warehouseSchema = z.object({
  name: z.string().min(2, "Warehouse name is required"),
  code: z.string().min(1, "Warehouse code is required"),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  isCentralHub: z.boolean().default(false),
  hasColdRoom: z.boolean().default(false),
  hasNarcoticsSafe: z.boolean().default(false),
});

export type WarehouseInput = z.infer<typeof warehouseSchema>;
