import { prisma } from "@/lib/prisma";
import {
  SupplierRecord,
  SupplierDetailRecord,
  SupplierLedgerEntry,
  SupplierPaymentRecord,
  PurchaseRecord,
} from "@/types/models";
import { SupplierInput } from "@/validations/supplier.schema";
import { SupplierPaymentInput } from "@/validations/payment.schema";
import { MOCK_SUPPLIERS, MOCK_PURCHASES } from "../actions/mock-data";

export interface SupplierQueryParams {
  search?: string;
  statusFilter?: "ALL" | "ACTIVE" | "INACTIVE";
  dueFilter?: "ALL" | "HAS_DUE" | "NO_DUE";
  sortBy?: "name" | "currentPayable" | "totalPurchases" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface SupplierQueryResult {
  suppliers: SupplierRecord[];
  totalCount: number;
  totalPayableAmount: number;
  totalPurchasedAmount: number;
  activeCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch all suppliers with server-side search, filtering, sorting, pagination, and calculated metrics
 */
export async function getSuppliers(params: SupplierQueryParams = {}): Promise<SupplierQueryResult> {
  const {
    search = "",
    statusFilter = "ALL",
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
        { name: { contains: search.trim(), mode: "insensitive" } },
        { contactPerson: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { code: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }

    if (dueFilter === "HAS_DUE") {
      whereClause.currentDue = { gt: 0 };
    } else if (dueFilter === "NO_DUE") {
      whereClause.currentDue = { lte: 0 };
    }

    // Build orderBy
    let orderBy: any = { name: sortOrder };
    if (sortBy === "currentPayable") {
      orderBy = { currentDue: sortOrder };
    } else if (sortBy === "totalPurchases") {
      orderBy = { totalPurchased: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    const [totalCount, suppliers, allStats] = await Promise.all([
      prisma.supplier.count({ where: whereClause }),
      prisma.supplier.findMany({
        where: whereClause,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { purchases: true, medicines: true },
          },
        },
      }),
      prisma.supplier.aggregate({
        _sum: {
          currentDue: true,
          totalPurchased: true,
          totalPaid: true,
        },
      }),
    ]);

    const activeCount = await prisma.supplier.count({ where: { status: "ACTIVE" } });

    const formattedSuppliers: SupplierRecord[] = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      contactPerson: s.contactPerson || "",
      email: s.email || "",
      phone: s.phone,
      address: s.address || "",
      city: s.city || "",
      country: "Bangladesh",
      drugLicenseNo: s.drugLicenseNo || "",
      tradeLicenseNo: s.code || "",
      taxIdTin: s.taxTin || "",
      creditDays: s.creditPeriodDays,
      creditLimit: 5000000,
      openingBalance: Number(s.openingBalance || 0),
      currentPayable: Number(s.currentDue),
      totalPaid: Number(s.totalPaid),
      status: s.status,
      totalPurchases: Number(s.totalPurchased),
      purchasesCount: s._count.purchases,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return {
      suppliers: formattedSuppliers,
      totalCount,
      totalPayableAmount: Number(allStats._sum.currentDue || 0),
      totalPurchasedAmount: Number(allStats._sum.totalPurchased || 0),
      activeCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  } catch (error) {
    // Graceful fallback to mock data when offline
    let filtered = [...MOCK_SUPPLIERS];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (dueFilter === "HAS_DUE") {
      filtered = filtered.filter((s) => s.currentPayable > 0);
    } else if (dueFilter === "NO_DUE") {
      filtered = filtered.filter((s) => s.currentPayable <= 0);
    }

    const totalCount = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const formattedMock: SupplierRecord[] = paginated.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.tradeLicenseNo,
      contactPerson: s.contactPerson,
      email: s.email,
      phone: s.phone,
      address: s.address,
      city: s.city,
      country: s.country,
      drugLicenseNo: s.drugLicenseNo,
      tradeLicenseNo: s.tradeLicenseNo,
      taxIdTin: s.taxIdTin,
      creditDays: s.creditDays,
      creditLimit: s.creditLimit,
      openingBalance: s.openingBalance || 0,
      currentPayable: s.currentPayable,
      totalPaid: s.totalPaid || 0,
      status: s.status,
      totalPurchases: s.totalPurchases,
    }));

    return {
      suppliers: formattedMock,
      totalCount,
      totalPayableAmount: filtered.reduce((sum, s) => sum + s.currentPayable, 0),
      totalPurchasedAmount: filtered.reduce((sum, s) => sum + s.totalPurchases, 0),
      activeCount: filtered.filter((s) => s.status === "ACTIVE").length,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  }
}

/**
 * Fetch comprehensive supplier details, real financial totals, recent purchases, payments, and full chronological ledger
 */
export async function getSupplierById(id: string): Promise<SupplierDetailRecord | null> {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { purchaseDate: "desc" },
          take: 50,
          include: {
            createdBy: { select: { name: true } },
            purchaseItems: true,
          },
        },
        supplierPayments: {
          orderBy: { paymentDate: "desc" },
          take: 50,
          include: {
            createdBy: { select: { name: true } },
            purchase: { select: { purchaseNumber: true } },
          },
        },
        _count: {
          select: { medicines: true, purchases: true },
        },
      },
    });

    if (!supplier) {
      // Check mock
      const mock = MOCK_SUPPLIERS.find((s) => s.id === id);
      if (!mock) return null;

      const mockPurchases: PurchaseRecord[] = MOCK_PURCHASES.filter(
        (p) => p.supplierId === id || p.supplierName === mock.name
      ).map((p) => ({
        id: p.id,
        poNumber: p.poNumber,
        supplierId: p.supplierId,
        supplierName: p.supplierName,
        purchaseDate: p.purchaseDate,
        supplierInvoiceNo: p.supplierInvoiceNo,
        subtotalAmount: p.subtotalAmount,
        discountAmount: p.discountAmount,
        taxAmount: p.taxAmount,
        grandTotal: p.grandTotal,
        paidAmount: p.paidAmount,
        dueAmount: p.dueAmount,
        paymentStatus: p.paymentStatus,
        status: p.status,
        itemsCount: p.itemsCount,
      }));

      const opBal = mock.openingBalance || 0;
      return {
        id: mock.id,
        name: mock.name,
        code: mock.tradeLicenseNo,
        contactPerson: mock.contactPerson,
        email: mock.email,
        phone: mock.phone,
        address: mock.address,
        city: mock.city,
        country: mock.country,
        drugLicenseNo: mock.drugLicenseNo,
        tradeLicenseNo: mock.tradeLicenseNo,
        taxIdTin: mock.taxIdTin,
        creditDays: mock.creditDays,
        creditLimit: mock.creditLimit,
        openingBalance: opBal,
        currentPayable: mock.currentPayable,
        totalPaid: mock.totalPaid || 0,
        status: mock.status,
        totalPurchases: mock.totalPurchases,
        recentPurchases: mockPurchases,
        recentPayments: [],
        ledger: [
          {
            id: "leg-init",
            date: "2026-01-01",
            type: "OPENING_BALANCE",
            referenceNumber: "INIT",
            description: "Opening Balance",
            debit: opBal,
            credit: 0,
            runningBalance: opBal,
          },
        ],
        suppliedMedicinesCount: 5,
      };
    }

    const purchasesFormatted: PurchaseRecord[] = supplier.purchases.map((p) => ({
      id: p.id,
      poNumber: p.purchaseNumber,
      supplierId: p.supplierId,
      supplierName: supplier.name,
      warehouseId: p.warehouseId,
      purchaseDate: p.purchaseDate.toISOString().split("T")[0],
      expectedDeliveryDate: p.expectedDeliveryDate ? p.expectedDeliveryDate.toISOString().split("T")[0] : null,
      supplierInvoiceNo: p.supplierInvoiceNumber || undefined,
      subtotalAmount: Number(p.subtotalAmount),
      discountAmount: Number(p.discountAmount),
      taxAmount: Number(p.taxAmount),
      grandTotal: Number(p.grandTotal),
      paidAmount: Number(p.paidAmount),
      dueAmount: Number(p.dueAmount),
      paymentStatus: p.paymentStatus as any,
      status: p.status as any,
      itemsCount: p.purchaseItems.length,
      notes: p.notes,
      cancellationReason: p.cancellationReason,
      cancelledAt: p.cancelledAt ? p.cancelledAt.toISOString() : null,
      createdByName: p.createdBy?.name || "System Admin",
      createdAt: p.createdAt.toISOString(),
    }));

    const paymentsFormatted: SupplierPaymentRecord[] = supplier.supplierPayments.map((pay) => ({
      id: pay.id,
      voucherNumber: pay.voucherNumber,
      supplierId: pay.supplierId,
      supplierName: supplier.name,
      purchaseId: pay.purchaseId,
      purchaseNumber: pay.purchase?.purchaseNumber || null,
      amount: Number(pay.amount),
      paymentDate: pay.paymentDate.toISOString().split("T")[0],
      paymentMethod: pay.paymentMethod as string,
      referenceNumber: pay.referenceNumber,
      bankName: pay.bankName,
      chequeNumber: pay.chequeNumber,
      chequeDate: pay.chequeDate ? pay.chequeDate.toISOString().split("T")[0] : null,
      notes: pay.notes,
      status: pay.status as any,
      createdByName: pay.createdBy?.name || "Accounts Officer",
      createdAt: pay.createdAt.toISOString(),
    }));

    // Construct full chronological ledger
    const ledgerEvents: Array<{
      date: Date;
      id: string;
      type: "PURCHASE" | "PAYMENT" | "OPENING_BALANCE" | "CANCELLATION_REVERSAL";
      referenceNumber: string;
      description: string;
      debit: number;
      credit: number;
    }> = [];

    // 1. Opening Balance
    const opBal = Number(supplier.openingBalance || 0);
    if (opBal > 0) {
      ledgerEvents.push({
        date: supplier.createdAt,
        id: `op-${supplier.id}`,
        type: "OPENING_BALANCE",
        referenceNumber: "OP-BAL",
        description: "Initial Opening Due / Payable Balance",
        debit: opBal,
        credit: 0,
      });
    }

    // 2. Purchases
    for (const p of supplier.purchases) {
      if (p.status !== "CANCELLED") {
        ledgerEvents.push({
          date: p.purchaseDate,
          id: `po-${p.id}`,
          type: "PURCHASE",
          referenceNumber: p.purchaseNumber,
          description: `Consignment Intake #${p.purchaseNumber} (Inv: ${p.supplierInvoiceNumber || "N/A"})`,
          debit: Number(p.grandTotal),
          credit: 0,
        });
      } else {
        // Log both purchase and its cancellation
        ledgerEvents.push({
          date: p.purchaseDate,
          id: `po-${p.id}`,
          type: "PURCHASE",
          referenceNumber: p.purchaseNumber,
          description: `Consignment Intake #${p.purchaseNumber} [VOIDED]`,
          debit: Number(p.grandTotal),
          credit: 0,
        });
        ledgerEvents.push({
          date: p.cancelledAt || p.updatedAt,
          id: `po-can-${p.id}`,
          type: "CANCELLATION_REVERSAL",
          referenceNumber: `REV-${p.purchaseNumber}`,
          description: `Purchase Voided & Stock Reversal (${p.cancellationReason || "Cancelled"})`,
          debit: 0,
          credit: Number(p.grandTotal),
        });
      }
    }

    // 3. Payments
    for (const pay of supplier.supplierPayments) {
      if (pay.status === "CONFIRMED") {
        ledgerEvents.push({
          date: pay.paymentDate,
          id: `pay-${pay.id}`,
          type: "PAYMENT",
          referenceNumber: pay.voucherNumber,
          description: `Payment Voucher ${pay.voucherNumber} via ${pay.paymentMethod} (Ref: ${pay.referenceNumber || "N/A"})`,
          debit: 0,
          credit: Number(pay.amount),
        });
      }
    }

    // Sort chronologically ascending
    ledgerEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    let runningBalance = 0;
    const ledger: SupplierLedgerEntry[] = ledgerEvents.map((ev) => {
      runningBalance = runningBalance + ev.debit - ev.credit;
      return {
        id: ev.id,
        date: ev.date.toISOString().split("T")[0],
        type: ev.type,
        referenceNumber: ev.referenceNumber,
        description: ev.description,
        debit: ev.debit,
        credit: ev.credit,
        runningBalance: Math.max(0, runningBalance),
      };
    });

    return {
      id: supplier.id,
      name: supplier.name,
      code: supplier.code,
      contactPerson: supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone,
      address: supplier.address || "",
      city: supplier.city || "",
      country: "Bangladesh",
      drugLicenseNo: supplier.drugLicenseNo || "",
      tradeLicenseNo: supplier.code || "",
      taxIdTin: supplier.taxTin || "",
      creditDays: supplier.creditPeriodDays,
      creditLimit: 5000000,
      openingBalance: opBal,
      currentPayable: Number(supplier.currentDue),
      totalPaid: Number(supplier.totalPaid),
      status: supplier.status,
      totalPurchases: Number(supplier.totalPurchased),
      purchasesCount: supplier._count.purchases,
      suppliedMedicinesCount: supplier._count.medicines,
      recentPurchases: purchasesFormatted,
      recentPayments: paymentsFormatted,
      ledger,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
    };
  } catch (error) {
    const mock = MOCK_SUPPLIERS.find((s) => s.id === id);
    if (!mock) return null;
    const opBal = mock.openingBalance || 0;
    return {
      id: mock.id,
      name: mock.name,
      code: mock.tradeLicenseNo,
      contactPerson: mock.contactPerson,
      email: mock.email,
      phone: mock.phone,
      address: mock.address,
      city: mock.city,
      country: mock.country,
      drugLicenseNo: mock.drugLicenseNo,
      tradeLicenseNo: mock.tradeLicenseNo,
      taxIdTin: mock.taxIdTin,
      creditDays: mock.creditDays,
      creditLimit: mock.creditLimit,
      openingBalance: opBal,
      currentPayable: mock.currentPayable,
      totalPaid: mock.totalPaid || 0,
      status: mock.status,
      totalPurchases: mock.totalPurchases,
      recentPurchases: [],
      recentPayments: [],
      ledger: [],
      suppliedMedicinesCount: 0,
    };
  }
}

