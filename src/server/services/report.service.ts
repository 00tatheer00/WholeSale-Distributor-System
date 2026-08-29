import { prisma } from "@/lib/prisma";
import { resolveProfitDateRange } from "@/server/services/profit.service";

// Common Query Parameters
export interface ReportFilterParams {
  preset?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  customerId?: string;
  supplierId?: string;
  distributorId?: string;
  categoryId?: string;
  status?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 1. HUB SUMMARY: High-level analytics for the Reports Center
 */
export async function getReportsHubSummary() {
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  const [
    salesAgg,
    purchasesAgg,
    inventoryCostAgg,
    expensesAgg,
    expiredCount,
    nearExpiryCount,
    lowStockMedicines,
    totalCustomers,
    totalCustomerDues,
    totalSuppliers,
    totalSupplierDues,
    activeDistributors,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { grandTotal: true, totalCogs: true },
      _count: { id: true },
    }),
    prisma.purchase.aggregate({
      where: { status: "RECEIVED" },
      _sum: { grandTotal: true },
      _count: { id: true },
    }),
    prisma.medicineBatch.aggregate({
      where: { quantityOnHand: { gt: 0 } },
      _sum: { quantityOnHand: true },
    }),
    prisma.businessExpense.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.medicineBatch.count({
      where: { quantityOnHand: { gt: 0 }, expiryDate: { lt: now } },
    }),
    prisma.medicineBatch.count({
      where: { quantityOnHand: { gt: 0 }, expiryDate: { gte: now, lte: in30Days } },
    }),
    prisma.medicine.findMany({
      where: { status: "ACTIVE" },
      include: {
        batches: {
          where: { quantityOnHand: { gt: 0 } },
          select: { quantityOnHand: true },
        },
      },
    }),
    prisma.customer.count({ where: { status: "ACTIVE" } }),
    prisma.customer.aggregate({
      _sum: { currentDue: true },
    }),
    prisma.supplier.count({ where: { status: "ACTIVE" } }),
    prisma.supplier.aggregate({
      _sum: { currentDue: true },
    }),
    prisma.distributor.count({ where: { status: "ACTIVE" } }),
  ]);

  const totalRevenue = Number(salesAgg._sum.grandTotal || 0);
  const totalCogs = Number(salesAgg._sum.totalCogs || 0);
  const grossProfit = totalRevenue - totalCogs;
  const totalExpenses = Number(expensesAgg._sum.amount || 0);
  const netProfit = grossProfit - totalExpenses;

  const lowStockCount = lowStockMedicines.filter((m) => {
    const totalStock = m.batches.reduce((s, b) => s + b.quantityOnHand, 0);
    return totalStock <= m.minReorderLevel;
  }).length;

  return {
    totalRevenue,
    totalSalesCount: salesAgg._count.id,
    grossProfit,
    netProfit,
    totalPurchases: Number(purchasesAgg._sum.grandTotal || 0),
    totalPurchaseCount: purchasesAgg._count.id,
    totalUnitsInStock: inventoryCostAgg._sum.quantityOnHand || 0,
    totalExpenses,
    expiredCount,
    nearExpiryCount,
    lowStockCount,
    totalCustomers,
    totalCustomerDues: Number(totalCustomerDues._sum.currentDue || 0),
    totalSuppliers,
    totalSupplierDues: Number(totalSupplierDues._sum.currentDue || 0),
    activeDistributors,
  };
}

/**
 * 2. SALES REPORT
 */
