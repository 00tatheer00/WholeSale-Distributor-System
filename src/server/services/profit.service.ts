import { prisma } from "@/lib/prisma";
import {
  ProfitOverviewData,
  MedicineProfitItem,
  DistributorProfitItem,
} from "@/types/models";

/**
 * Resolves Date Range for Profit Intelligence
 */
export function resolveProfitDateRange(
  preset: string = "this_month",
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
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "this_month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "last_month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case "custom":
      if (customStart && customEnd) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
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
 * Fetch Complete Profit & Financial Intelligence Breakdown
 */
export async function getProfitOverview(
  preset: string = "this_month",
  customStart?: string,
  customEnd?: string
): Promise<ProfitOverviewData> {
  const { startDate, endDate, startDateStr, endDateStr } = resolveProfitDateRange(
    preset,
    customStart,
    customEnd
  );

  try {
    const [sales, businessExpenses, distributorExpenses, allMedicines, allDistributors] =
      await Promise.all([
        // 1. Confirmed Sales within period
        prisma.sale.findMany({
          where: {
            status: "CONFIRMED",
            saleDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            distributor: true,
            saleItems: {
              include: {
                medicine: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
          orderBy: { saleDate: "asc" },
        }),

        // 2. Business Operating Expenses
        prisma.businessExpense.findMany({
          where: {
            status: "APPROVED",
            expenseDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            category: true,
          },
        }),

        // 3. Distributor Expenses
        prisma.distributorExpense.findMany({
          where: {
            status: { in: ["APPROVED", "PENDING"] },
            expenseDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            distributor: true,
          },
        }),

        // 4. All Medicines (for lookup)
        prisma.medicine.findMany({
          include: { category: true },
        }),

        // 5. All Distributors
        prisma.distributor.findMany({
          include: {
            customerPayments: {
              where: {
                paymentDate: { gte: startDate, lte: endDate },
                status: "CONFIRMED",
              },
            },
          },
        }),
      ]);

    // Financial Aggregations
    let salesRevenue = 0;
    let historicalCogs = 0;

    sales.forEach((s) => {
      salesRevenue += Number(s.grandTotal);
      historicalCogs += Number(s.totalCogs);
    });

    const grossProfit = salesRevenue - historicalCogs;
    const grossMarginPercent = salesRevenue > 0 ? (grossProfit / salesRevenue) * 100 : 0;

    const operatingExpenses = businessExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const distExpensesTotal = distributorExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalExpenses = operatingExpenses + distExpensesTotal;

    const netProfit = grossProfit - totalExpenses;
    const netMarginPercent = salesRevenue > 0 ? (netProfit / salesRevenue) * 100 : 0;

    // Daily Trends Aggregation
    const trendMap = new Map<
      string,
      { revenue: number; cogs: number; grossProfit: number; expenses: number; netProfit: number }
    >();

    // Seed empty dates in range
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dateKey = cur.toISOString().split("T")[0];
      trendMap.set(dateKey, { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 });
      cur.setDate(cur.getDate() + 1);
    }

    sales.forEach((s) => {
      const dateKey = s.saleDate.toISOString().split("T")[0];
      const entry = trendMap.get(dateKey) || { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 };
      const rev = Number(s.grandTotal);
      const cogs = Number(s.totalCogs);
      entry.revenue += rev;
      entry.cogs += cogs;
      entry.grossProfit += rev - cogs;
      trendMap.set(dateKey, entry);
    });

    businessExpenses.forEach((e) => {
      const dateKey = e.expenseDate.toISOString().split("T")[0];
      const entry = trendMap.get(dateKey) || { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 };
      entry.expenses += Number(e.amount);
      trendMap.set(dateKey, entry);
    });

    distributorExpenses.forEach((e) => {
      const dateKey = e.expenseDate.toISOString().split("T")[0];
      const entry = trendMap.get(dateKey) || { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 };
      entry.expenses += Number(e.amount);
      trendMap.set(dateKey, entry);
    });

    const dailyTrends = Array.from(trendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, val]) => ({
        date: date.slice(5), // MM-DD
        revenue: Math.round(val.revenue),
        cogs: Math.round(val.cogs),
        grossProfit: Math.round(val.grossProfit),
        expenses: Math.round(val.expenses),
        netProfit: Math.round(val.grossProfit - val.expenses),
      }));

    // Medicine-wise Profit Breakdown
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

    const medicineBreakdown: MedicineProfitItem[] = Array.from(medMap.entries())
      .map(([medicineId, data]) => {
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
      })
      .sort((a, b) => b.grossProfit - a.grossProfit);

    // Distributor-wise Profit Contribution
    const distMap = new Map<
      string,
      {
        name: string;
        territory: string;
        revenue: number;
        cogs: number;
        collections: number;
        expenses: number;
      }
    >();

    allDistributors.forEach((d) => {
      const collections = d.customerPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      distMap.set(d.id, {
        name: d.name,
        territory: d.assignedTerritory || "General Route",
        revenue: 0,
        cogs: 0,
        collections,
        expenses: 0,
      });
    });

    sales.forEach((s) => {
      if (s.distributorId) {
        const entry = distMap.get(s.distributorId);
        if (entry) {
          entry.revenue += Number(s.grandTotal);
          entry.cogs += Number(s.totalCogs);
        }
      }
    });

    distributorExpenses.forEach((e) => {
      const entry = distMap.get(e.distributorId);
      if (entry) {
        entry.expenses += Number(e.amount);
      }
    });

    const distributorBreakdown: DistributorProfitItem[] = Array.from(distMap.entries())
      .map(([distributorId, data]) => {
        const grossContrib = data.revenue - data.cogs;
        const netContrib = grossContrib - data.expenses;
        return {
          distributorId,
          name: data.name,
          territory: data.territory,
          salesRevenue: Math.round(data.revenue),
          collectionsAmount: Math.round(data.collections),
          historicalCogs: Math.round(data.cogs),
          grossProfitContribution: Math.round(grossContrib),
          distributorExpenses: Math.round(data.expenses),
          netContribution: Math.round(netContrib),
          marginPercent: data.revenue > 0 ? (grossContrib / data.revenue) * 100 : 0,
        };
      })
      .sort((a, b) => b.netContribution - a.netContribution);

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      preset,
      salesRevenue: Math.round(salesRevenue),
      historicalCogs: Math.round(historicalCogs),
      grossProfit: Math.round(grossProfit),
      grossMarginPercent,
      operatingExpenses: Math.round(operatingExpenses),
      distributorExpenses: Math.round(distExpensesTotal),
      totalExpenses: Math.round(totalExpenses),
      netProfit: Math.round(netProfit),
      netMarginPercent,
      totalSalesCount: sales.length,
      dailyTrends,
      medicineBreakdown,
      distributorBreakdown,
    };
  } catch (error) {
    console.error("Error in getProfitOverview service:", error);
    return {
      startDate: startDateStr,
      endDate: endDateStr,
      preset,
      salesRevenue: 0,
      historicalCogs: 0,
      grossProfit: 0,
      grossMarginPercent: 0,
      operatingExpenses: 0,
      distributorExpenses: 0,
      totalExpenses: 0,
      netProfit: 0,
      netMarginPercent: 0,
      totalSalesCount: 0,
      dailyTrends: [],
      medicineBreakdown: [],
      distributorBreakdown: [],
    };
  }
}