/**
 * Register a new supplier with opening balance and audit log
 */
export async function createSupplier(data: SupplierInput, userId?: string) {
  return await prisma.$transaction(async (tx) => {
    const company = await tx.company.findFirst();
    if (!company) {
      throw new Error("Enterprise company profile not found in system.");
    }

    // Check duplicate name
    const existing = await tx.supplier.findFirst({
      where: {
        name: { equals: data.name.trim(), mode: "insensitive" },
      },
    });

    if (existing) {
      throw new Error(`Supplier with name "${data.name}" already exists.`);
    }

    const supplierCode = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
    const opBal = data.openingBalance || 0;

    const supplier = await tx.supplier.create({
      data: {
        companyId: company.id,
        name: data.name.trim(),
        code: data.tradeLicenseNo || supplierCode,
        contactPerson: data.contactPerson?.trim() || null,
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        drugLicenseNo: data.drugLicenseNo?.trim() || null,
        taxTin: data.taxIdTin?.trim() || null,
        creditPeriodDays: data.creditDays || 30,
        openingBalance: opBal,
        currentDue: opBal,
        totalPurchased: 0,
        totalPaid: 0,
        status: data.status || "ACTIVE",
      },
    });

    // Create Audit Log
    await tx.auditLog.create({
      data: {
        userId: userId || null,
        action: "SUPPLIER_CREATED",
        entityName: "Supplier",
        entityId: supplier.id,
        newValues: {
          name: supplier.name,
          phone: supplier.phone,
          openingBalance: opBal,
          creditDays: supplier.creditPeriodDays,
        },
      },
    });

    return supplier;
  });
}