export async function getSalesReport(params: ReportFilterParams = {}) {
  const { preset = "this_month", startDate: customStart, endDate: customEnd, customerId, distributorId, status, search = "" } = params;
  const { startDate, endDate, startDateStr, endDateStr } = resolveProfitDateRange(preset, customStart, customEnd);

  const whereClause: any = {
    saleDate: { gte: startDate, lte: endDate },
  };

  if (status && status !== "ALL") whereClause.status = status;
  if (customerId && customerId !== "ALL") whereClause.customerId = customerId;
  if (distributorId && distributorId !== "ALL") whereClause.distributorId = distributorId;
  if (search.trim()) {
    whereClause.OR = [
      { saleNumber: { contains: search.trim() } },
      { customer: { pharmacyName: { contains: search.trim() } } },
    ];
  }

  const [sales, stats] = await Promise.all([
    prisma.sale.findMany({
      where: whereClause,
      orderBy: { saleDate: "desc" },
      include: {
        customer: true,
        distributor: true,
        invoice: true,
      },
    }),
    prisma.sale.aggregate({
      where: whereClause,
      _sum: {
        grandTotal: true,
        subtotalAmount: true,
        discountAmount: true,
        taxAmount: true,
        paidAmount: true,
        dueAmount: true,
        totalCogs: true,
      },
      _count: { id: true },
    }),
  ]);

  const totalRevenue = Number(stats._sum.grandTotal || 0);
  const totalCogs = Number(stats._sum.totalCogs || 0);

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    preset,
    totalRevenue,
    totalCogs,
    grossProfit: totalRevenue - totalCogs,
    grossMarginPercent: totalRevenue > 0 ? ((totalRevenue - totalCogs) / totalRevenue) * 100 : 0,
    totalPaid: Number(stats._sum.paidAmount || 0),
    totalDue: Number(stats._sum.dueAmount || 0),
    totalDiscount: Number(stats._sum.discountAmount || 0),
    totalTax: Number(stats._sum.taxAmount || 0),
    salesCount: stats._count.id,
    sales: sales.map((s) => ({
      id: s.id,
      saleNumber: s.saleNumber,
      invoiceNumber: s.invoice?.invoiceNumber || "N/A",
      customerName: s.customer.pharmacyName,
      distributorName: s.distributor?.name || "Direct Cashier",
      saleDate: s.saleDate.toISOString().split("T")[0],
      grandTotal: Number(s.grandTotal),
      paidAmount: Number(s.paidAmount),
      dueAmount: Number(s.dueAmount),
      cogsTotal: Number(s.totalCogs),
      grossProfit: Number(s.grandTotal) - Number(s.totalCogs),
      status: s.status,
      paymentStatus: s.paymentStatus,
    })),
  };
}

/**
 * 3. PURCHASE REPORT
 */
export async function getPurchaseReport(params: ReportFilterParams = {}) {
  const { preset = "this_month", startDate: customStart, endDate: customEnd, supplierId, status, search = "" } = params;
  const { startDate, endDate, startDateStr, endDateStr } = resolveProfitDateRange(preset, customStart, customEnd);

  const whereClause: any = {
    purchaseDate: { gte: startDate, lte: endDate },
  };

  if (status && status !== "ALL") whereClause.status = status;
  if (supplierId && supplierId !== "ALL") whereClause.supplierId = supplierId;
  if (search.trim()) {
    whereClause.OR = [
      { purchaseNumber: { contains: search.trim() } },
      { supplierInvoiceNumber: { contains: search.trim() } },
      { supplier: { name: { contains: search.trim() } } },
    ];
  }

  const [purchases, stats] = await Promise.all([
    prisma.purchase.findMany({
      where: whereClause,
      orderBy: { purchaseDate: "desc" },
      include: {
        supplier: true,
      },
    }),
    prisma.purchase.aggregate({
      where: whereClause,
      _sum: {
        grandTotal: true,
        paidAmount: true,
        dueAmount: true,
      },
      _count: { id: true },
    }),
  ]);

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    preset,
    totalPurchases: Number(stats._sum.grandTotal || 0),
    totalPaid: Number(stats._sum.paidAmount || 0),
    totalDue: Number(stats._sum.dueAmount || 0),
    purchaseCount: stats._count.id,
    purchases: purchases.map((p) => ({
      id: p.id,
      purchaseNumber: p.purchaseNumber,
      supplierInvoiceNumber: p.supplierInvoiceNumber || "N/A",
      supplierName: p.supplier.name,
      purchaseDate: p.purchaseDate.toISOString().split("T")[0],
      totalAmount: Number(p.grandTotal),
      paidAmount: Number(p.paidAmount),
      dueAmount: Number(p.dueAmount),
      status: p.status,
      paymentStatus: p.paymentStatus,
    })),
  };
}

/**
 * 4. INVENTORY REPORT
 */
