import { z } from "zod";

export const expenseCategorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(100),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isDirectCost: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const expenseSchema = z.object({
  categoryId: z.string().min(1, "Expense category is required"),
  amount: z.coerce.number().min(1, "Expense amount must be greater than 0"),
  expenseDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  paidTo: z.string().min(2, "Payee or vendor name is required"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "MFS_BKASH_NAGAD"]).default("CASH"),
  description: z.string().min(3, "Description / purpose of expense is required"),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const cancelExpenseSchema = z.object({
  expenseId: z.string().min(1, "Expense ID is required"),
  reason: z.string().min(3, "Cancellation reason is required"),
});

export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type CancelExpenseInput = z.infer<typeof cancelExpenseSchema>;
