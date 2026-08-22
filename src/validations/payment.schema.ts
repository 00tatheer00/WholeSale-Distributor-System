import { z } from "zod";

export const paymentMethodEnum = z.enum([
  "CASH",
  "BANK_TRANSFER",
  "CHEQUE",
  "MFS_BKASH_NAGAD",
]);

export const customerPaymentSchema = z.object({
  customerId: z.string().min(1, "Customer pharmacy is required"),
  amount: z.coerce.number().min(1, "Payment amount must be greater than 0"),
  paymentMethod: paymentMethodEnum.default("CASH"),
  paymentDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  referenceNo: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  chequeNumber: z.string().optional().nullable(),
  chequeMaturityDate: z.string().optional().nullable(),
  distributorId: z.string().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerPaymentInput = z.infer<typeof customerPaymentSchema>;

export const supplierPaymentSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  amount: z.coerce.number().min(1, "Payment amount must be greater than 0"),
  paymentMethod: paymentMethodEnum.default("BANK_TRANSFER"),
  paymentDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  referenceNo: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  chequeNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type SupplierPaymentInput = z.infer<typeof supplierPaymentSchema>;
