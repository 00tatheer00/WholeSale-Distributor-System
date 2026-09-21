"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  ReceiptText,
  RefreshCw,
  ArrowLeftRight,
  Store,
  Pill,
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

      {/* Staff Operational Quick Action Deck */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          href="/sales/new"
          className="group flex flex-col p-3.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-border/80 shadow-sm hover:shadow-md transition-all hover:border-[#0071E3]/50 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071E3] flex items-center justify-center group-hover:bg-[#0071E3] group-hover:text-white transition-all shadow-sm">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Sales</span>
          </div>
          <span className="text-xs font-bold text-foreground group-hover:text-[#0071E3] transition-colors">+ Book Sale Order</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">FEFO queue & invoice</span>
        </Link>

        <Link
          href="/purchases/new"
          className="group flex flex-col p-3.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-border/80 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/50 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
              <ReceiptText className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Intake</span>
          </div>
          <span className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">+ Purchase Intake</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Batch shelf-life & stock</span>
        </Link>

        <Link
          href="/inventory/transfers"
          className="group flex flex-col p-3.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-border/80 shadow-sm hover:shadow-md transition-all hover:border-teal-500/50 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Transfer</span>
          </div>
          <span className="text-xs font-bold text-foreground group-hover:text-teal-600 transition-colors">+ Transfer Stock</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Inter-warehouse moves</span>
        </Link>

        <Link
          href="/customers"
          className="group flex flex-col p-3.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-border/80 shadow-sm hover:shadow-md transition-all hover:border-amber-500/50 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
              <Store className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">AR Dues</span>
          </div>
          <span className="text-xs font-bold text-foreground group-hover:text-amber-600 transition-colors">Customer Dues (AR)</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Pharmacies & recovery</span>
        </Link>

        <Link
          href="/medicines"
          className="group flex flex-col p-3.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-border/80 shadow-sm hover:shadow-md transition-all hover:border-purple-500/50 hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
              <Pill className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Catalog</span>
          </div>
          <span className="text-xs font-bold text-foreground group-hover:text-purple-600 transition-colors">Medicine Master</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Drug catalog & prices</span>
        </Link>
      </div>

      {/* 1. Core KPIs & Operational Status Badges */}
      <DashboardKpiGrid kpis={data.kpis} />

      {/* 2. Key Performance Trends & Top Fast-Moving Medicines */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalesTrendChart data={data.salesTrend} />
        <TopSellingMedicines data={data.topSellingMedicines} />
      </div>

      {/* 3. Recent Real-Time Wholesale Ledgers (Sales & Purchases) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentSalesTable data={data.recentSales} />
        <RecentPurchasesTable data={data.recentPurchases} />
      </div>

      {/* 4. Priority Operational Action Alerts */}
      <AlertsCard alerts={data.alerts} />
    </div>
  );
}
