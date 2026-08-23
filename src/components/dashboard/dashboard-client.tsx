"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardDateFilter } from "./dashboard-date-filter";
import { DashboardKpiGrid } from "./dashboard-kpi-grid";
import { SalesSummaryCard } from "./sales-summary-card";
import { PurchaseSummaryCard } from "./purchase-summary-card";
import { ProfitSummaryCard } from "./profit-summary-card";
import { InventorySummaryCard } from "./inventory-summary-card";
import { SalesTrendChart } from "./sales-trend-chart";
import { PurchaseTrendChart } from "./purchase-trend-chart";
import { TopSellingMedicines } from "./top-selling-medicines";
import { RecentSalesTable } from "./recent-sales-table";
import { RecentPurchasesTable } from "./recent-purchases-table";
import { DueSummaryCard } from "./due-summary-card";
import { AlertsCard } from "./alerts-card";
import { FullDashboardData, DateRangePreset } from "@/types/dashboard";
import { getDashboardDataAction } from "@/server/actions/dashboard.actions";

interface DashboardClientProps {
  initialData: FullDashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = React.useState<FullDashboardData>(initialData);
  const [currentPreset, setCurrentPreset] = React.useState<DateRangePreset>(initialData.period);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFilterChange = async (
    preset: DateRangePreset,
    customStart?: string,
    customEnd?: string
  ) => {
    setCurrentPreset(preset);
    setIsLoading(true);

    try {
      const res = await getDashboardDataAction(preset, customStart, customEnd);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to reload dashboard metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = () => {
    handleFilterChange(currentPreset, data.startDate, data.endDate);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Cockpit Navigation */}
      <PageHeader
        title="Wholesale Distribution Cockpit"
        description="Real-time pharmaceutical wholesale distribution command center, inventory FEFO queues, and financial health."
        badge={<Badge variant="outline" className="rounded-full px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5">Enterprise Live</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DashboardDateFilter
              currentPreset={currentPreset}
              startDate={data.startDate}
              endDate={data.endDate}
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />

            <Button
              variant="outline"
              size="icon"
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="h-9 w-9 rounded-xl border-border"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        }
      />

      {/* Apple Direct Quick Action Deck (Mobile Responsive) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/sales"
          className="group flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-border/80 shadow-sm hover:shadow-md transition-all hover:border-[#0071E3]/50 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071E3] flex items-center justify-center group-hover:bg-[#0071E3] group-hover:text-white transition-all shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Sales</span>
          </div>
          <span className="text-sm font-bold text-foreground group-hover:text-[#0071E3] transition-colors">Book Wholesale Order</span>
          <span className="text-xs text-muted-foreground mt-0.5">Create invoice & dispatch</span>
        </Link>

        <Link
          href="/purchases/new"
          className="group flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-border/80 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/50 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
              <ReceiptText className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Intake</span>
          </div>
          <span className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">Direct Purchase Intake</span>
          <span className="text-xs text-muted-foreground mt-0.5">Batch creation & stock-in</span>
        </Link>

        <Link
          href="/medicines"
          className="group flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-border/80 shadow-sm hover:shadow-md transition-all hover:border-purple-500/50 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
              <RefreshCw className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Catalog</span>
          </div>
          <span className="text-sm font-bold text-foreground group-hover:text-purple-600 transition-colors">Medicine & Batch Stock</span>
          <span className="text-xs text-muted-foreground mt-0.5">FEFO queue & trade pricing</span>
        </Link>

        <Link
          href="/suppliers"
          className="group flex flex-col p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-border/80 shadow-sm hover:shadow-md transition-all hover:border-amber-500/50 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
              <RefreshCw className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Vendors</span>
          </div>
          <span className="text-sm font-bold text-foreground group-hover:text-amber-600 transition-colors">Supplier AP Ledger</span>
          <span className="text-xs text-muted-foreground mt-0.5">Payables & settlement</span>
        </Link>
      </div>

      {/* 1. Core KPIs & Operational Meters */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* 2. Summaries Row: Sales Summary & Purchase Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalesSummaryCard data={data.salesSummary} />
        <PurchaseSummaryCard data={data.purchaseSummary} />
      </div>

      {/* 3. Financial Statements & Inventory Valuation Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ProfitSummaryCard data={data.profitSummary} />
        <InventorySummaryCard data={data.inventorySummary} />
      </div>

      {/* 4. Trends Visualizer Row: Sales Trend & Purchase Trend */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalesTrendChart data={data.salesTrend} />
        <PurchaseTrendChart data={data.purchaseTrend} />
      </div>

      {/* 5. Due Balances & Top Selling Medicines */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DueSummaryCard data={data.dueSummary} />
        <TopSellingMedicines data={data.topSellingMedicines} />
      </div>

      {/* 6. Recent Transaction Ledgers: Sales & Purchases */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentSalesTable data={data.recentSales} />
        <RecentPurchasesTable data={data.recentPurchases} />
      </div>

      {/* 7. Actionable Priority Operational Alerts */}
      <AlertsCard alerts={data.alerts} />
    </div>
  );
}
