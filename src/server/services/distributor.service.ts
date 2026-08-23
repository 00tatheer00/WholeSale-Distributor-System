import { prisma } from "@/lib/prisma";
import { DistributorStatus, ExpenseStatus } from "@prisma/client";
import { DistributorInput, DistributorExpenseInput } from "@/validations/distributor.schema";
import { DistributorRecord, DistributorDetailRecord, DistributorExpenseRecord } from "@/types/models";

export interface DistributorQueryParams {
  search?: string;
  statusFilter?: "ALL" | "ACTIVE" | "INACTIVE";
  territory?: string;
  page?: number;
  pageSize?: number;
}

export interface DistributorQueryResult {
  distributors: DistributorRecord[];
  totalCount: number;
  totalTeamSales: number;
  totalTeamCollections: number;
  totalTeamExpenses: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch Distributors with server-side search, filtering, and real-time sales/expense performance calculations
 */
export async function getDistributors(
  params: DistributorQueryParams = {}
): Promise<DistributorQueryResult> {
  const {
    search = "",
    statusFilter = "ALL",
    territory,
    page = 1,
    pageSize = 20,
  } = params;

  try {
    const whereClause: any = {};

    if (search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim(), mode: "insensitive" } },
        { employeeCode: { contains: search.trim(), mode: "insensitive" } },
        { assignedTerritory: { contains: search.trim(), mode: "insensitive" } },
        { assignedRoute: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (statusFilter !== "ALL") {
      whereClause.status = statusFilter as DistributorStatus;
    }

    if (territory && territory !== "ALL") {
      whereClause.assignedTerritory = territory;
    }

    const skip = (Math.max(1, page) - 1) * pageSize;

    const [totalCount, distributorsData] = await Promise.all([
      prisma.distributor.count({ where: whereClause }),
      prisma.distributor.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
        include: {
          sales: {
            where: { status: "CONFIRMED" },
            select: {
              grandTotal: true,
              paidAmount: true,
              dueAmount: true,
              totalCogs: true,
            },
          },
          customerPayments: {
            where: { status: "CONFIRMED" },
            select: {
              amount: true,
            },
          },
          distributorExpenses: {
            where: { status: { in: ["APPROVED", "PENDING"] } },
            select: {
              amount: true,
            },
          },
          _count: {
            select: {
              sales: true,
              customerPayments: true,
              distributorExpenses: true,
            },
          },
        },
      }),
    ]);

    let totalTeamSales = 0;
    let totalTeamCollections = 0;
    let totalTeamExpenses = 0;

    const distributors: DistributorRecord[] = distributorsData.map((d) => {
      // 1. Sales metrics
      const totalSales = d.sales.reduce((sum, s) => sum + Number(s.grandTotal), 0);
      const totalCogs = d.sales.reduce((sum, s) => sum + Number(s.totalCogs), 0);
      const totalDue = d.sales.reduce((sum, s) => sum + Number(s.dueAmount), 0);
      const grossProfitContribution = totalSales - totalCogs;

      // 2. Collections (Customer payments logged by this representative)
      const totalCollected = d.customerPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // 3. Expenses
      const totalExpenses = d.distributorExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      // 4. Net Contribution = Gross Profit - Direct Distributor Expenses
      const netContribution = grossProfitContribution - totalExpenses;

      totalTeamSales += totalSales;
      totalTeamCollections += totalCollected;
      totalTeamExpenses += totalExpenses;

      return {
        id: d.id,
        name: d.name,
        employeeCode: d.employeeCode || `EMP-${d.id.slice(0, 6).toUpperCase()}`,
        phone: d.phone,
        email: d.email || "",
        address: d.address || "",
        assignedTerritory: d.assignedTerritory || "General Route",
        assignedRoute: d.assignedRoute || "",
        monthlySalesTarget: Number(d.monthlySalesTarget),
        commissionRatePercent: Number(d.commissionRatePercent),
        joiningDate: d.joiningDate ? d.joiningDate.toISOString().split("T")[0] : null,
        status: d.status,
        notes: d.notes,
        totalSales,
        totalCollected,
        totalDue,
        totalExpenses,
        grossProfitContribution,
        netContribution,
        salesCount: d._count.sales,
        collectionsCount: d._count.customerPayments,
        expensesCount: d._count.distributorExpenses,
      };
    });

