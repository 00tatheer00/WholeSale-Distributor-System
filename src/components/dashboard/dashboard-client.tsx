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
        badge={<Badge variant="outline">Enterprise Edition</Badge>}
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
              className="h-9 w-9"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <Button size="sm" variant="outline" asChild className="h-9 text-xs gap-1.5 hidden sm:flex">
              <Link href="/purchases">
                <ReceiptText className="h-3.5 w-3.5" />
                New GRN Intake
              </Link>
            </Button>

            <Button size="sm" asChild className="h-9 text-xs gap-1.5">
              <Link href="/sales">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Book Wholesale Order
              </Link>
            </Button>
          </div>
        }
      />

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
