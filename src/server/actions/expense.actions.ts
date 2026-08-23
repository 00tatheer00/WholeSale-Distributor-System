"use server";

import { revalidatePath } from "next/cache";
import {
  expenseCategorySchema,
  expenseSchema,
  cancelExpenseSchema,
  ExpenseCategoryInput,
  ExpenseInput,
  CancelExpenseInput,
} from "@/validations/expense.schema";
import {
  getExpenseCategories,
  createExpenseCategory,
  toggleExpenseCategoryStatus,
  getExpenses,
  createExpense,
  cancelExpense,
  ExpenseQueryParams,
  ExpenseQueryResult,
} from "@/server/services/expense.service";
import { ExpenseCategoryRecord, ExpenseRecord } from "@/types/models";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getExpenseCategoriesAction(): Promise<ActionResult<ExpenseCategoryRecord[]>> {
  try {
    const categories = await getExpenseCategories();
    return { success: true, data: categories };
  } catch (error: any) {
    console.error("getExpenseCategoriesAction error:", error);
    return { success: false, error: "Failed to fetch expense categories." };
  }
}

export async function createExpenseCategoryAction(
  data: ExpenseCategoryInput
): Promise<ActionResult> {
  try {
    const parsed = expenseCategorySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid category data" };
    }

    const result = await createExpenseCategory(parsed.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/expenses");
    return { success: true, message: `Expense category "${parsed.data.name}" created.` };
  } catch (error: any) {
    console.error("createExpenseCategoryAction error:", error);
    return { success: false, error: "Failed to create category." };
  }
}

export async function toggleExpenseCategoryStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const result = await toggleExpenseCategoryStatus(id, isActive);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/expenses");
    return { success: true, message: `Category status updated.` };
  } catch (error: any) {
    console.error("toggleExpenseCategoryStatusAction error:", error);
    return { success: false, error: "Failed to update category status." };
  }
}

export async function getExpensesAction(
  params?: ExpenseQueryParams
): Promise<ActionResult<ExpenseQueryResult>> {
  try {
    const result = await getExpenses(params);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("getExpensesAction error:", error);
    return { success: false, error: "Failed to fetch expense vouchers." };
  }
}

export async function createExpenseAction(
  data: ExpenseInput
): Promise<ActionResult<{ voucherNumber: string }>> {
  try {
    const parsed = expenseSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid expense data" };
    }

    const result = await createExpense(parsed.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/expenses");
    revalidatePath("/profit");
    revalidatePath("/dashboard");
    return {
      success: true,
      data: { voucherNumber: result.data?.voucherNumber },
      message: `Expense voucher ${result.data?.voucherNumber} for ৳${parsed.data.amount} recorded.`,
    };
  } catch (error: any) {
    console.error("createExpenseAction error:", error);
    return { success: false, error: "Failed to record expense voucher." };
  }
}

export async function cancelExpenseAction(
  data: CancelExpenseInput
): Promise<ActionResult> {
  try {
    const parsed = cancelExpenseSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid cancellation data" };
    }

    const result = await cancelExpense(parsed.data.expenseId, parsed.data.reason);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/expenses");
    revalidatePath("/profit");
    revalidatePath("/dashboard");
    return { success: true, message: "Expense voucher cancelled." };
  } catch (error: any) {
    console.error("cancelExpenseAction error:", error);
    return { success: false, error: "Failed to cancel expense." };
  }
}
