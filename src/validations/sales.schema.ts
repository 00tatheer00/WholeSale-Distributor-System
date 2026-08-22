import { z } from "zod";

export const saleItemSchema = z.object({
  medicineId: z.string().min(1, "Medicine selection is required"),
  batchId: z.string().min(1, "Batch allocation is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  bonusQuantity: z.coerce.number().int().min(0).default(0),
  unitTradePrice: z.coerce.number().min(0.01, "Trade price must be greater than 0"),
  unitCostPrice: z.coerce.number().min(0.01, "Cost snapshot is required"),
  unitMrp: z.coerce.number().min(0.01).optional(),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  vatPercent: z.coerce.number().min(0).max(100).default(0),
});

export const saleOrderSchema = z.object({
  customerId: z.string().min(1, "Customer pharmacy is required"),
  distributorId: z.string().optional().nullable(),
  orderDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  deliveryAddress: z.string().optional().nullable(),
  specialDiscountPercent: z.coerce.number().min(0).max(100).default(0),
  deliveryCharge: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1, "At least one item is required in the sales order"),
  isDirectInvoice: z.boolean().default(true),
});

export type SaleOrderInput = z.infer<typeof saleOrderSchema>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;