    return {
      distributors,
      totalCount,
      totalTeamSales,
      totalTeamCollections,
      totalTeamExpenses,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  } catch (error) {
    console.error("Error in getDistributors service:", error);
    return {
      distributors: [],
      totalCount: 0,
      totalTeamSales: 0,
      totalTeamCollections: 0,
      totalTeamExpenses: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch Full 360° Profile of a Distributor with linked Sales, Collections, and Expenses
 */
export async function getDistributorById(id: string): Promise<DistributorDetailRecord | null> {
  try {
    const distributor = await prisma.distributor.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { saleDate: "desc" },
          take: 50,
          include: {
            customer: true,
            invoice: true,
          },
        },
        customerPayments: {
          orderBy: { paymentDate: "desc" },
          take: 50,
          include: {
            customer: true,
          },
        },
        distributorExpenses: {
          orderBy: { expenseDate: "desc" },
          take: 50,
          include: {
            category: true,
            approvedBy: true,
          },
        },
        _count: {
          select: {
            sales: true,
            customerPayments: true,
            distributorExpenses: true,
          },
        },
      },
    });

    if (!distributor) return null;

    // Financial Metrics
    const totalSales = distributor.sales
      .filter((s) => s.status === "CONFIRMED")
      .reduce((sum, s) => sum + Number(s.grandTotal), 0);
    const totalCogs = distributor.sales
      .filter((s) => s.status === "CONFIRMED")
      .reduce((sum, s) => sum + Number(s.totalCogs), 0);
    const totalDue = distributor.sales
      .filter((s) => s.status === "CONFIRMED")
      .reduce((sum, s) => sum + Number(s.dueAmount), 0);
    const grossProfitContribution = totalSales - totalCogs;

    const totalCollected = distributor.customerPayments
      .filter((p) => p.status === "CONFIRMED")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalExpenses = distributor.distributorExpenses
      .filter((e) => e.status !== "REJECTED")
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const netContribution = grossProfitContribution - totalExpenses;

    const formattedSales = distributor.sales.map((s) => ({
      id: s.id,
      saleNumber: s.saleNumber,
      invoiceNumber: s.invoice?.invoiceNumber || null,
      customerName: s.customer.pharmacyName,
      saleDate: s.saleDate.toISOString().split("T")[0],
      grandTotal: Number(s.grandTotal),
      paidAmount: Number(s.paidAmount),
      dueAmount: Number(s.dueAmount),
      cogsTotal: Number(s.totalCogs),
      grossProfit: Number(s.grandTotal) - Number(s.totalCogs),
      paymentStatus: s.paymentStatus,
    }));

    const formattedCollections = distributor.customerPayments.map((p) => ({
      id: p.id,
      receiptNumber: p.receiptNumber,
      customerName: p.customer.pharmacyName,
      amount: Number(p.amount),
      paymentDate: p.paymentDate.toISOString().split("T")[0],
      paymentMethod: p.paymentMethod,
      referenceNumber: p.referenceNumber,
    }));

    const formattedExpenses: DistributorExpenseRecord[] = distributor.distributorExpenses.map((e) => ({
      id: e.id,
      distributorId: e.distributorId,
      distributorName: distributor.name,
      categoryId: e.categoryId,
      categoryName: e.category.name,
      amount: Number(e.amount),
      expenseDate: e.expenseDate.toISOString().split("T")[0],
      description: e.description,
      receiptUrl: e.receiptUrl,
      status: e.status,
      approvedByName: e.approvedBy?.name || null,
      createdAt: e.createdAt.toISOString(),
    }));

    return {
      id: distributor.id,
      name: distributor.name,
      employeeCode: distributor.employeeCode || `EMP-${distributor.id.slice(0, 6).toUpperCase()}`,
      phone: distributor.phone,
      email: distributor.email || "",
      address: distributor.address || "",
      assignedTerritory: distributor.assignedTerritory || "General Route",
      assignedRoute: distributor.assignedRoute || "",
      monthlySalesTarget: Number(distributor.monthlySalesTarget),
      commissionRatePercent: Number(distributor.commissionRatePercent),
      joiningDate: distributor.joiningDate ? distributor.joiningDate.toISOString().split("T")[0] : null,
      status: distributor.status,
      notes: distributor.notes,
      totalSales,
      totalCollected,
      totalDue,
      totalExpenses,
      grossProfitContribution,
      netContribution,
      salesCount: distributor._count.sales,
      collectionsCount: distributor._count.customerPayments,
      expensesCount: distributor._count.distributorExpenses,
      sales: formattedSales,
      collections: formattedCollections,
      expenses: formattedExpenses,
    };
  } catch (error) {
    console.error("Error in getDistributorById service:", error);
    return null;
  }
}

