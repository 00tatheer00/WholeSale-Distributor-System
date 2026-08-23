import { z } from "zod";

export const distributorSchema = z.object({
  name: z.string().min(2, "Sales representative name is required").max(100),
  phone: z.string().min(6, "Valid phone number required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  assignedTerritory: z.string().min(2, "Territory name is required"),
  assignedRoute: z.string().optional().nullable(),
  monthlySalesTarget: z.coerce.number().min(0).default(500000),
  commissionRatePercent: z.coerce.number().min(0).max(50).default(2.5),
  joiningDate: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  notes: z.string().optional().nullable(),
});

export const distributorExpenseSchema = z.object({
  distributorId: z.string().min(1, "Distributor selection is required"),
  categoryId: z.string().min(1, "Expense category is required"),
  amount: z.coerce.number().min(1, "Expense amount must be greater than 0"),
  expenseDate: z.string().default(() => new Date().toISOString().split("T")[0]),
  description: z.string().min(3, "Description / purpose of expense is required"),
  receiptUrl: z.string().optional().nullable(),
});

export type DistributorInput = z.infer<typeof distributorSchema>;
export type DistributorExpenseInput = z.infer<typeof distributorExpenseSchema>;
