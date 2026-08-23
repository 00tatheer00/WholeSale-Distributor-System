"use client";

import * as React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Award,
  Boxes,
  CreditCard,
  Truck,
  Pill,
  AlertTriangle,
  AlertOctagon,
  Clock,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DashboardKpiData } from "@/types/dashboard";

interface DashboardKpiGridProps {
  kpis: DashboardKpiData;
}

export function DashboardKpiGrid({ kpis }: DashboardKpiGridProps) {
  return (
    <div className="space-y-4">
      {/* 8 Primary Financial & Operational Metrics with Lightweight Colorful Themes */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Today's Sales - Sky Blue */}
        <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/90 dark:border-sky-800/50 shadow-sm transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              Today&apos;s Sales
            </span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-sky-950 dark:text-sky-100">
            {formatCurrency(kpis.todaySales)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-300/80">
            <span className="font-semibold">B2B Invoiced</span>
            <span>• Net billed</span>
          </div>
        </div>

        {/* 2. Today's Purchases - Mint Emerald */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/50 shadow-sm transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Today&apos;s Purchases
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-100">
            {formatCurrency(kpis.todayPurchases)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300/80">
            <span className="font-semibold">GRN Consignments</span>
            <span>• Stock intake</span>
          </div>
        </div>

        {/* 3. Today's Gross Profit - Royal Indigo */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/90 dark:border-indigo-800/50 shadow-sm transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              Today&apos;s Gross Profit
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-indigo-950 dark:text-indigo-100">
            {formatCurrency(kpis.todayGrossProfit)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300/80">
            <span>Sales Revenue − COGS</span>
          </div>
        </div>

        {/* 4. Today's Net Profit - Fuchsia Purple */}
        <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/90 dark:border-purple-800/50 shadow-sm transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
              Today&apos;s Net Profit
            </span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-purple-950 dark:text-purple-100">
            {formatCurrency(kpis.todayNetProfit)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300/80">
            <span>After Logistics & Overheads</span>
          </div>
        </div>

        {/* 5. Total Inventory Value - Teal Cyan */}
        <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/90 dark:border-teal-800/50 shadow-sm transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Total Inventory Value
            </span>
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-300">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-teal-950 dark:text-teal-100">
            {formatCurrency(kpis.totalInventoryValue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-300/80">
            <Link href="/inventory" className="hover:underline flex items-center gap-0.5 font-semibold">
              Batch stock valuation <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 6. Customer Outstanding Dues - Warm Amber */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/50 shadow-sm transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Customer Dues (AR)
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-amber-950 dark:text-amber-100">
            {formatCurrency(kpis.customerOutstandingDues)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300/80">
            <Link href="/customers" className="hover:underline flex items-center gap-0.5 font-semibold">
              Receivables Recovery <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 7. Supplier Outstanding Dues - Coral Rose */}
        <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/90 dark:border-rose-800/50 shadow-sm transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Supplier Dues (AP)
            </span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-rose-950 dark:text-rose-100">
            {formatCurrency(kpis.supplierOutstandingDues)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300/80">
            <Link href="/suppliers" className="hover:underline flex items-center gap-0.5 font-semibold">
              Accounts Payable <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 8. Total Active Medicines - Blue Classic */}
        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/90 dark:border-blue-800/50 shadow-sm transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Active Medicines
            </span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-300">
              <Pill className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-blue-950 dark:text-blue-100">
            {kpis.totalActiveMedicines}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300/80">
            <Link href="/medicines" className="hover:underline flex items-center gap-0.5 font-semibold">
              Drug master catalog <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Clickable Operational Status Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Low Stock */}
        <Link href="/inventory" className="block group">
          <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 group-hover:border-amber-400 transition-all shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950 dark:text-amber-100">Low Stock</div>
                <div className="text-[10px] text-amber-700 dark:text-amber-300/70">Reorder needed</div>
              </div>
            </div>
            <Badge variant="warning" className="text-xs font-black rounded-full px-2.5">
              {kpis.lowStockMedicinesCount}
            </Badge>
          </div>
        </Link>

        {/* Out of Stock */}
        <Link href="/inventory" className="block group">
          <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 group-hover:border-rose-400 transition-all shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-700 dark:text-rose-300">
                <AlertOctagon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-950 dark:text-rose-100">Out of Stock</div>
                <div className="text-[10px] text-rose-700 dark:text-rose-300/70">Zero balance</div>
              </div>
            </div>
            <Badge variant="destructive" className="text-xs font-black rounded-full px-2.5">
              {kpis.outOfStockMedicinesCount}
            </Badge>
          </div>
        </Link>

        {/* Expired Batches */}
        <Link href="/inventory" className="block group">
          <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 group-hover:border-red-400 transition-all shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-red-500/20 text-red-700 dark:text-red-300">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-red-950 dark:text-red-100">Expired Batches</div>
                <div className="text-[10px] text-red-700 dark:text-red-300/70">Quarantine FEFO</div>
              </div>
            </div>
            <Badge variant="destructive" className="text-xs font-black rounded-full px-2.5">
              {kpis.expiredBatchesCount}
            </Badge>
          </div>
        </Link>

        {/* Near Expiry Batches (<90 days) */}
        <Link href="/inventory" className="block group">
          <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60 group-hover:border-orange-400 transition-all shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-orange-500/20 text-orange-700 dark:text-orange-300">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-orange-950 dark:text-orange-100">Near Expiry (&lt;90d)</div>
                <div className="text-[10px] text-orange-700 dark:text-orange-300/70">Fast dispatch</div>
              </div>
            </div>
            <Badge variant="warning" className="text-xs font-black rounded-full px-2.5">
              {kpis.nearExpiryBatchesCount}
            </Badge>
          </div>
        </Link>
      </div>
    </div>
  );
}
