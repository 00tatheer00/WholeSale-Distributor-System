"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  ShoppingCart,
  ReceiptText,
  Boxes,
  Clock,
  AlertTriangle,
  Store,
  CreditCard,
  Truck,
  Users2,
  Wallet,
  TrendingUp,
  Pill,
  ArrowUpRight,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface ReportsClientProps {
  summary?: any;
}

export function ReportsClient({ summary }: ReportsClientProps) {
  const s = summary || {
    totalRevenue: 0,
    totalSalesCount: 0,
    grossProfit: 0,
    netProfit: 0,
    totalPurchases: 0,
    totalPurchaseCount: 0,
    totalUnitsInStock: 0,
    totalExpenses: 0,
    expiredCount: 0,
    nearExpiryCount: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    totalCustomerDues: 0,
    totalSuppliers: 0,
    totalSupplierDues: 0,
    activeDistributors: 0,
  };

  const reportCards = [
    {
      title: "Wholesale Sales Intelligence",
      description: "Itemized sales orders, discounts, DGDA tax, customer billing, and gross profits.",
      icon: ShoppingCart,
      href: "/reports/sales",
      kpi: formatCurrency(s.totalRevenue),
      kpiLabel: `${s.totalSalesCount} Orders Booked`,
      accent: "text-[#0071E3] bg-sky-50 border-sky-100",
    },
    {
      title: "Procurement & Consignments",
      description: "Direct purchase intake, supplier invoice reconciliation, and batch receiving logs.",
      icon: ReceiptText,
      href: "/reports/purchases",
      kpi: formatCurrency(s.totalPurchases),
      kpiLabel: `${s.totalPurchaseCount} Consignments Received`,
      accent: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Warehouse Inventory Valuation",
      description: "Active batch quantities on hand, historical unit cost valuation, and potential selling revenue.",
      icon: Boxes,
      href: "/reports/inventory",
      kpi: `${s.totalUnitsInStock.toLocaleString()} Units`,
      kpiLabel: "Total Stock on Hand",
      accent: "text-indigo-700 bg-indigo-50 border-indigo-100",
    },
    {
      title: "DGDA Expiry Watchdog",
      description: "Expired batches and near-expiry medicines expiring in 30, 60, and 90 days.",
      icon: Clock,
      href: "/reports/expiry",
      kpi: `${s.expiredCount} Expired • ${s.nearExpiryCount} Near Expiry`,
      kpiLabel: "FEFO Compliance Watch",
      accent: "text-rose-700 bg-rose-50 border-rose-100",
    },
    {
      title: "Low Stock & Reorder Deficit",
      description: "Medicines below minimum threshold or out of stock with reorder calculations.",
      icon: AlertTriangle,
      href: "/reports/low-stock",
      kpi: `${s.lowStockCount} Products Deficit`,
      kpiLabel: "Reorder Required",
      accent: "text-amber-700 bg-amber-50 border-amber-100",
    },
    {
      title: "Customer Accounts & AR Dues",
      description: "Pharmacy customer outstanding balances, credit utilization, and overdue limits.",
      icon: Store,
      href: "/reports/customer-dues",
      kpi: formatCurrency(s.totalCustomerDues),
      kpiLabel: `${s.totalCustomers} Active Pharmacies`,
      accent: "text-purple-700 bg-purple-50 border-purple-100",
    },
    {
      title: "Supplier Accounts & AP Payables",
      description: "Manufacturer balances due, payment terms, and pending invoice payables.",
      icon: Truck,
      href: "/reports/supplier-dues",
      kpi: formatCurrency(s.totalSupplierDues),
      kpiLabel: `${s.totalSuppliers} Active Manufacturers`,
      accent: "text-cyan-700 bg-cyan-50 border-cyan-100",
    },
    {
      title: "Medical Representatives Performance",
      description: "Sales representatives field booking volume, recovery collections, and net profit contribution.",
      icon: Users2,
      href: "/distributors",
      kpi: `${s.activeDistributors} Field Reps`,
      kpiLabel: "Sales Team Performance",
      accent: "text-blue-700 bg-blue-50 border-blue-100",
    },
    {
      title: "Operating Expenses Breakdown",
      description: "Logistics fuel, warehouse rent, electricity, and administrative overheads.",
      icon: Wallet,
      href: "/expenses",
      kpi: formatCurrency(s.totalExpenses),
      kpiLabel: "Total Approved Expenses",
      accent: "text-orange-700 bg-orange-50 border-orange-100",
    },
    {
      title: "Profit & Loss Financials",
      description: "Strict historical COGS derived gross margins, operating expenses, and net profit trajectory.",
      icon: TrendingUp,
      href: "/profit",
      kpi: formatCurrency(s.netProfit),
      kpiLabel: `Gross: ${formatCurrency(s.grossProfit)}`,
      accent: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Fast-Moving Medicine Performance",
      description: "Top 10 selling products, quantity sold ranking, revenue, and gross margins.",
      icon: Pill,
      href: "/reports/medicines",
      kpi: "Top Product Rankings",
      kpiLabel: "Sales Volume & Profit Margins",
      accent: "text-teal-700 bg-teal-50 border-teal-100",
    },
    {
      title: "Collections & Cash Reconciliation",
      description: "Customer money receipts collected vs Supplier purchase payments disbursed.",
      icon: CreditCard,
      href: "/reports/payments",
      kpi: "Cash Flow Ledgers",
      kpiLabel: "Customer & Supplier Reconciliation",
      accent: "text-violet-700 bg-violet-50 border-violet-100",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* 1. Header Section */}
      <PageHeader
        title="Enterprise Reports & Business Analytics"
        description="Authoritative, real-time database intelligence covering sales, procurement, FEFO stock valuation, and double-entry ledgers."
      />

      {/* 2. Top 4 Macro KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-sky-800">Total Billed Revenue</div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(s.totalRevenue)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">{s.totalSalesCount} confirmed sales orders</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-emerald-800">Realized Gross Profit</div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(s.grossProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Derived from batch COGS</div>
        </div>

        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-purple-800">Customer Receivables (AR)</div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(s.totalCustomerDues)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Total pharmacy outstanding</div>
        </div>

        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-amber-800">Supplier Payables (AP)</div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(s.totalSupplierDues)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Outstanding manufacturer bills</div>
        </div>
      </div>

      {/* 3. 12 Interactive Domain Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((r, i) => {
          const Icon = r.icon;
          return (
            <Link
              key={i}
              href={r.href}
              className="group bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:border-[#0071E3]/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${r.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="h-7 w-7 rounded-full bg-muted/40 group-hover:bg-[#0071E3] group-hover:text-white text-muted-foreground flex items-center justify-center transition-colors">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#0071E3] transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-foreground">{r.kpi}</span>
                <span className="text-[11px] text-muted-foreground">{r.kpiLabel}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