export async function getInventoryReport(params: ReportFilterParams = {}) {
  const { categoryId, supplierId, search = "" } = params;

  const whereClause: any = {
    quantityOnHand: { gt: 0 },
  };

  if (categoryId && categoryId !== "ALL") whereClause.medicine = { categoryId };
  if (supplierId && supplierId !== "ALL") whereClause.medicine = { ...whereClause.medicine, supplierId };
  if (search.trim()) {
    whereClause.OR = [
      { batchNumber: { contains: search.trim() } },
      { medicine: { brandName: { contains: search.trim() } } },
      { medicine: { genericName: { contains: search.trim() } } },
    ];
  }

  const batches = await prisma.medicineBatch.findMany({
    where: whereClause,
    orderBy: { expiryDate: "asc" },
    include: {
      medicine: {
        include: {
          category: true,
          supplier: true,
        },
      },
    },
  });

  let totalCostValuation = 0;
  let totalSellingValuation = 0;
  let totalUnits = 0;

  const items = batches.map((b) => {
    const cost = Number(b.purchaseCostPrice);
    const tp = Number(b.tradePrice);
    const costVal = b.quantityOnHand * cost;
    const sellVal = b.quantityOnHand * tp;

    totalCostValuation += costVal;
    totalSellingValuation += sellVal;
    totalUnits += b.quantityOnHand;

    return {
      id: b.id,
      brandName: b.medicine.brandName,
      genericName: b.medicine.genericName,
      categoryName: b.medicine.category?.name || "General",
      supplierName: b.medicine.supplier?.name || "N/A",
      batchNumber: b.batchNumber,
      expiryDate: b.expiryDate.toISOString().split("T")[0],
      quantityOnHand: b.quantityOnHand,
      purchaseCost: cost,
      tradePrice: tp,
      mrp: Number(b.mrp),
      inventoryValue: costVal,
      potentialRevenue: sellVal,
      status: b.status,
    };
  });

  return {
    totalUnits,
    totalBatches: batches.length,
    totalCostValuation,
    totalSellingValuation,
    potentialGrossProfit: totalSellingValuation - totalCostValuation,
    items,
  };
}

/**
 * 5. EXPIRY REPORT
 */
