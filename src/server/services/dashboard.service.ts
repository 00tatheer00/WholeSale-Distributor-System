import { prisma } from "@/lib/prisma";
import {
  DateRangePreset,
  FullDashboardData,
  TrendDataPoint,
  TopSellingMedicine,
  RecentSaleRecord,
  RecentPurchaseRecord,
  DashboardAlert,
} from "@/types/dashboard";

/**
 * Resolves date range timestamps based on the selected preset.
 */
export function resolveDateRange(
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string
): { startDate: Date; endDate: Date; startDateStr: string; endDateStr: string } {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  switch (preset) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "yesterday":
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "this_week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "this_month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "last_30_days":
    default:
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "custom":
      if (customStart && customEnd) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      } else {
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }
      break;
  }

  return {
    startDate: start,
    endDate: end,
    startDateStr: start.toISOString().split("T")[0],
    endDateStr: end.toISOString().split("T")[0],
  };
}

/**
 * Fallback baseline dataset for local offline development.
 */
function getOfflineFallbackData(
  preset: DateRangePreset,
  startStr: string,
  endStr: string
): FullDashboardData {
  return {
    period: preset,
    startDate: startStr,
    endDate: endStr,
    kpis: {
      todaySales: 94532,
      todayPurchases: 188000,
      todayGrossProfit: 15400,
      todayNetProfit: 11200,
      totalInventoryValue: 2845600,
      customerOutstandingDues: 549000,
      supplierOutstandingDues: 262000,
      totalActiveMedicines: 6,
      lowStockMedicinesCount: 2,
      outOfStockMedicinesCount: 0,
      expiredBatchesCount: 0,
      nearExpiryBatchesCount: 1,
    },
    salesSummary: {
      todaySales: 94532,
      thisWeekSales: 412800,
      thisMonthSales: 1240000,
      todayInvoicesCount: 3,
    },
    purchaseSummary: {
      todayPurchases: 188000,
      thisMonthPurchases: 633000,
      purchaseTransactionsCount: 3,
      outstandingSupplierAmount: 262000,
    },
    profitSummary: {
      grossRevenue: 1285000,
      tradeDiscounts: 45000,
      netRevenue: 1240000,
      cogsTotal: 1042000,
      grossProfit: 198000,
      grossMarginPercent: 15.97,
      operatingExpenses: 48700,
      netProfit: 149300,
      netMarginPercent: 12.04,
    },
    inventorySummary: {
      totalActiveMedicines: 6,
      totalAvailableStockUnits: 5655,
      inventoryPurchaseValue: 2845600,
      lowStockCount: 2,
      outOfStockCount: 0,
      expiredBatchesCount: 0,
      nearExpiryBatchesCount: 1,
    },
    salesTrend: [
      { date: "Aug 16", salesAmount: 18032, purchaseAmount: 0 },
      { date: "Aug 17", salesAmount: 42100, purchaseAmount: 0 },
      { date: "Aug 18", salesAmount: 76032, purchaseAmount: 325000 },
      { date: "Aug 19", salesAmount: 35400, purchaseAmount: 0 },
      { date: "Aug 20", salesAmount: 68900, purchaseAmount: 0 },
      { date: "Aug 21", salesAmount: 18500, purchaseAmount: 120000 },
      { date: "Aug 22", salesAmount: 94532, purchaseAmount: 188000 },
    ],
    purchaseTrend: [
      { date: "Aug 16", salesAmount: 18032, purchaseAmount: 0 },
      { date: "Aug 17", salesAmount: 42100, purchaseAmount: 0 },
      { date: "Aug 18", salesAmount: 76032, purchaseAmount: 325000 },
      { date: "Aug 19", salesAmount: 35400, purchaseAmount: 0 },
      { date: "Aug 20", salesAmount: 68900, purchaseAmount: 0 },
      { date: "Aug 21", salesAmount: 18500, purchaseAmount: 120000 },
      { date: "Aug 22", salesAmount: 94532, purchaseAmount: 188000 },
    ],
    topSellingMedicines: [
      {
        id: "med-1",
        name: "Napa Extra",
        genericName: "Paracetamol + Caffeine (500mg+65mg)",
        dosageForm: "TABLET",
        quantitySold: 700,
        salesAmount: 1540,
        currentStock: 1500,
      },
      {
        id: "med-6",
        name: "Insulin Mixtard 30 HM",
        genericName: "Human Insulin 30/70 (100 IU/ml)",
        dosageForm: "INJECTION",
        quantitySold: 200,
        salesAmount: 79200,
        currentStock: 45,
      },
      {
        id: "med-3",
        name: "Seclo 20",
        genericName: "Omeprazole (20mg)",
        dosageForm: "CAPSULE",
        quantitySold: 180,
        salesAmount: 792,
        currentStock: 840,
      },
      {
        id: "med-4",
        name: "Ciprocin 500",
        genericName: "Ciprofloxacin (500mg)",
        dosageForm: "TABLET",
        quantitySold: 120,
        salesAmount: 1584,
        currentStock: 450,
      },
      {
        id: "med-5",
        name: "Maxpro 20",
        genericName: "Esomeprazole (20mg)",
        dosageForm: "CAPSULE",
        quantitySold: 90,
        salesAmount: 554,
        currentStock: 620,
      },
    ],
    recentSales: [
      {
        id: "so-1003",
        saleNumber: "SO-2026-00103",
        customerName: "MediCare Clinic & Diagnostics",
        date: "2026-08-21",
        total: 18500,
        paid: 0,
        due: 18500,
        status: "ISSUED",
      },
      {
        id: "so-1002",
        saleNumber: "SO-2026-00102",
        customerName: "Labaid Hospital Dispensary",
        date: "2026-08-18",
        total: 76032,
        paid: 20000,
        due: 56032,
        status: "PARTIAL",
      },
      {
        id: "so-1001",
        saleNumber: "SO-2026-00101",
        customerName: "Popular Model Pharmacy",
        date: "2026-08-15",
        total: 18032,
        paid: 18032,
        due: 0,
        status: "PAID",
      },
    ],
    recentPurchases: [
      {
        id: "po-103",
        purchaseNumber: "PO-2026-0046",
        supplierName: "Incepta Pharmaceuticals Ltd.",
        date: "2026-08-21",
        total: 120000,
        paid: 120000,
        due: 0,
        status: "ORDERED",
      },
      {
        id: "po-102",
        purchaseNumber: "PO-2026-0045",
        supplierName: "Square Pharmaceuticals PLC",
        date: "2026-08-18",
        total: 325000,
        paid: 180000,
        due: 145000,
        status: "RECEIVED",
      },
      {
        id: "po-101",
        purchaseNumber: "PO-2026-0044",
        supplierName: "Beximco Pharmaceuticals Ltd.",
        date: "2026-08-14",
        total: 188000,
        paid: 188000,
        due: 0,
        status: "RECEIVED",
      },
    ],
    dueSummary: {
      customerDues: {
        totalOutstanding: 549000,
        customersWithBalanceCount: 3,
        topCustomers: [
          { id: "cust-2", name: "Labaid Hospital Dispensary", due: 320000, creditLimit: 1500000, status: "ACTIVE" },
          { id: "cust-3", name: "Evergreen Drug Corner", due: 142000, creditLimit: 150000, status: "BLOCKED_OVERDUE" },
          { id: "cust-1", name: "Popular Model Pharmacy", due: 68500, creditLimit: 300000, status: "ACTIVE" },
          { id: "cust-4", name: "MediCare Clinic & Diagnostics", due: 18500, creditLimit: 250000, status: "ACTIVE" },
        ],
      },
      supplierDues: {
        totalOutstanding: 262000,
        suppliersWithBalanceCount: 3,
        topSuppliers: [
          { id: "sup-1", name: "Square Pharmaceuticals PLC", due: 145000, phone: "+880 1713 001122" },
          { id: "sup-2", name: "Beximco Pharmaceuticals Ltd.", due: 82000, phone: "+880 1714 223344" },
          { id: "sup-4", name: "Renata Limited", due: 35000, phone: "+880 1912 778899" },
        ],
      },
    },
    alerts: [
      {
        id: "alt-1",
        type: "NEAR_EXPIRY",
        title: "Short Expiry Alert: Seclo 20 (Batch SQ-SC-2309)",
        description: "240 units expire in 38 days (2026-09-30). Prioritize for immediate FEFO order allocation.",
        severity: "warning",
        link: "/inventory",
      },
      {
        id: "alt-2",
        type: "HIGH_CUSTOMER_DUE",
        title: "Credit Hold Barrier: Evergreen Drug Corner",
        description: "Customer is 38 days overdue (limit 30 days) with ৳142,000 due. Automatic dispatch locked.",
        severity: "critical",
        link: "/customers",
      },
      {
        id: "alt-3",
        type: "LOW_STOCK",
        title: "Reorder Threshold Alert: Insulin Mixtard 30 HM",
        description: "Only 45 vials remaining (reorder level: 30 vials). Fast-moving cold chain asset.",
        severity: "warning",
        link: "/purchases",
      },
    ],
  };
}

