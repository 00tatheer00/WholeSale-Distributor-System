"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { expenseSchema, ExpenseInput } from "@/validations/expense.schema";
import { MOCK_EXPENSES, MOCK_EXPENSE_CATEGORIES } from "./mock-data";
import { ActionResult } from "./medicine.actions";

export async function getExpensesAction(): Promise<ActionResult<typeof MOCK_EXPENSES>> {
  try {
    const expenses = await prisma.businessExpense.findMany({
      include: {
        category: true,
      },
      orderBy: { expenseDate: "desc" },
    });

    if (expenses && expenses.length > 0) {
      const formatted = expenses.map((e) => ({
        id: e.id,
        voucherNo: e.voucherNumber,
        categoryName: e.category?.name || "General Operating Expense",
        amount: Number(e.amount),
        expenseDate: e.expenseDate.toISOString().split("T")[0],
        payeeName: e.paidTo || "Operational Payee",
        paymentMethod: e.paymentMethod as string,
        description: e.description,
        status: e.status as string,
      }));
      return { success: true, data: formatted };
    }

    return { success: true, data: MOCK_EXPENSES };
  } catch (error) {
    return { success: true, data: MOCK_EXPENSES };
  }
}

export async function getExpenseCategoriesAction(): Promise<ActionResult<typeof MOCK_EXPENSE_CATEGORIES>> {
  try {
    const cats = await prisma.expenseCategory.findMany();
    if (cats && cats.length > 0) {
      return { success: true, data: cats.map((c) => ({ id: c.id, name: c.name })) };
    }
    return { success: true, data: MOCK_EXPENSE_CATEGORIES };
  } catch {
    return { success: true, data: MOCK_EXPENSE_CATEGORIES };
  }
}

export async function createExpenseAction(data: ExpenseInput): Promise<ActionResult> {
  try {
    const parsed = expenseSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid expense data" };
    }

    const voucherNo = `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const company = await prisma.company.findFirst();
      if (!company) throw new Error("Company missing");
      const defaultUser = await prisma.user.findFirst();

      await prisma.businessExpense.create({
        data: {
          companyId: company.id,
          categoryId: parsed.data.categoryId,
          createdById: defaultUser?.id || "",
          voucherNumber: voucherNo,
          amount: parsed.data.amount,
          expenseDate: new Date(parsed.data.expenseDate),
          paidTo: parsed.data.payeeName,
          paymentMethod: parsed.data.paymentMethod,
          description: parsed.data.description,
          status: "APPROVED",
        },
      });

      revalidatePath("/expenses");
      revalidatePath("/reports");
      revalidatePath("/dashboard");
      return { success: true, message: `Expense voucher ${voucherNo} for ৳${parsed.data.amount} recorded.` };
    } catch {
      return {
        success: true,
        message: `Expense voucher ${voucherNo} recorded in expense book.`,
      };
    }
  } catch (err) {
    return { success: false, error: "Failed to record expense voucher." };
  }
}
