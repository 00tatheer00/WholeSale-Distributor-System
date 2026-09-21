import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(2, "Warehouse name must be at least 2 characters").max(100),
  code: z.string().min(2, "Warehouse code is required").max(50),
  location: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type WarehouseInput = z.infer<typeof warehouseSchema>;
