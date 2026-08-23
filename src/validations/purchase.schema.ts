import { z } from "zod";
import { paymentMethodEnum } from "./payment.schema";

export const purchaseItemSchema = z.object({
  medicineId: z.string().min(1, "Medicine selection is required"),
  batchNumber: z.string().min(1, "Manufacturer batch number is mandatory"),
  expiryDate: z.string().min(1, "Expiry date is mandatory"),
  manufacturingDate: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  bonusQuantity: z.coerce.number().int().min(0).default(0),
  unitCostPrice: z.coerce.number().min(0.01, "Unit cost price must be greater than 0"),
  unitTradePrice: z.coerce.number().min(0.01, "Unit trade price must be greater than 0"),
  unitMrp: z.coerce.number().min(0.01, "Unit MRP must be greater than 0"),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
  warehouseId: z.string().optional().nullable(),
  rackId: z.string().optional().nullable(),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier selection is required"),
  supplierInvoiceNo: z.string().optional().nullable(),
  purchaseDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  expectedDeliveryDate: z.string().optional().nullable(),
  warehouseId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMethod: paymentMethodEnum.default("BANK_TRANSFER"),
  paymentReference: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, "At least one item must be added to the purchase order"),
});

export const purchaseCancellationSchema = z.object({
  purchaseId: z.string().min(1, "Purchase ID is required"),
  reason: z.string().min(3, "Cancellation reason is mandatory and must be descriptive"),
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;
export type PurchaseCancellationInput = z.infer<typeof purchaseCancellationSchema>;
