import { z } from "zod";

export const stockTransferSchema = z.object({
  sourceWarehouseId: z.string().min(1, "Source warehouse is required"),
  destWarehouseId: z.string().min(1, "Destination warehouse is required"),
  medicineId: z.string().min(1, "Medicine is required"),
  batchId: z.string().min(1, "Batch is required"),
  quantity: z.number().int().positive("Transfer quantity must be a positive number"),
  destinationLocation: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
}).refine((data) => data.sourceWarehouseId !== data.destWarehouseId, {
  message: "Source and destination warehouses cannot be the same",
  path: ["destWarehouseId"],
});

export type StockTransferInput = z.infer<typeof stockTransferSchema>;
