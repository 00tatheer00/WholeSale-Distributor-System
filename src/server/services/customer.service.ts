import { prisma } from "@/lib/prisma";
import { CustomerStatus, CustomerType } from "@prisma/client";
import {
  CustomerRecord,
  CustomerDetailRecord,
  CustomerLedgerEntry,
  CustomerFinancialSummary,
  CustomerSaleHistoryItem,
  CustomerPaymentHistoryItem,
} from "@/types/models";
import { CustomerInput, UpdateCustomerInput } from "@/validations/customer.schema";
import { MOCK_CUSTOMERS } from "../actions/mock-data";

export interface CustomerQueryParams {
  search?: string;
  statusFilter?: "ALL" | "ACTIVE" | "INACTIVE" | "BLOCKED_OVERDUE";
  typeFilter?: "ALL" | "RETAIL_PHARMACY" | "HOSPITAL_DISPENSARY" | "CLINIC_INSTITUTION" | "SUB_DISTRIBUTOR";
  dueFilter?: "ALL" | "HAS_DUE" | "NO_DUE" | "CREDIT_EXCEEDED";
  sortBy?: "name" | "currentDue" | "creditLimit" | "createdAt" | "totalSales";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface CustomerQueryResult {
  customers: CustomerRecord[];
  totalCount: number;
  totalReceivableDue: number;
  totalCreditLimit: number;
  activeCount: number;
  overdueBlockedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Calculates credit health status based on credit limit and current outstanding due
 */
export function calculateCreditStatus(
  currentDue: number,
  creditLimit: number
): { status: "NORMAL" | "WARNING" | "EXCEEDED"; utilizationPercent: number; availableCredit: number } {
  const availableCredit = Math.max(0, creditLimit - currentDue);
  const utilizationPercent = creditLimit > 0 ? Math.min(100, Math.round((currentDue / creditLimit) * 100)) : 0;

  let status: "NORMAL" | "WARNING" | "EXCEEDED" = "NORMAL";
  if (creditLimit > 0) {
    if (currentDue > creditLimit) {
      status = "EXCEEDED";
    } else if (currentDue >= creditLimit * 0.85) {
      status = "WARNING";
    }
  }

  return { status, utilizationPercent, availableCredit };
}

/**
 * Fetch all customers with server-side search, filtering, sorting, pagination, and calculated metrics
 */
export async function getCustomers(params: CustomerQueryParams = {}): Promise<CustomerQueryResult> {
  const {
    search = "",
    statusFilter = "ALL",
    typeFilter = "ALL",
    dueFilter = "ALL",
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    pageSize = 20,
  } = params;

  try {
    const whereClause: any = {};

    if (search.trim()) {
      whereClause.OR = [
        { pharmacyName: { contains: search.trim(), mode: "insensitive" } },
        { proprietorName: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { customerCode: { contains: search.trim(), mode: "insensitive" } },
        { drugLicenseNo: { contains: search.trim(), mode: "insensitive" } },
        { city: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (statusFilter !== "ALL") {
      whereClause.status = statusFilter as CustomerStatus;
    }

    if (typeFilter !== "ALL") {
      whereClause.customerType = typeFilter as CustomerType;
    }

    if (dueFilter === "HAS_DUE") {
      whereClause.currentDue = { gt: 0 };
    } else if (dueFilter === "NO_DUE") {
      whereClause.currentDue = { lte: 0 };
    }

    // Build orderBy
    let orderBy: any = { pharmacyName: sortOrder };
    if (sortBy === "currentDue") {
      orderBy = { currentDue: sortOrder };
    } else if (sortBy === "creditLimit") {
      orderBy = { creditLimit: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    } else if (sortBy === "totalSales") {
      orderBy = { totalPurchased: sortOrder };
    }

    const skip = (Math.max(1, page) - 1) * pageSize;

    const [totalCount, customersData, statsData] = await Promise.all([
      prisma.customer.count({ where: whereClause }),
      prisma.customer.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: pageSize,
        include: {
          sales: {
            select: {
              id: true,
              grandTotal: true,
            },
          },
          invoices: {
            select: {
              id: true,
              dueAmount: true,
            },
          },
          customerPayments: {
            select: {
              id: true,
              amount: true,
            },
          },
        },
      }),
      prisma.customer.aggregate({
        _sum: {
          currentDue: true,
          creditLimit: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const activeCount = await prisma.customer.count({
      where: { status: CustomerStatus.ACTIVE },
    });

    const overdueBlockedCount = await prisma.customer.count({
      where: { status: CustomerStatus.BLOCKED_OVERDUE },
    });

    const customers: CustomerRecord[] = customersData.map((c) => {
      const currentDue = Number(c.currentDue);
      const creditLimit = Number(c.creditLimit);
      const openingBalance = Number(c.openingBalance);
      const totalPurchased = Number(c.totalPurchased);
      const totalPaid = Number(c.totalPaid);

      const { status: creditStatus, utilizationPercent, availableCredit } = calculateCreditStatus(
        currentDue,
        creditLimit
      );

      return {
        id: c.id,
        customerCode: c.customerCode || "",
        tradeName: c.pharmacyName,
        proprietorName: c.proprietorName || "",
        customerType: c.customerType,
        drugLicenseNo: c.drugLicenseNo,
        drugLicenseExpiry: c.drugLicenseExpiry ? c.drugLicenseExpiry.toISOString().split("T")[0] : "",
        tradeLicenseNo: c.customerCode || "",
        taxIdTin: c.taxTin || "",
        phone: c.phone,
        alternatePhone: c.alternatePhone || "",
        email: c.email || "",
        deliveryAddress: c.address,
        city: c.city || "",
        assignedRoute: c.territory || "General Route",
        creditLimit,
        maxDueDays: c.creditDaysLimit,
        openingBalance,
        currentDue,
        totalPurchased,
        totalPaid,
        availableCredit,
        creditUtilizationPercent: utilizationPercent,
        creditStatus,
        oldestOverdueDays: 0,
        defaultDiscountPercent: 0,
        status: c.status,
        totalSales: totalPurchased,
        salesCount: c.sales.length,
        invoicesCount: c.invoices.length,
        paymentsCount: c.customerPayments.length,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    return {
      customers,
      totalCount,
      totalReceivableDue: Number(statsData._sum.currentDue || 0),
      totalCreditLimit: Number(statsData._sum.creditLimit || 0),
      activeCount,
      overdueBlockedCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  } catch (error) {
    console.error("Error fetching customers from database:", error);
    // Fallback to mock data if database is temporarily offline
    const mockList: CustomerRecord[] = MOCK_CUSTOMERS.map((c) => {
      const currentDue = Number(c.currentDue);
      const creditLimit = Number(c.creditLimit);
      const { status: creditStatus, utilizationPercent, availableCredit } = calculateCreditStatus(
        currentDue,
        creditLimit
      );
      return {
        ...c,
        customerCode: c.tradeLicenseNo || "CUST-001",
        openingBalance: 0,
        totalPurchased: c.totalSales,
        totalPaid: Math.max(0, c.totalSales - currentDue),
        availableCredit,
        creditUtilizationPercent: utilizationPercent,
        creditStatus,
      };
    });

    return {
      customers: mockList,
      totalCount: mockList.length,
      totalReceivableDue: mockList.reduce((acc, c) => acc + c.currentDue, 0),
      totalCreditLimit: mockList.reduce((acc, c) => acc + c.creditLimit, 0),
      activeCount: mockList.filter((c) => c.status === "ACTIVE").length,
      overdueBlockedCount: mockList.filter((c) => c.status === "BLOCKED_OVERDUE").length,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch detailed Customer profile, 360-degree Financial Summary, Recent Sales, Recent Payments, and Ledger
 */
export async function getCustomerById(id: string): Promise<CustomerDetailRecord | null> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        distributor: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        sales: {
          orderBy: { saleDate: "desc" },
          include: {
            saleItems: true,
            invoice: true,
            distributor: true,
          },
        },
        invoices: {
          orderBy: { invoiceDate: "desc" },
        },
        customerPayments: {
          orderBy: { paymentDate: "desc" },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
            paymentAllocations: {
              include: {
                invoice: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return null;
    }

    const currentDue = Number(customer.currentDue);
    const creditLimit = Number(customer.creditLimit);
    const openingBalance = Number(customer.openingBalance);
    const totalPurchased = Number(customer.totalPurchased);
    const totalPaid = Number(customer.totalPaid);

    const { status: creditStatus, utilizationPercent, availableCredit } = calculateCreditStatus(
      currentDue,
      creditLimit
    );

    // 1. Format Sales History
    const recentSales: CustomerSaleHistoryItem[] = customer.sales.map((s) => ({
      id: s.id,
      orderNumber: s.saleNumber,
      invoiceNumber: s.invoice?.invoiceNumber || null,
      orderDate: s.saleDate.toISOString(),
      deliveryDate: s.deliveryDate ? s.deliveryDate.toISOString() : null,
      itemsCount: s.saleItems.length,
      subtotalAmount: Number(s.subtotalAmount),
      discountAmount: Number(s.discountAmount),
      taxAmount: Number(s.taxAmount),
      deliveryCharge: Number(s.deliveryCharge),
      grandTotal: Number(s.grandTotal),
      paidAmount: Number(s.paidAmount),
      dueAmount: Number(s.dueAmount),
      paymentStatus: s.paymentStatus,
      deliveryStatus: s.deliveryStatus,
      status: s.status,
      salesmanName: s.distributor?.name || null,
    }));

    // 2. Format Payments History
    const recentPayments: CustomerPaymentHistoryItem[] = customer.customerPayments.map((p) => ({
      id: p.id,
      receiptNumber: p.receiptNumber,
      amount: Number(p.amount),
      paymentDate: p.paymentDate.toISOString(),
      paymentMethod: p.paymentMethod,
      referenceNumber: p.referenceNumber || null,
      bankName: p.bankName || null,
      chequeNumber: p.chequeNumber || null,
      chequeDate: p.chequeDate ? p.chequeDate.toISOString() : null,
      chequeStatus: p.chequeStatus,
      notes: p.notes || null,
      recordedByName: p.createdBy?.name || "System Admin",
      allocatedInvoices: p.paymentAllocations.map((a) => a.invoice.invoiceNumber),
      status: p.status,
    }));

    // 3. Generate Chronological Ledger Statement
    const rawEvents: Array<{
      date: Date;
      type: "OPENING_BALANCE" | "WHOLESALE_SALE" | "PAYMENT";
      referenceNumber: string;
      description: string;
      debit: number;   // Invoice / Sale increases customer receivable
      credit: number;  // Payment reduces customer receivable
    }> = [];

    // Add opening balance if exists
    if (openingBalance > 0) {
      rawEvents.push({
        date: customer.createdAt,
        type: "OPENING_BALANCE",
        referenceNumber: "OB-INIT",
        description: "Initial Opening Balance on Customer Onboarding",
        debit: openingBalance,
        credit: 0,
      });
    }

    // Add Sales / Invoices (Debits)
    for (const sale of customer.sales) {
      rawEvents.push({
        date: sale.saleDate,
        type: "WHOLESALE_SALE",
        referenceNumber: sale.invoice?.invoiceNumber || sale.saleNumber,
        description: `Wholesale Medicine Order (${sale.saleItems.length} items) - ${sale.status}`,
        debit: Number(sale.grandTotal),
        credit: 0,
      });
    }

    // Add Payments (Credits)
    for (const p of customer.customerPayments) {
      rawEvents.push({
        date: p.paymentDate,
        type: "PAYMENT",
        referenceNumber: p.receiptNumber,
        description: `Payment Received via ${p.paymentMethod.replace(/_/g, " ")}${
          p.bankName ? ` (${p.bankName})` : ""
        }`,
        debit: 0,
        credit: Number(p.amount),
      });
    }

    // Sort chronologically ascending to compute exact running balance
    rawEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    let running = 0;
    const ledger: CustomerLedgerEntry[] = rawEvents.map((evt, idx) => {
      running = running + evt.debit - evt.credit;
      return {
        id: `cleg-${idx + 1}`,
        date: evt.date.toISOString(),
        type: evt.type,
        referenceNumber: evt.referenceNumber,
        description: evt.description,
        debit: evt.debit,
        credit: evt.credit,
        runningBalance: running,
      };
    });

    const financialSummary: CustomerFinancialSummary = {
      openingBalance,
      totalSales: totalPurchased,
      totalPaid,
      currentDue,
      creditLimit,
      availableCredit,
      creditUtilizationPercent: utilizationPercent,
      creditStatus,
      salesCount: customer.sales.length,
      invoicesCount: customer.invoices.length,
      paymentsCount: customer.customerPayments.length,
    };

    return {
      id: customer.id,
      customerCode: customer.customerCode || "",
      tradeName: customer.pharmacyName,
      proprietorName: customer.proprietorName || "",
      customerType: customer.customerType,
      drugLicenseNo: customer.drugLicenseNo,
      drugLicenseExpiry: customer.drugLicenseExpiry ? customer.drugLicenseExpiry.toISOString().split("T")[0] : "",
      tradeLicenseNo: customer.customerCode || "",
      taxIdTin: customer.taxTin || "",
      phone: customer.phone,
      alternatePhone: customer.alternatePhone || "",
      email: customer.email || "",
      deliveryAddress: customer.address,
      city: customer.city || "",
      assignedRoute: customer.territory || "General Route",
      creditLimit,
      maxDueDays: customer.creditDaysLimit,
      openingBalance,
      currentDue,
      totalPurchased,
      totalPaid,
      availableCredit,
      creditUtilizationPercent: utilizationPercent,
      creditStatus,
      oldestOverdueDays: 0,
      defaultDiscountPercent: 0,
      status: customer.status,
      totalSales: totalPurchased,
      salesCount: customer.sales.length,
      invoicesCount: customer.invoices.length,
      paymentsCount: customer.customerPayments.length,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      financialSummary,
      recentSales,
      recentPayments,
      ledger: ledger.reverse(), // Show newest transactions first in UI
    };
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    return null;
  }
}

/**
 * Fetch full chronological Customer Ledger with running balance
 */
export async function getCustomerLedger(customerId: string): Promise<{
  customer: CustomerRecord | null;
  ledger: CustomerLedgerEntry[];
  summary: CustomerFinancialSummary | null;
}> {
  const detail = await getCustomerById(customerId);
  if (!detail) {
    return { customer: null, ledger: [], summary: null };
  }

  return {
    customer: detail,
    ledger: detail.ledger,
    summary: detail.financialSummary,
  };
}

/**
 * Onboard a new Customer Pharmacy with server-side validation & audit logging
 */
export async function createCustomer(
  input: CustomerInput,
  userId?: string
): Promise<{ success: boolean; data?: CustomerRecord; error?: string }> {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return { success: false, error: "Company business profile missing. Please complete setup." };
    }

    // Check if drug license or phone already registered
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          { drugLicenseNo: input.drugLicenseNo },
          { phone: input.phone },
        ],
      },
    });

    if (existing) {
      if (existing.drugLicenseNo === input.drugLicenseNo) {
        return { success: false, error: `Pharmacy with Drug License "${input.drugLicenseNo}" is already registered.` };
      }
      if (existing.phone === input.phone) {
        return { success: false, error: `Phone number "${input.phone}" is already associated with another customer.` };
      }
    }

    // Generate unique customer code if not provided
    let customerCode = input.customerCode?.trim();
    if (!customerCode) {
      const count = await prisma.customer.count();
      customerCode = `CUST-${String(count + 1).padStart(4, "0")}`;
    }

    const openingBal = Number(input.openingBalance || 0);

    const newCustomer = await prisma.$transaction(async (tx) => {
      const created = await tx.customer.create({
        data: {
          companyId: company.id,
          customerCode,
          pharmacyName: input.tradeName.trim(),
          proprietorName: input.proprietorName?.trim() || "",
          customerType: input.customerType as CustomerType,
          drugLicenseNo: input.drugLicenseNo.trim(),
          drugLicenseExpiry: new Date(input.drugLicenseExpiry),
          taxTin: input.taxIdTin?.trim() || undefined,
          phone: input.phone.trim(),
          alternatePhone: input.alternatePhone?.trim() || undefined,
          email: input.email?.trim() || undefined,
          address: input.deliveryAddress.trim(),
          city: input.city?.trim() || undefined,
          territory: input.assignedRoute?.trim() || undefined,
          creditLimit: input.creditLimit,
          creditDaysLimit: input.maxDueDays,
          openingBalance: openingBal,
          currentDue: openingBal, // Initial due starts with opening balance
          totalPurchased: 0,
          totalPaid: 0,
          status: input.status as CustomerStatus,
          notes: input.notes?.trim() || undefined,
        },
      });

      // Write audit log if user available
      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "CREATE",
            entityName: "Customer",
            entityId: created.id,
            newValues: {
              pharmacyName: created.pharmacyName,
              customerCode: created.customerCode,
              creditLimit: input.creditLimit,
              openingBalance: openingBal,
            },
          },
        });
      }

      return created;
    });

    const { status: creditStatus, utilizationPercent, availableCredit } = calculateCreditStatus(
      Number(newCustomer.currentDue),
      Number(newCustomer.creditLimit)
    );

    const formatted: CustomerRecord = {
      id: newCustomer.id,
      customerCode: newCustomer.customerCode,
      tradeName: newCustomer.pharmacyName,
      proprietorName: newCustomer.proprietorName || "",
      customerType: newCustomer.customerType,
      drugLicenseNo: newCustomer.drugLicenseNo,
      drugLicenseExpiry: newCustomer.drugLicenseExpiry ? newCustomer.drugLicenseExpiry.toISOString().split("T")[0] : "",
      tradeLicenseNo: newCustomer.customerCode || "",
      taxIdTin: newCustomer.taxTin || "",
      phone: newCustomer.phone,
      alternatePhone: newCustomer.alternatePhone || "",
      email: newCustomer.email || "",
      deliveryAddress: newCustomer.address,
      city: newCustomer.city || "",
      assignedRoute: newCustomer.territory || "General Route",
      creditLimit: Number(newCustomer.creditLimit),
      maxDueDays: newCustomer.creditDaysLimit,
      openingBalance: Number(newCustomer.openingBalance),
      currentDue: Number(newCustomer.currentDue),
      totalPurchased: Number(newCustomer.totalPurchased),
      totalPaid: Number(newCustomer.totalPaid),
      availableCredit,
      creditUtilizationPercent: utilizationPercent,
      creditStatus,
      oldestOverdueDays: 0,
      defaultDiscountPercent: 0,
      status: newCustomer.status,
      totalSales: 0,
      createdAt: newCustomer.createdAt.toISOString(),
      updatedAt: newCustomer.updatedAt.toISOString(),
    };

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return { success: false, error: error.message || "Failed to onboard customer." };
  }
}

/**
 * Update Customer profile details (Strict Guardrail: Does not allow manual edits to financial balances)
 */
export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
  userId?: string
): Promise<{ success: boolean; data?: CustomerRecord; error?: string }> {
  try {
    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Customer not found." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.customer.update({
        where: { id },
        data: {
          pharmacyName: input.tradeName.trim(),
          proprietorName: input.proprietorName?.trim() || "",
          customerType: input.customerType as CustomerType,
          customerCode: input.customerCode?.trim() || existing.customerCode,
          drugLicenseNo: input.drugLicenseNo.trim(),
          drugLicenseExpiry: new Date(input.drugLicenseExpiry),
          taxTin: input.taxIdTin?.trim() || undefined,
          phone: input.phone.trim(),
          alternatePhone: input.alternatePhone?.trim() || undefined,
          email: input.email?.trim() || undefined,
          address: input.deliveryAddress.trim(),
          city: input.city?.trim() || undefined,
          territory: input.assignedRoute?.trim() || undefined,
          creditLimit: input.creditLimit,
          creditDaysLimit: input.maxDueDays,
          status: input.status as CustomerStatus,
          notes: input.notes?.trim() || undefined,
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "UPDATE",
            entityName: "Customer",
            entityId: id,
            newValues: {
              pharmacyName: res.pharmacyName,
              customerCode: res.customerCode,
              creditLimit: input.creditLimit,
            },
          },
        });
      }

      return res;
    });

    const { status: creditStatus, utilizationPercent, availableCredit } = calculateCreditStatus(
      Number(updated.currentDue),
      Number(updated.creditLimit)
    );

    const formatted: CustomerRecord = {
      id: updated.id,
      customerCode: updated.customerCode,
      tradeName: updated.pharmacyName,
      proprietorName: updated.proprietorName || "",
      customerType: updated.customerType,
      drugLicenseNo: updated.drugLicenseNo,
      drugLicenseExpiry: updated.drugLicenseExpiry ? updated.drugLicenseExpiry.toISOString().split("T")[0] : "",
      tradeLicenseNo: updated.customerCode || "",
      taxIdTin: updated.taxTin || "",
      phone: updated.phone,
      alternatePhone: updated.alternatePhone || "",
      email: updated.email || "",
      deliveryAddress: updated.address,
      city: updated.city || "",
      assignedRoute: updated.territory || "General Route",
      creditLimit: Number(updated.creditLimit),
      maxDueDays: updated.creditDaysLimit,
      openingBalance: Number(updated.openingBalance),
      currentDue: Number(updated.currentDue),
      totalPurchased: Number(updated.totalPurchased),
      totalPaid: Number(updated.totalPaid),
      availableCredit,
      creditUtilizationPercent: utilizationPercent,
      creditStatus,
      oldestOverdueDays: 0,
      defaultDiscountPercent: 0,
      status: updated.status,
      totalSales: Number(updated.totalPurchased),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return { success: false, error: error.message || "Failed to update customer." };
  }
}

/**
 * Toggle Customer Status (ACTIVE / INACTIVE / BLOCKED_OVERDUE) without deleting financial history
 */
export async function toggleCustomerStatus(
  id: string,
  newStatus: CustomerStatus,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sales: true,
            customerPayments: true,
          },
        },
      },
    });

    if (!customer) {
      return { success: false, error: "Customer not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id },
        data: { status: newStatus },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "UPDATE",
            entityName: "Customer",
            entityId: id,
            newValues: {
              previousStatus: customer.status,
              newStatus,
            },
          },
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling customer status:", error);
    return { success: false, error: error.message || "Failed to update status." };
  }
}