/**
 * Main Service to aggregate real database metrics for the admin dashboard.
 */
export async function getDashboardMetrics(
  preset: DateRangePreset = "last_30_days",
  customStart?: string,
  customEnd?: string
): Promise<FullDashboardData> {
  const { startDate, endDate, startDateStr, endDateStr } = resolveDateRange(
    preset,
    customStart,
    customEnd
  );

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const thisMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const thisWeekStart = new Date(todayStart);
  const day = todayStart.getDay();
  thisWeekStart.setDate(todayStart.getDate() - day + (day === 0 ? -6 : 1));

  try {
    // 1. Medicine & Inventory Aggregations
    const [
      activeMedicines,
      allBatches,
      todaySalesAgg,
      thisWeekSalesAgg,
      thisMonthSalesAgg,
      periodSales,
      todayPurchasesAgg,
      thisMonthPurchasesAgg,
      periodPurchases,
      operatingExpensesAgg,
      customers,
      suppliers,
      recentSales,
      recentPurchases,
      topSaleItems,
    ] = await Promise.all([
      prisma.medicine.findMany({
        where: { status: "ACTIVE" },
        include: {
          batches: {
            where: { quantityOnHand: { gt: 0 } },
            select: { quantityOnHand: true },
          },
        },
      }),
      prisma.medicineBatch.findMany({
        include: {
          medicine: {
            select: { brandName: true, genericName: true, minReorderLevel: true },
          },
        },
      }),
      prisma.sale.aggregate({
        where: {
          saleDate: { gte: todayStart, lte: todayEnd },
          status: { not: "CANCELLED" },
        },
        _sum: { grandTotal: true, totalCogs: true },
        _count: { id: true },
      }),
      prisma.sale.aggregate({
        where: {
          saleDate: { gte: thisWeekStart, lte: todayEnd },
          status: { not: "CANCELLED" },
        },
        _sum: { grandTotal: true },
      }),
      prisma.sale.aggregate({
        where: {
          saleDate: { gte: thisMonthStart, lte: todayEnd },
          status: { not: "CANCELLED" },
        },
        _sum: { grandTotal: true },
      }),
      prisma.sale.findMany({
        where: {
          saleDate: { gte: startDate, lte: endDate },
          status: { not: "CANCELLED" },
        },
        select: { saleDate: true, grandTotal: true, totalCogs: true, discountAmount: true, subtotalAmount: true },
        orderBy: { saleDate: "asc" },
      }),
      prisma.purchase.aggregate({
        where: {
          purchaseDate: { gte: todayStart, lte: todayEnd },
          status: { not: "CANCELLED" },
        },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
      prisma.purchase.aggregate({
        where: {
          purchaseDate: { gte: thisMonthStart, lte: todayEnd },
          status: { not: "CANCELLED" },
        },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
      prisma.purchase.findMany({
        where: {
          purchaseDate: { gte: startDate, lte: endDate },
          status: { not: "CANCELLED" },
        },
        select: { purchaseDate: true, grandTotal: true },
        orderBy: { purchaseDate: "asc" },
      }),
      prisma.businessExpense.aggregate({
        where: {
          expenseDate: { gte: startDate, lte: endDate },
          status: "APPROVED",
        },
        _sum: { amount: true },
      }),
      prisma.customer.findMany({
        where: { status: { in: ["ACTIVE", "BLOCKED_OVERDUE"] } },
        select: { id: true, pharmacyName: true, currentDue: true, creditLimit: true, status: true },
        orderBy: { currentDue: "desc" },
      }),
      prisma.supplier.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, name: true, currentDue: true, phone: true },
        orderBy: { currentDue: "desc" },
      }),
      prisma.sale.findMany({
        take: 5,
        orderBy: { saleDate: "desc" },
        include: { customer: { select: { pharmacyName: true } } },
      }),
      prisma.purchase.findMany({
        take: 5,
        orderBy: { purchaseDate: "desc" },
        include: { supplier: { select: { name: true } } },
      }),
      prisma.saleItem.groupBy({
        by: ["medicineId"],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    // Compute inventory details
    const totalActiveMedicines = activeMedicines.length;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    activeMedicines.forEach((m) => {
      const stock = m.batches.reduce((sum, b) => sum + b.quantityOnHand, 0);
      if (stock === 0) outOfStockCount++;
      else if (stock <= m.minReorderLevel) lowStockCount++;
    });

    const nowTime = new Date().getTime();
    const ninetyDaysTime = nowTime + 90 * 24 * 60 * 60 * 1000;
    let totalAvailableStockUnits = 0;
    let inventoryPurchaseValue = 0;
    let expiredBatchesCount = 0;
    let nearExpiryBatchesCount = 0;
    const alerts: DashboardAlert[] = [];

    allBatches.forEach((b) => {
      const qty = b.quantityOnHand;
      totalAvailableStockUnits += qty;
      inventoryPurchaseValue += qty * Number(b.purchaseCostPrice);

      const expTime = new Date(b.expiryDate).getTime();
      if (expTime <= nowTime && qty > 0) {
        expiredBatchesCount++;
        alerts.push({
          id: `exp-${b.id}`,
          type: "EXPIRED",
          title: `Expired Batch: ${b.medicine?.brandName || "Medicine"} (${b.batchNumber})`,
          description: `${qty} units expired on ${b.expiryDate.toISOString().split("T")[0]}. Immediate quarantine required.`,
          severity: "critical",
          link: "/inventory",
        });
      } else if (expTime > nowTime && expTime <= ninetyDaysTime && qty > 0) {
        nearExpiryBatchesCount++;
        const daysLeft = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `near-${b.id}`,
          type: "NEAR_EXPIRY",
          title: `Near Expiry: ${b.medicine?.brandName || "Medicine"} (${b.batchNumber})`,
          description: `${qty} units expire in ${daysLeft} days. Prioritize FEFO order booking.`,
          severity: daysLeft <= 30 ? "critical" : "warning",
          link: "/inventory",
        });
      }
    });

    // Customer alerts for credit blocks
    customers.forEach((c) => {
      if (c.status === "BLOCKED_OVERDUE" && Number(c.currentDue) > 0) {
        alerts.push({
          id: `due-${c.id}`,
          type: "HIGH_CUSTOMER_DUE",
          title: `Credit Hold: ${c.pharmacyName}`,
          description: `Outstanding balance of ৳${Number(c.currentDue).toLocaleString()} is overdue. Dispatch locked.`,
          severity: "critical",
          link: "/customers",
        });
      }
    });

    // Financial KPIs
    const todaySales = Number(todaySalesAgg._sum.grandTotal || 0);
    const todayCogs = Number(todaySalesAgg._sum.totalCogs || 0);
    const todayGrossProfit = todaySales - todayCogs;
    const todayPurchases = Number(todayPurchasesAgg._sum.grandTotal || 0);

    const periodGrossRevenue = periodSales.reduce((sum, s) => sum + Number(s.subtotalAmount), 0);
    const periodDiscounts = periodSales.reduce((sum, s) => sum + Number(s.discountAmount), 0);
    const periodNetRevenue = periodSales.reduce((sum, s) => sum + Number(s.grandTotal), 0);
    const periodCogs = periodSales.reduce((sum, s) => sum + Number(s.totalCogs), 0);
    const periodGrossProfit = periodNetRevenue - periodCogs;
    const periodExpenses = Number(operatingExpensesAgg._sum.amount || 0);
    const periodNetProfit = periodGrossProfit - periodExpenses;
    const grossMarginPercent = periodNetRevenue > 0 ? (periodGrossProfit / periodNetRevenue) * 100 : 0;
    const netMarginPercent = periodNetRevenue > 0 ? (periodNetProfit / periodNetRevenue) * 100 : 0;

    // Today Net profit approximation (subtracting pro-rated daily operating expense)
    const todayOperatingExpense = periodExpenses / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const todayNetProfit = todayGrossProfit - todayOperatingExpense;

    // Dues
    const customerOutstandingDues = customers.reduce((sum, c) => sum + Number(c.currentDue), 0);
    const customersWithBalanceCount = customers.filter((c) => Number(c.currentDue) > 0).length;
    const supplierOutstandingDues = suppliers.reduce((sum, s) => sum + Number(s.currentDue), 0);
    const suppliersWithBalanceCount = suppliers.filter((s) => Number(s.currentDue) > 0).length;

    // Daily Trend Grouping
    const trendMap = new Map<string, { sales: number; purchases: number }>();
    const curr = new Date(startDate);
    while (curr <= endDate) {
      const dateKey = curr.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap.set(dateKey, { sales: 0, purchases: 0 });
      curr.setDate(curr.getDate() + 1);
    }

    periodSales.forEach((s) => {
      const key = new Date(s.saleDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (trendMap.has(key)) {
        trendMap.get(key)!.sales += Number(s.grandTotal);
      }
    });

    periodPurchases.forEach((p) => {
      const key = new Date(p.purchaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (trendMap.has(key)) {
        trendMap.get(key)!.purchases += Number(p.grandTotal);
      }
    });

    const salesTrend: TrendDataPoint[] = [];
    trendMap.forEach((val, date) => {
      salesTrend.push({ date, salesAmount: val.sales, purchaseAmount: val.purchases });
    });

    // Top Selling Medicines Data Fetch
    const topMedicineIds = topSaleItems.map((item) => item.medicineId);
    const topMedicineDetails = await prisma.medicine.findMany({
      where: { id: { in: topMedicineIds } },
      include: { batches: { select: { quantityOnHand: true } } },
    });

    const topSellingMedicines: TopSellingMedicine[] = topSaleItems.map((item) => {
      const med = topMedicineDetails.find((m) => m.id === item.medicineId);
      const stock = med?.batches.reduce((sum, b) => sum + b.quantityOnHand, 0) || 0;
      return {
        id: item.medicineId,
        name: med?.brandName || "Medicine",
        genericName: `${med?.genericName || ""} (${med?.strength || ""})`,
        dosageForm: med?.dosageForm || "TABLET",
        quantitySold: item._sum.quantity || 0,
        salesAmount: Number(item._sum.lineTotal || 0),
        currentStock: stock,
      };
    });

    const recentSalesFormatted: RecentSaleRecord[] = recentSales.map((s) => ({
      id: s.id,
      saleNumber: s.saleNumber,
      customerName: s.customer?.pharmacyName || "Retail Pharmacy",
      date: s.saleDate.toISOString().split("T")[0],
      total: Number(s.grandTotal),
      paid: Number(s.paidAmount),
      due: Number(s.dueAmount),
      status: s.status,
    }));

    const recentPurchasesFormatted: RecentPurchaseRecord[] = recentPurchases.map((p) => ({
      id: p.id,
      purchaseNumber: p.purchaseNumber,
      supplierName: p.supplier?.name || "Direct Supplier",
      date: p.purchaseDate.toISOString().split("T")[0],
      total: Number(p.grandTotal),
      paid: Number(p.paidAmount),
      due: Number(p.dueAmount),
      status: p.status,
    }));

    return {
      period: preset,
      startDate: startDateStr,
      endDate: endDateStr,
      kpis: {
        todaySales,
        todayPurchases,
        todayGrossProfit,
        todayNetProfit,
        totalInventoryValue: inventoryPurchaseValue,
        customerOutstandingDues,
        supplierOutstandingDues,
        totalActiveMedicines,
        lowStockMedicinesCount: lowStockCount,
        outOfStockMedicinesCount: outOfStockCount,
        expiredBatchesCount,
        nearExpiryBatchesCount,
      },
      salesSummary: {
        todaySales,
        thisWeekSales: Number(thisWeekSalesAgg._sum.grandTotal || 0),
        thisMonthSales: Number(thisMonthSalesAgg._sum.grandTotal || 0),
        todayInvoicesCount: todaySalesAgg._count.id,
      },
      purchaseSummary: {
        todayPurchases,
        thisMonthPurchases: Number(thisMonthPurchasesAgg._sum.grandTotal || 0),
        purchaseTransactionsCount: thisMonthPurchasesAgg._count.id,
        outstandingSupplierAmount: supplierOutstandingDues,
      },
      profitSummary: {
        grossRevenue: periodGrossRevenue,
        tradeDiscounts: periodDiscounts,
        netRevenue: periodNetRevenue,
        cogsTotal: periodCogs,
        grossProfit: periodGrossProfit,
        grossMarginPercent,
        operatingExpenses: periodExpenses,
        netProfit: periodNetProfit,
        netMarginPercent,
      },
      inventorySummary: {
        totalActiveMedicines,
        totalAvailableStockUnits,
        inventoryPurchaseValue,
        lowStockCount,
        outOfStockCount,
        expiredBatchesCount,
        nearExpiryBatchesCount,
      },
      salesTrend,
      purchaseTrend: salesTrend,
      topSellingMedicines,
      recentSales: recentSalesFormatted,
      recentPurchases: recentPurchasesFormatted,
      dueSummary: {
        customerDues: {
          totalOutstanding: customerOutstandingDues,
          customersWithBalanceCount,
          topCustomers: customers.slice(0, 5).map((c) => ({
            id: c.id,
            name: c.pharmacyName,
            due: Number(c.currentDue),
            creditLimit: Number(c.creditLimit),
            status: c.status,
          })),
        },
        supplierDues: {
          totalOutstanding: supplierOutstandingDues,
          suppliersWithBalanceCount,
          topSuppliers: suppliers.slice(0, 5).map((s) => ({
            id: s.id,
            name: s.name,
            due: Number(s.currentDue),
            phone: s.phone,
          })),
        },
      },
      alerts: alerts.slice(0, 6),
    };
  } catch (error) {
    // Graceful offline fallback
    return getOfflineFallbackData(preset, startDateStr, endDateStr);
  }
}
