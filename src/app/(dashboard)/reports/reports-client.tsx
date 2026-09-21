"use client";

import * as React from "react";
import Link from "next/link";
import {
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
  ArrowRight,
  BarChart3,
  FileSpreadsheet,
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

  const reportSections = [
    {
      category: "SALES & COMMERCIAL REPORTS",
      description: "Wholesale billing, customer receivable aging, field representative recovery, and product performance.",
      reports: [
        {
          title: "Wholesale Sales Intelligence",
          purpose: "View itemized sales orders, discounts, sales tax, customer billing, and gross margins for any selected period.",
          icon: ShoppingCart,
          href: "/reports/sales",
          kpi: formatCurrency(s.totalRevenue),
          kpiLabel: `${s.totalSalesCount} Orders Booked`,
          accent: "text-[#0071E3] bg-sky-50 border-sky-100",
        },
        {
          title: "Customer Accounts & AR Aging",
          purpose: "Track outstanding balances across customer pharmacies, credit limit utilization, and overdue aging brackets (30, 60, 90+ days).",
          icon: Store,
          href: "/reports/customer-dues",
          kpi: formatCurrency(s.totalCustomerDues),
          kpiLabel: `${s.totalCustomers} Active Pharmacies`,
          accent: "text-purple-700 bg-purple-50 border-purple-100",
        },
        {
          title: "Collections & Sales Rep Recovery",
          purpose: "Analyze customer collections received, payment methods, and cash recovery rates attributed to each sales representative.",
          icon: CreditCard,
          href: "/reports/payments",
          kpi: "Cash & Digital Rails",
          kpiLabel: "Customer & Rep Reconciliation",
          accent: "text-emerald-700 bg-emerald-50 border-emerald-100",
        },
        {
          title: "Drug Sales & Movement Matrix",
          purpose: "Analyze fast-moving vs slow-moving medicines, total units sold, gross revenue contribution, and profit margins per product.",
          icon: Pill,
          href: "/reports/medicines",
          kpi: "Product Rankings",
          kpiLabel: "Sales Volume & Margins",
          accent: "text-teal-700 bg-teal-50 border-teal-100",
        },
      ],
    },
    {
      category: "INVENTORY & WAREHOUSE REPORTS",
      description: "Batch valuation, DRAP expiry compliance, and safety reorder deficit monitoring.",
      reports: [
        {
          title: "Warehouse Stock Valuation",
          purpose: "Review active batch quantities on hand across physical warehouses, historical acquisition cost valuation, and projected trade value.",
          icon: Boxes,
          href: "/reports/inventory",
          kpi: `${s.totalUnitsInStock.toLocaleString()} Units`,
          kpiLabel: "Total Stock on Hand",
          accent: "text-indigo-700 bg-indigo-50 border-indigo-100",
        },
        {
          title: "DRAP Expiry & FEFO Watchdog",
          purpose: "Identify batches expiring within 30, 60, 90, or 180 days, and quarantine expired stock to protect compliance and prevent bad inventory.",
          icon: Clock,
          href: "/reports/expiry",
          kpi: `${s.expiredCount} Expired • ${s.nearExpiryCount} Near Expiry`,
          kpiLabel: "Regulatory Compliance Watch",
          accent: "text-rose-700 bg-rose-50 border-rose-100",
        },
        {
          title: "Low Stock & Reorder Deficit",
          purpose: "Highlight medicines currently below minimum safety reorder thresholds or completely out of stock with recommended purchase quantities.",
          icon: AlertTriangle,
          href: "/reports/low-stock",
          kpi: `${s.lowStockCount} Products Deficit`,
          kpiLabel: "Reorder Required",
          accent: "text-amber-700 bg-amber-50 border-amber-100",
        },
      ],
    },
    {
      category: "PROCUREMENT & VENDOR REPORTS",
      description: "Purchasing intakes, consignment verification, and supplier accounts payable.",
      reports: [
        {
          title: "Procurement & Consignments",
          purpose: "Review manufacturer purchase intake records, received batch quantities, purchase invoices, and vendor settlement statuses.",
          icon: ReceiptText,
          href: "/reports/purchases",
          kpi: formatCurrency(s.totalPurchases),
          kpiLabel: `${s.totalPurchaseCount} Consignments Received`,
          accent: "text-emerald-700 bg-emerald-50 border-emerald-100",
        },
        {
          title: "Supplier Accounts & AP Dues",
          purpose: "Check how much we owe each pharmaceutical manufacturer, pending payment vouchers, and aging of trade payables.",
          icon: Truck,
          href: "/reports/supplier-dues",
          kpi: formatCurrency(s.totalSupplierDues),
          kpiLabel: `${s.totalSuppliers} Active Suppliers`,
          accent: "text-cyan-700 bg-cyan-50 border-cyan-100",
        },
      ],
    },
    {
      category: "FINANCIAL INTELLIGENCE & P&L",
      description: "Authoritative P&L, historical batch COGS, gross and net profitability, and overhead expenses.",
      reports: [
        {
          title: "Executive Profit & P&L Cockpit",
          purpose: "Inspect authoritative net profit derived from strict historical batch COGS and operating expenses, with date range filters and product margin breakdowns.",
          icon: TrendingUp,
          href: "/profit",
          kpi: formatCurrency(s.netProfit),
          kpiLabel: `Gross Margin: ${formatCurrency(s.grossProfit)}`,
          accent: "text-emerald-700 bg-emerald-50 border-emerald-100",
        },
        {
          title: "Operating Expenses Breakdown",
          purpose: "Monitor operational overheads across categories such as warehouse rent, logistics fuel, salesman TA/DA, and marketing.",
          icon: Wallet,
          href: "/expenses",
          kpi: formatCurrency(s.totalExpenses),
          kpiLabel: "Total Approved Expenses",
          accent: "text-orange-700 bg-orange-50 border-orange-100",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      {/* 1. Header Section */}
      <PageHeader
        title="Reports & Business Intelligence Hub"
        description="Comprehensive, authoritative data intelligence covering sales billing, warehouse inventory, procurement consignments, and double-entry financials."
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-sky-800">Total Billed Revenue</div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(s.totalRevenue)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">{s.totalSalesCount} wholesale orders booked</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-emerald-800">Total Purchases Intake</div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(s.totalPurchases)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">{s.totalPurchaseCount} consignments received</div>
        </div>

        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-purple-800">Customer Receivables (AR)</div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(s.totalCustomerDues)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">{s.totalCustomers} active pharmacy accounts</div>
        </div>

        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-amber-800">Supplier Payables (AP)</div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(s.totalSupplierDues)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Amount we owe manufacturers</div>
        </div>
      </div>

      {/* 3. Categorized Reports Grid */}
      <div className="space-y-8">
        {reportSections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <div className="border-b border-border/80 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {section.category}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {section.reports.map((report, rIdx) => {
                const Icon = report.icon;
                return (
                  <div
                    key={rIdx}
                    className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${report.accent}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground group-hover:text-[#0071E3] transition-colors">
                              {report.title}
                            </h3>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {report.kpiLabel}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className="font-mono text-xs px-2.5 py-0.5 bg-muted/60 shrink-0 font-bold"
                        >
                          {report.kpi}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {report.purpose}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/50 mt-4 flex items-center justify-end">
                      <Button
                        asChild
                        size="sm"
                        className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-8 px-3.5 shadow-sm group-hover:translate-x-0.5 transition-transform"
                      >
                        <Link href={report.href}>
                          View Report <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
