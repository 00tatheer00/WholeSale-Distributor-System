"use server";

import { ActionResult } from "./medicine.actions";
import { FinancialSummary, MonthlyTrendData, AgingBucket } from "@/types/models";

export async function getReportsSummaryAction(): Promise<ActionResult<{
  financials: FinancialSummary;
  monthlyTrends: MonthlyTrendData[];
  dueAging: AgingBucket[];
}>> {
  try {
    const defaultFinancials: FinancialSummary = {
      grossRevenue: 1285000,
      tradeDiscounts: 45000,
      netRevenue: 1240000,
      cogsTotal: 1042000,
      grossProfit: 198000,
      grossProfitMargin: 15.96,
      operatingExpenses: 48700,
      netProfit: 149300,
      netProfitMargin: 12.04,
      totalCustomerReceivables: 549000,
      overdueReceivables: 142000,
      totalSupplierPayables: 262000,
      stockInventoryValuation: 2850000,
    };

    const defaultTrends: MonthlyTrendData[] = [
      { month: "Apr 2026", revenue: 980000, cogs: 820000, grossProfit: 160000, expenses: 42000, netProfit: 118000 },
      { month: "May 2026", revenue: 1050000, cogs: 880000, grossProfit: 170000, expenses: 44000, netProfit: 126000 },
      { month: "Jun 2026", revenue: 1120000, cogs: 940000, grossProfit: 180000, expenses: 46000, netProfit: 134000 },
      { month: "Jul 2026", revenue: 1190000, cogs: 1000000, grossProfit: 190000, expenses: 47500, netProfit: 142500 },
      { month: "Aug 2026 (MTD)", revenue: 1240000, cogs: 1042000, grossProfit: 198000, expenses: 48700, netProfit: 149300 },
    ];

    const defaultAging: AgingBucket[] = [
      { customerName: "Popular Model Pharmacy", current: 68500, days31To60: 0, days61To90: 0, daysOver90: 0, totalDue: 68500, status: "ACTIVE" },
      { customerName: "Labaid Hospital Dispensary", current: 240000, days31To60: 80000, days61To90: 0, daysOver90: 0, totalDue: 320000, status: "ACTIVE" },
      { customerName: "Evergreen Drug Corner", current: 0, days31To60: 42000, days61To90: 65000, daysOver90: 35000, totalDue: 142000, status: "BLOCKED_OVERDUE" },
      { customerName: "MediCare Clinic & Diagnostics", current: 18500, days31To60: 0, days61To90: 0, daysOver90: 0, totalDue: 18500, status: "ACTIVE" },
    ];

    return {
      success: true,
      data: {
        financials: defaultFinancials,
        monthlyTrends: defaultTrends,
        dueAging: defaultAging,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to generate financial reports" };
  }
}
