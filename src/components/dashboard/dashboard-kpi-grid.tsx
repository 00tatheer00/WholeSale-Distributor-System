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
      {/* 8 Primary Financial & Operational Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Today's Sales */}
        <Card className="border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today&apos;s Sales
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-foreground">
              {formatCurrency(kpis.todaySales)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-emerald-600 font-medium">B2B Invoiced</span>
              <span>• Net billed wholesale</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Today's Purchases */}
        <Card className="border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today&apos;s Purchases
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-foreground">
              {formatCurrency(kpis.todayPurchases)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-blue-600 font-medium">GRN Consignments</span>
              <span>• Factory intake</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Today's Gross Profit */}
        <Card className="border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today&apos;s Gross Profit
              </span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-foreground">
              {formatCurrency(kpis.todayGrossProfit)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Sales Revenue − COGS</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Today's Net Profit */}
        <Card className="border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today&apos;s Net Profit
              </span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-foreground">
              {formatCurrency(kpis.todayNetProfit)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Gross Profit − Logistics Overhead</span>
            </div>
          </CardContent>
        </Card>

        {/* 5. Total Inventory Value */}
        <Card className="border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Inventory Value
              </span>
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-foreground">
              {formatCurrency(kpis.totalInventoryValue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/inventory" className="text-primary hover:underline flex items-center gap-0.5">
                Batch valuation <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 6. Customer Outstanding Dues */}
        <Card className="border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Customer Dues (AR)
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-foreground">
              {formatCurrency(kpis.customerOutstandingDues)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/customers" className="text-amber-600 hover:underline flex items-center gap-0.5 font-medium">
                Accounts Receivable <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 7. Supplier Outstanding Dues */}
        <Card className="border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Supplier Dues (AP)
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-foreground">
              {formatCurrency(kpis.supplierOutstandingDues)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/suppliers" className="text-rose-600 hover:underline flex items-center gap-0.5 font-medium">
                Accounts Payable <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 8. Total Active Medicines */}
        <Card className="border border-border/80 shadow-sm hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Medicines
              </span>
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Pill className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-foreground">
              {kpis.totalActiveMedicines}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/medicines" className="text-primary hover:underline flex items-center gap-0.5">
                Drug master catalog <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4 Clickable Operational Status Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Low Stock */}
        <Link href="/inventory" className="block group">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-500/5 border-amber-500/30 group-hover:border-amber-500/60 transition-all">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div>
                <div className="text-xs font-bold text-foreground">Low Stock Medicines</div>
                <div className="text-[11px] text-muted-foreground">At or below reorder level</div>
              </div>
            </div>
            <Badge variant="warning" className="text-xs font-bold">
              {kpis.lowStockMedicinesCount}
            </Badge>
          </div>
        </Link>

        {/* Out of Stock */}
        <Link href="/inventory" className="block group">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-rose-500/5 border-rose-500/30 group-hover:border-rose-500/60 transition-all">
            <div className="flex items-center gap-2.5">
              <AlertOctagon className="h-4 w-4 text-rose-600" />
              <div>
                <div className="text-xs font-bold text-foreground">Out of Stock</div>
                <div className="text-[11px] text-muted-foreground">Zero balance in warehouse</div>
              </div>
            </div>
            <Badge variant="destructive" className="text-xs font-bold">
              {kpis.outOfStockMedicinesCount}
            </Badge>
          </div>
        </Link>

        {/* Expired Batches */}
        <Link href="/inventory" className="block group">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-rose-500/5 border-rose-500/30 group-hover:border-rose-500/60 transition-all">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <div>
                <div className="text-xs font-bold text-foreground">Expired Batches</div>
                <div className="text-[11px] text-muted-foreground">Quarantine required</div>
              </div>
            </div>
            <Badge variant="destructive" className="text-xs font-bold">
              {kpis.expiredBatchesCount}
            </Badge>
          </div>
        </Link>

        {/* Near Expiry Batches (<90 days) */}
        <Link href="/inventory" className="block group">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-500/5 border-amber-500/30 group-hover:border-amber-500/60 transition-all">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-amber-600" />
              <div>
                <div className="text-xs font-bold text-foreground">Near Expiry (&lt;90d)</div>
                <div className="text-[11px] text-muted-foreground">Prioritize FEFO dispatch</div>
              </div>
            </div>
            <Badge variant="warning" className="text-xs font-bold">
              {kpis.nearExpiryBatchesCount}
            </Badge>
          </div>
        </Link>
      </div>
    </div>
  );
}
