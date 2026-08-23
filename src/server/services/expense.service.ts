import { prisma } from "@/lib/prisma";
import { ExpenseStatus, PaymentMethod } from "@prisma/client";
import { ExpenseCategoryInput, ExpenseInput } from "@/validations/expense.schema";
import { ExpenseCategoryRecord, ExpenseRecord } from "@/types/models";

export interface ExpenseQueryParams {
  search?: string;
  categoryId?: string;
  paymentMethod?: "ALL" | "CASH" | "BANK_TRANSFER" | "CHEQUE" | "MFS_BKASH_NAGAD";
  statusFilter?: "ALL" | "APPROVED" | "PENDING" | "CANCELLED";
  startDate?: string;
  endDate?: string;
  sortBy?: "expenseDate" | "amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ExpenseQueryResult {
  expenses: ExpenseRecord[];
  totalCount: number;
  totalAmount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch Expense Categories with usage statistics
 */
export async function getExpenseCategories(): Promise<ExpenseCategoryRecord[]> {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            expenses: true,
            distributorExpenses: true,
          },
        },
        expenses: {
          where: { status: "APPROVED" },
          select: { amount: true },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      description: c.description,
      isDirectCost: c.isDirectCost,
      isActive: c.isActive,
      expensesCount: c._count.expenses + c._count.distributorExpenses,
      totalAmount: c.expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    }));
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    return [];
  }
}

/**
 * Create a New Expense Category
 */
export async function createExpenseCategory(
  input: ExpenseCategoryInput,
  userId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return { success: false, error: "Company profile not found." };
    }

    const existing = await prisma.expenseCategory.findFirst({
      where: {
        companyId: company.id,
        name: { equals: input.name.trim(), mode: "insensitive" },
      },
    });

    if (existing) {
      return { success: false, error: `Category "${input.name}" already exists.` };
    }

    const created = await prisma.expenseCategory.create({
      data: {
        companyId: company.id,
        name: input.name.trim(),
        code: input.code?.trim() || undefined,
        description: input.description?.trim() || undefined,
        isDirectCost: input.isDirectCost,
        isActive: input.isActive,
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "CREATE",
          entityName: "ExpenseCategory",
          entityId: created.id,
          newValues: { name: created.name },
        },
      });
    }

    return { success: true, data: created };
  } catch (error: any) {
    console.error("Error creating expense category:", error);
    return { success: false, error: error.message || "Failed to create category." };
  }
}

/**
 * Toggle Expense Category Status
 */
export async function toggleExpenseCategoryStatus(
  id: string,
  isActive: boolean,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.expenseCategory.update({
      where: { id },
      data: { isActive },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "UPDATE",
          entityName: "ExpenseCategory",
          entityId: id,
          newValues: { isActive },
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling category status:", error);
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}

/**
 * Fetch Operating Expenses with search, category filtering, and date range
 */
export async function getExpenses(params: ExpenseQueryParams = {}): Promise<ExpenseQueryResult> {
  const {
    search = "",
    categoryId,
    paymentMethod = "ALL",
    statusFilter = "ALL",
    startDate,
    endDate,
    sortBy = "expenseDate",
    sortOrder = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  try {
    const whereClause: any = {};

    if (search.trim()) {
      whereClause.OR = [
        { voucherNumber: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { paidTo: { contains: search.trim(), mode: "insensitive" } },
        { referenceNumber: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (categoryId && categoryId !== "ALL") {
      whereClause.categoryId = categoryId;
    }

    if (paymentMethod !== "ALL") {
      whereClause.paymentMethod = paymentMethod as PaymentMethod;
    }

    if (statusFilter !== "ALL") {
      whereClause.status = statusFilter as ExpenseStatus;
    }

    if (startDate || endDate) {
      whereClause.expenseDate = {};
      if (startDate) {
        whereClause.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.expenseDate.lte = end;
      }
    }

    let orderBy: any = { expenseDate: sortOrder };
    if (sortBy === "amount") {
      orderBy = { amount: sortOrder };
    }

    const skip = (Math.max(1, page) - 1) * pageSize;

    const [totalCount, expensesData, statsData] = await Promise.all([
      prisma.businessExpense.count({ where: whereClause }),
      prisma.businessExpense.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: pageSize,
        include: {
          category: true,
          createdBy: true,
          approvedBy: true,
        },
      }),
      prisma.businessExpense.aggregate({
        where: { ...whereClause, status: "APPROVED" },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const expenses: ExpenseRecord[] = expensesData.map((e) => ({
      id: e.id,
      voucherNumber: e.voucherNumber,
      categoryId: e.categoryId,
      categoryName: e.category.name,
      amount: Number(e.amount),
      expenseDate: e.expenseDate.toISOString().split("T")[0],
      paymentMethod: e.paymentMethod,
      paidTo: e.paidTo,
      description: e.description,
      referenceNumber: e.referenceNumber,
      status: e.status,
      approvedByName: e.approvedBy?.name || null,
      notes: e.notes,
      createdByName: e.createdBy.name,
      createdAt: e.createdAt.toISOString(),
    }));

    return {
      expenses,
      totalCount,
      totalAmount: Number(statsData._sum.amount || 0),
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  } catch (error) {
    console.error("Error in getExpenses service:", error);
    return {
      expenses: [],
      totalCount: 0,
      totalAmount: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
  }
}

/**
 * Record a New Business Operating Expense Voucher
 */
export async function createExpense(
  input: ExpenseInput,
  userId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return { success: false, error: "Company profile not found." };
    }

    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : await prisma.user.findFirst();
    if (!user) {
      return { success: false, error: "Authenticated user not found." };
    }

    const year = new Date().getFullYear();
    const count = await prisma.businessExpense.count();
    const voucherNumber = `EXP-${year}-${String(count + 1).padStart(5, "0")}`;

    const created = await prisma.$transaction(async (tx) => {
      const exp = await tx.businessExpense.create({
        data: {
          companyId: company.id,
          categoryId: input.categoryId,
          voucherNumber,
          createdById: user.id,
          approvedById: user.id,
          expenseDate: new Date(input.expenseDate),
          amount: input.amount,
          paymentMethod: input.paymentMethod as PaymentMethod,
          paidTo: input.paidTo.trim(),
          description: input.description.trim(),
          referenceNumber: input.referenceNumber?.trim() || undefined,
          status: ExpenseStatus.APPROVED,
          notes: input.notes?.trim() || undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CREATE",
          entityName: "BusinessExpense",
          entityId: exp.id,
          newValues: {
            voucherNumber,
            amount: input.amount,
            paidTo: input.paidTo,
            description: input.description,
          },
        },
      });

      return exp;
    });

    return { success: true, data: created };
  } catch (error: any) {
    console.error("Error creating expense:", error);
    return { success: false, error: error.message || "Failed to record expense voucher." };
  }
}

/**
 * Cancel an Expense Voucher
 */
export async function cancelExpense(
  id: string,
  reason: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.businessExpense.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Expense voucher not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.businessExpense.update({
        where: { id },
        data: {
          status: ExpenseStatus.REJECTED,
          notes: existing.notes ? `${existing.notes} | Cancelled: ${reason}` : `Cancelled: ${reason}`,
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "CANCEL",
            entityName: "BusinessExpense",
            entityId: id,
            newValues: { voucherNumber: existing.voucherNumber, reason },
          },
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling expense:", error);
    return { success: false, error: error.message || "Failed to cancel expense." };
  }
}