export async function getExpiryReport(warningDays: number = 60) {
  const now = new Date();
  const warningLimit = new Date();
  warningLimit.setDate(now.getDate() + warningDays);

  const batches = await prisma.medicineBatch.findMany({
    where: {
      quantityOnHand: { gt: 0 },
      expiryDate: { lte: warningLimit },
    },
    orderBy: { expiryDate: "asc" },
    include: {
      medicine: {
        include: {
          category: true,
          supplier: true,
        },
      },
    },
  });

  let expiredCount = 0;
  let expiredValue = 0;
  let nearExpiryCount = 0;
  let nearExpiryValue = 0;

  const items = batches.map((b) => {
    const isExpired = b.expiryDate < now;
    const daysLeft = Math.ceil((b.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const cost = Number(b.purchaseCostPrice);
    const value = b.quantityOnHand * cost;

    if (isExpired) {
      expiredCount++;
      expiredValue += value;
    } else {
      nearExpiryCount++;
      nearExpiryValue += value;
    }

    return {
      id: b.id,
      brandName: b.medicine.brandName,
      genericName: b.medicine.genericName,
      categoryName: b.medicine.category?.name || "General",
      supplierName: b.medicine.supplier?.name || "N/A",
      batchNumber: b.batchNumber,
      quantityOnHand: b.quantityOnHand,
      expiryDate: b.expiryDate.toISOString().split("T")[0],
      daysLeft,
      unitCostPrice: cost,
      inventoryCostValue: value,
      isExpired,
      riskBucket: isExpired ? "EXPIRED" : daysLeft <= 30 ? "CRITICAL_30D" : "WARNING_60D",
    };
  });

  return {
    warningDays,
    expiredCount,
    expiredValue,
    nearExpiryCount,
    nearExpiryValue,
    totalAtRiskValue: expiredValue + nearExpiryValue,
    items,
  };
}

/**
 * 6. LOW STOCK REPORT
 */
export async function getLowStockReport() {
  const medicines = await prisma.medicine.findMany({
    where: { status: "ACTIVE" },
    include: {
      category: true,
      supplier: true,
      batches: {
        where: { quantityOnHand: { gt: 0 } },
        select: { quantityOnHand: true, purchaseCostPrice: true },
      },
    },
    orderBy: { brandName: "asc" },
  });

  const lowStockItems: any[] = [];
  let outOfStockCount = 0;
  let lowStockCount = 0;

  medicines.forEach((m) => {
    const totalStock = m.batches.reduce((s: number, b: any) => s + b.quantityOnHand, 0);
    const isOutOfStock = totalStock === 0;
    const isLowStock = totalStock <= m.minReorderLevel;

    if (isOutOfStock || isLowStock) {
      if (isOutOfStock) outOfStockCount++;
      else lowStockCount++;

      const deficit = Math.max(0, m.minReorderLevel * 2 - totalStock);

      lowStockItems.push({
        id: m.id,
        brandName: m.brandName,
        genericName: m.genericName,
        dosageForm: m.dosageForm,
        categoryName: m.category?.name || "General",
        supplierName: m.supplier?.name || "N/A",
        supplierPhone: m.supplier?.phone || "N/A",
        currentStock: totalStock,
        minStockLevel: m.minReorderLevel,
        reorderLevel: m.minReorderLevel * 2,
        reorderDeficit: deficit,
        unitTradePrice: Number(m.defaultTradePrice),
        unitCost: Number(m.defaultTradePrice) * 0.85,
        status: isOutOfStock ? "OUT_OF_STOCK" : "LOW_STOCK",
      });
    }
  });

  lowStockItems.sort((a, b) => a.currentStock - b.currentStock);

  return {
    outOfStockCount,
    lowStockCount,
    totalDeficitItems: lowStockItems.length,
    items: lowStockItems,
  };
}

/**
 * 7. CUSTOMER DUES & AR AGING REPORT
 */
export async function getCustomerDueReport() {
  const customers = await prisma.customer.findMany({
    where: { currentDue: { gt: 0 } },
    orderBy: { currentDue: "desc" },
  });

  let totalReceivables = 0;
  let totalCreditLimit = 0;
  let overLimitCount = 0;

  const items = customers.map((c) => {
    const due = Number(c.currentDue);
    const limit = Number(c.creditLimit);
    const isOverLimit = limit > 0 && due > limit;
    const utilization = limit > 0 ? (due / limit) * 100 : 0;

    totalReceivables += due;
    totalCreditLimit += limit;
    if (isOverLimit) overLimitCount++;

    return {
      id: c.id,
      customerCode: c.customerCode,
      pharmacyName: c.pharmacyName,
      proprietorName: c.proprietorName || "N/A",
      phone: c.phone,
      address: c.address,
      creditLimit: limit,
      currentDue: due,
      availableCredit: Math.max(0, limit - due),
      creditUtilizationPercent: Math.round(utilization),
      isOverLimit,
      status: c.status,
    };
  });

  return {
    totalReceivables,
    totalCreditLimit,
    overLimitCount,
    totalCustomersWithDue: customers.length,
    items,
  };
}

/**
 * 8. SUPPLIER DUES & AP PAYABLES REPORT
 */
export async function getSupplierDueReport() {
  const suppliers = await prisma.supplier.findMany({
    where: { currentDue: { gt: 0 } },
    orderBy: { currentDue: "desc" },
  });

  let totalPayables = 0;

  const items = suppliers.map((s) => {
    const due = Number(s.currentDue);
    totalPayables += due;

    return {
      id: s.id,
      name: s.name,
      drugLicenseNo: s.drugLicenseNo || "N/A",
      phone: s.phone,
      creditPeriodDays: s.creditPeriodDays,
      currentDue: due,
      status: s.status,
    };
  });

  return {
    totalPayables,
    totalSuppliersWithDue: suppliers.length,
    items,
  };
}

/**
 * 9. MEDICINE SALES & PROFIT PERFORMANCE REPORT
 */
export async function getMedicinePerformanceReport(params: ReportFilterParams = {}) {
  const { preset = "this_month", startDate: customStart, endDate: customEnd } = params;
  const { startDate, endDate, startDateStr, endDateStr } = resolveProfitDateRange(preset, customStart, customEnd);

  const sales = await prisma.sale.findMany({
    where: {
      status: "CONFIRMED",
      saleDate: { gte: startDate, lte: endDate },
    },
    include: {
      saleItems: {
        include: {
          medicine: {
            include: { category: true },
          },
        },
      },
    },
  });

  const medMap = new Map<
    string,
    {
      brandName: string;
      genericName: string;
      categoryName: string;
      qty: number;
      revenue: number;
      cogs: number;
    }
  >();

  sales.forEach((s) => {
    s.saleItems.forEach((it) => {
      const existing = medMap.get(it.medicineId) || {
        brandName: it.medicine.brandName,
        genericName: it.medicine.genericName,
        categoryName: it.medicine.category?.name || "General",
        qty: 0,
        revenue: 0,
        cogs: 0,
      };
      existing.qty += it.quantity + it.bonusQuantity;
      existing.revenue += Number(it.lineTotal);
      existing.cogs += Number(it.lineCogs);
      medMap.set(it.medicineId, existing);
    });
  });

  const items = Array.from(medMap.entries()).map(([medicineId, data]) => {
    const gross = data.revenue - data.cogs;
    return {
      medicineId,
      brandName: data.brandName,
      genericName: data.genericName,
      categoryName: data.categoryName,
      quantitySold: data.qty,
      salesRevenue: Math.round(data.revenue),
      historicalCogs: Math.round(data.cogs),
      grossProfit: Math.round(gross),
      marginPercent: data.revenue > 0 ? (gross / data.revenue) * 100 : 0,
    };
  });

  items.sort((a, b) => b.salesRevenue - a.salesRevenue);

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    preset,
    top10Selling: items.slice(0, 10),
    allItems: items,
  };
}

/**
 * 10. COLLECTIONS & PAYMENTS REPORT
 */
export async function getPaymentReport(params: ReportFilterParams = {}) {
  const {
    preset = "this_month",
    startDate: customStart,
    endDate: customEnd,
    distributorId,
    customerId,
    supplierId,
  } = params;
  const { startDate, endDate, startDateStr, endDateStr } = resolveProfitDateRange(
    preset,
    customStart,
    customEnd
  );

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const customerPaymentWhere: any = {
    status: "CONFIRMED",
    paymentDate: { gte: startDate, lte: endDate },
  };
  if (distributorId && distributorId !== "ALL") {
    customerPaymentWhere.distributorId = distributorId;
  }
  if (customerId && customerId !== "ALL") {
    customerPaymentWhere.customerId = customerId;
  }

  const supplierPaymentWhere: any = {
    status: "CONFIRMED",
    paymentDate: { gte: startDate, lte: endDate },
  };
  if (supplierId && supplierId !== "ALL") {
    supplierPaymentWhere.supplierId = supplierId;
  }

  const [
    customerPayments,
    supplierPayments,
    todayCollectionsAgg,
    monthCollectionsAgg,
    distributors,
  ] = await Promise.all([
    prisma.customerPayment.findMany({
      where: customerPaymentWhere,
      include: {
        customer: true,
        distributor: true,
      },
      orderBy: { paymentDate: "desc" },
    }),
    prisma.supplierPayment.findMany({
      where: supplierPaymentWhere,
      include: {
        supplier: true,
      },
      orderBy: { paymentDate: "desc" },
    }),
    prisma.customerPayment.aggregate({
      where: {
        status: "CONFIRMED",
        paymentDate: { gte: todayStart, lte: todayEnd },
        ...(distributorId && distributorId !== "ALL" ? { distributorId } : {}),
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.customerPayment.aggregate({
      where: {
        status: "CONFIRMED",
        paymentDate: { gte: monthStart, lte: monthEnd },
        ...(distributorId && distributorId !== "ALL" ? { distributorId } : {}),
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.distributor.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, employeeCode: true, assignedTerritory: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalCollected = customerPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalDisbursed = supplierPayments.reduce((s, p) => s + Number(p.amount), 0);

  // Collector / Salesman breakdown
  const collectorMap = new Map<string, { name: string; territory: string; count: number; total: number }>();
  customerPayments.forEach((p) => {
    const colId = p.distributorId || "direct";
    const colName = p.distributor?.name || "Direct Cashier / Office Counter";
    const territory = p.distributor?.assignedTerritory || "General";
    const existing = collectorMap.get(colId) || { name: colName, territory, count: 0, total: 0 };
    existing.count += 1;
    existing.total += Number(p.amount);
    collectorMap.set(colId, existing);
  });

  const collectorBreakdown = Array.from(collectorMap.entries()).map(([id, val]) => ({
    id,
    name: val.name,
    territory: val.territory,
    receiptsCount: val.count,
    totalCollected: Math.round(val.total),
  })).sort((a, b) => b.totalCollected - a.totalCollected);

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    preset,
    totalCollected,
    totalDisbursed,
    netCashFlow: totalCollected - totalDisbursed,
    collectedToday: Number(todayCollectionsAgg._sum.amount || 0),
    receiptsTodayCount: todayCollectionsAgg._count.id,
    collectedThisMonth: Number(monthCollectionsAgg._sum.amount || 0),
    receiptsThisMonthCount: monthCollectionsAgg._count.id,
    collectorBreakdown,
    availableDistributors: distributors.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.employeeCode || "",
      territory: d.assignedTerritory || "",
    })),
    customerPayments: customerPayments.map((p) => ({
      id: p.id,
      receiptNumber: p.receiptNumber,
      customerId: p.customerId,
      customerName: p.customer.pharmacyName,
      distributorId: p.distributorId,
      collectorName: p.distributor?.name || "Direct Cashier",
      paymentDate: p.paymentDate.toISOString().split("T")[0],
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      referenceNumber: p.referenceNumber,
    })),
    supplierPayments: supplierPayments.map((p) => ({
      id: p.id,
      voucherNumber: p.voucherNumber,
      supplierName: p.supplier.name,
      paymentDate: p.paymentDate.toISOString().split("T")[0],
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      referenceNumber: p.referenceNumber,
    })),
  };
}