/**
 * Onboard a New Sales Representative / Field Distributor
 */
export async function createDistributor(
  input: DistributorInput,
  userId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return { success: false, error: "Company profile not found." };
    }

    const year = new Date().getFullYear();
    const count = await prisma.distributor.count();
    const employeeCode = `EMP-${year}-${String(count + 1).padStart(4, "0")}`;

    const created = await prisma.$transaction(async (tx) => {
      const dist = await tx.distributor.create({
        data: {
          companyId: company.id,
          employeeCode,
          name: input.name.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim() || undefined,
          address: input.address?.trim() || undefined,
          assignedTerritory: input.assignedTerritory.trim(),
          assignedRoute: input.assignedRoute?.trim() || undefined,
          monthlySalesTarget: input.monthlySalesTarget,
          commissionRatePercent: input.commissionRatePercent,
          joiningDate: input.joiningDate ? new Date(input.joiningDate) : new Date(),
          status: input.status as DistributorStatus,
          notes: input.notes?.trim() || undefined,
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "CREATE",
            entityName: "Distributor",
            entityId: dist.id,
            newValues: {
              name: dist.name,
              employeeCode,
              territory: dist.assignedTerritory,
            },
          },
        });
      }

      return dist;
    });

    return { success: true, data: created };
  } catch (error: any) {
    console.error("Error creating distributor:", error);
    return { success: false, error: error.message || "Failed to create sales representative." };
  }
}

/**
 * Update Distributor Details
 */
export async function updateDistributor(
  id: string,
  input: DistributorInput,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.distributor.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Sales representative not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.distributor.update({
        where: { id },
        data: {
          name: input.name.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim() || undefined,
          address: input.address?.trim() || undefined,
          assignedTerritory: input.assignedTerritory.trim(),
          assignedRoute: input.assignedRoute?.trim() || undefined,
          monthlySalesTarget: input.monthlySalesTarget,
          commissionRatePercent: input.commissionRatePercent,
          joiningDate: input.joiningDate ? new Date(input.joiningDate) : existing.joiningDate,
          status: input.status as DistributorStatus,
          notes: input.notes?.trim() || undefined,
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "UPDATE",
            entityName: "Distributor",
            entityId: id,
            newValues: {
              name: input.name,
              territory: input.assignedTerritory,
              status: input.status,
            },
          },
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating distributor:", error);
    return { success: false, error: error.message || "Failed to update sales representative." };
  }
}

/**
 * Toggle Distributor Status (ACTIVE / INACTIVE) without hard deleting historical transactions
 */
export async function toggleDistributorStatus(
  id: string,
  newStatus: DistributorStatus,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      const dist = await tx.distributor.update({
        where: { id },
        data: { status: newStatus },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "UPDATE",
            entityName: "Distributor",
            entityId: id,
            newValues: {
              previousStatus: dist.status,
              newStatus,
            },
          },
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling distributor status:", error);
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}

/**
 * Record a Direct Distributor Operating Expense (Fuel, Food Allowance, Travel, Logistics)
 */
export async function recordDistributorExpense(
  input: DistributorExpenseInput,
  userId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const distributor = await prisma.distributor.findUnique({
      where: { id: input.distributorId },
    });

    if (!distributor) {
      return { success: false, error: "Sales representative not found." };
    }

    const created = await prisma.$transaction(async (tx) => {
      const exp = await tx.distributorExpense.create({
        data: {
          distributorId: input.distributorId,
          categoryId: input.categoryId,
          expenseDate: new Date(input.expenseDate),
          amount: input.amount,
          description: input.description.trim(),
          receiptUrl: input.receiptUrl?.trim() || undefined,
          status: ExpenseStatus.APPROVED,
          approvedById: userId || undefined,
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "CREATE",
            entityName: "DistributorExpense",
            entityId: exp.id,
            newValues: {
              distributorName: distributor.name,
              amount: input.amount,
              description: input.description,
            },
          },
        });
      }

      return exp;
    });

    return { success: true, data: created };
  } catch (error: any) {
    console.error("Error recording distributor expense:", error);
    return { success: false, error: error.message || "Failed to record representative expense." };
  }
}
