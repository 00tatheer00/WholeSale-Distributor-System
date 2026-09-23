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
  ShoppingCart,
  PackagePlus,
  Building2,
  Warehouse,
  Wallet,
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

      {/* Staff Operational Quick Action Deck (Universal Direct Add Deck) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Quick Actions • Click Any Button Below to Add / Record
          </span>
          <span className="text-[11px] text-muted-foreground">Everything is 1-click away</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. New Sale Bill */}
          <Link
            href="/sales/new"
            className="group relative flex flex-col p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-card border border-emerald-500/30 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 transition-all hover:border-emerald-500 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <Badge className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none">
                Sell
              </Badge>
            </div>
            <span className="text-xs font-extrabold text-foreground group-hover:text-emerald-600 transition-colors">
              + New Sale Bill
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Sell drugs & print instant invoice
            </span>
          </Link>

          {/* 2. Factory Purchase */}
          <Link
            href="/purchases/new"
            className="group relative flex flex-col p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-card border border-blue-500/30 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all hover:border-blue-500 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <PackagePlus className="h-5 w-5" />
              </div>
              <Badge className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-none">
                Stock In
              </Badge>
            </div>
            <span className="text-xs font-extrabold text-foreground group-hover:text-blue-600 transition-colors">
              + Add Factory Stock
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Enter batches received from factory
            </span>
          </Link>

          {/* 3. Add Customer Pharmacy */}
          <Link
            href="/customers/new"
            className="group relative flex flex-col p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-card border border-purple-500/30 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all hover:border-purple-500 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-110 transition-transform">
                <Store className="h-5 w-5" />
              </div>
              <Badge className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-none">
                Customer
              </Badge>
            </div>
            <span className="text-xs font-extrabold text-foreground group-hover:text-purple-600 transition-colors">
              + Add Pharmacy
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Register medical store or hospital
            </span>
          </Link>

          {/* 4. Add Supplier Company */}
          <Link
            href="/suppliers"
            className="group relative flex flex-col p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-card border border-amber-500/30 shadow-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all hover:border-amber-500 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20 group-hover:scale-110 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <Badge className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-none">
                Supplier
              </Badge>
            </div>
            <span className="text-xs font-extrabold text-foreground group-hover:text-amber-600 transition-colors">
              + Add Supplier
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Register factory, vendor or distributor
            </span>
          </Link>

          {/* 5. Add Storage Warehouse */}
          <Link
            href="/warehouses"
            className="group relative flex flex-col p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-card border border-teal-500/30 shadow-sm hover:shadow-lg hover:shadow-teal-500/10 transition-all hover:border-teal-500 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-110 transition-transform">
                <Warehouse className="h-5 w-5" />
              </div>
              <Badge className="text-[9px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-none">
                Godown
              </Badge>
            </div>
            <span className="text-xs font-extrabold text-foreground group-hover:text-teal-600 transition-colors">
              + Add Godown
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Add storage warehouse or room
            </span>
          </Link>

          {/* 6. Record Expense */}
          <Link
            href="/expenses"
            className="group relative flex flex-col p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-card border border-rose-500/30 shadow-sm hover:shadow-lg hover:shadow-rose-500/10 transition-all hover:border-rose-500 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 group-hover:scale-110 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
              <Badge className="text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-none">
                Expense
              </Badge>
            </div>
            <span className="text-xs font-extrabold text-foreground group-hover:text-rose-600 transition-colors">
              + Record Expense
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Rent, bills, fuel, salaries & tea
            </span>
          </Link>
        </div>
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
