import { z } from "zod";

export const expenseSchema = z.object({
  categoryId: z.string().min(1, "Expense category is required"),
  amount: z.coerce.number().min(1, "Expense amount must be greater than 0"),
  expenseDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  payeeName: z.string().min(2, "Payee or vendor name is required"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "MFS_BKASH_NAGAD"]).default("CASH"),
  description: z.string().min(3, "Description / purpose of expense is required"),
  voucherNo: z.string().optional().nullable(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