/**
 * Update an existing supplier
 */
export async function updateSupplier(id: string, data: Partial<SupplierInput>, userId?: string) {
  return await prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new Error("Supplier record not found.");
    }

    const updated = await tx.supplier.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : supplier.name,
        contactPerson: data.contactPerson !== undefined ? data.contactPerson : supplier.contactPerson,
        phone: data.phone ? data.phone.trim() : supplier.phone,
        email: data.email !== undefined ? data.email : supplier.email,
        address: data.address !== undefined ? data.address : supplier.address,
        city: data.city !== undefined ? data.city : supplier.city,
        drugLicenseNo: data.drugLicenseNo !== undefined ? data.drugLicenseNo : supplier.drugLicenseNo,
        taxTin: data.taxIdTin !== undefined ? data.taxIdTin : supplier.taxTin,
        creditPeriodDays: data.creditDays !== undefined ? data.creditDays : supplier.creditPeriodDays,
        status: data.status || supplier.status,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: userId || null,
        action: "SUPPLIER_UPDATED",
        entityName: "Supplier",
        entityId: id,
        oldValues: { name: supplier.name, phone: supplier.phone, status: supplier.status },
        newValues: { name: updated.name, phone: updated.phone, status: updated.status },
      },
    });

    return updated;
  });
}

/**
 * Toggle supplier active/inactive status
 */
export async function toggleSupplierStatus(id: string, status: "ACTIVE" | "INACTIVE", userId?: string) {
  return await prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({ where: { id } });
    if (!supplier) throw new Error("Supplier not found.");

    const updated = await tx.supplier.update({
      where: { id },
      data: { status },
    });

    await tx.auditLog.create({
      data: {
        userId: userId || null,
        action: status === "ACTIVE" ? "SUPPLIER_ACTIVATED" : "SUPPLIER_DEACTIVATED",
        entityName: "Supplier",
        entityId: id,
        newValues: { status },
      },
    });

    return updated;
  });
}

/**
 * Record a supplier payment voucher and update AP ledgers atomically
 */
export async function recordSupplierPayment(data: SupplierPaymentInput, userId?: string) {
  if (data.amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  return await prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({ where: { id: data.supplierId } });
    if (!supplier) {
      throw new Error("Supplier record not found.");
    }

    const currentDue = Number(supplier.currentDue);
    if (data.amount > currentDue && currentDue > 0) {
      // Overpayment guard
      throw new Error(
        `Payment amount (৳${data.amount.toLocaleString()}) exceeds the total outstanding payable (৳${currentDue.toLocaleString()}). Advances are restricted.`
      );
    }

    const voucherNumber = `PV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const payment = await tx.supplierPayment.create({
      data: {
        voucherNumber,
        supplierId: data.supplierId,
        createdById: userId || (await tx.user.findFirst())?.id || "",
        amount: data.amount,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod as any,
        referenceNumber: data.referenceNo || null,
        bankName: data.bankName || null,
        chequeNumber: data.chequeNumber || null,
        notes: data.notes || null,
        status: "CONFIRMED",
      },
    });

    // Reduce Supplier Due & increase totalPaid
    await tx.supplier.update({
      where: { id: data.supplierId },
      data: {
        currentDue: { decrement: data.amount },
        totalPaid: { increment: data.amount },
      },
    });

    // Reconcile FIFO with unpaid purchases
    const unpaidPurchases = await tx.purchase.findMany({
      where: {
        supplierId: data.supplierId,
        status: { in: ["RECEIVED", "ORDERED"] },
        dueAmount: { gt: 0 },
      },
      orderBy: { purchaseDate: "asc" },
    });

    let remainingAllocation = data.amount;
    for (const po of unpaidPurchases) {
      if (remainingAllocation <= 0) break;
      const poDue = Number(po.dueAmount);
      const allocated = Math.min(remainingAllocation, poDue);

      const newDue = poDue - allocated;
      const newPaid = Number(po.paidAmount) + allocated;

      await tx.purchase.update({
        where: { id: po.id },
        data: {
          paidAmount: newPaid,
          dueAmount: newDue,
          paymentStatus: newDue === 0 ? "PAID" : "PARTIALLY_PAID",
        },
      });

      remainingAllocation -= allocated;
    }

    // Create Audit Log
    await tx.auditLog.create({
      data: {
        userId: userId || null,
        action: "SUPPLIER_PAYMENT_RECORDED",
        entityName: "SupplierPayment",
        entityId: payment.id,
        newValues: {
          voucherNumber,
          supplierName: supplier.name,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
        },
      },
    });

    return payment;
  });
}
