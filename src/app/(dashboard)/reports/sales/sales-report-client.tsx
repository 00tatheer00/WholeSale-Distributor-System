"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Calendar,
  Download,
  Printer,
  Search,
  Filter,
  TrendingUp,
  Package,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/export-utils";

interface SalesReportClientProps {
  reportData?: any;
  customers: any[];
  distributors: any[];
}

export function SalesReportClient({
  reportData,
  customers,
  distributors,
}: SalesReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPreset = reportData?.preset || "this_month";
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [selectedCustomer, setSelectedCustomer] = React.useState(searchParams.get("customer") || "ALL");
  const [selectedDistributor, setSelectedDistributor] = React.useState(searchParams.get("distributor") || "ALL");

  const data = reportData || {
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    preset: "this_month",
    totalRevenue: 0,
    totalCogs: 0,
    grossProfit: 0,
    grossMarginPercent: 0,
    totalPaid: 0,
    totalDue: 0,
    totalDiscount: 0,
    totalTax: 0,
    salesCount: 0,
    sales: [],
  };

  const applyFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === "ALL") {
        current.delete(k);
      } else {
        current.set(k, v);
      }
    });
    router.push(`/reports/sales?${current.toString()}`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Sale Number",
      "Invoice Number",
      "Customer Pharmacy",
      "Sales Representative",
      "Date",
      "Grand Total (BDT)",
      "Paid Amount (BDT)",
      "Due Amount (BDT)",
      "COGS (BDT)",
      "Gross Profit (BDT)",
      "Status",
    ];

    const rows = data.sales.map((s: any) => [
      s.saleNumber,
      s.invoiceNumber,
      s.customerName,
      s.distributorName,
      s.saleDate,
      s.grandTotal,
      s.paidAmount,
      s.dueAmount,
      s.cogsTotal,
      s.grossProfit,
      s.status,
    ]);

    exportToCSV(`Wholesale_Sales_Report_${data.startDate}_to_${data.endDate}`, headers, rows);
  };

  const presets = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
    { label: "Last Month", value: "last_month" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Link href="/reports">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Reports Center
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs h-9 border-border/80"
          >
            <Printer className="h-4 w-4 mr-1.5" /> Print Report
          </Button>

          <Button
            onClick={handleExportCSV}
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-3.5 shadow-sm"
          >
            <Download className="h-4 w-4 mr-1.5" /> Export Filtered CSV
          </Button>
        </div>
      </div>

      <PageHeader
        title="Wholesale Sales & Billing Intelligence"
        description="Comprehensive sales ledger with historical batch COGS, invoice settlements, and gross margins."
      >
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/80">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => applyFilters({ preset: p.value, start: null, end: null })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                currentPreset === p.value
                  ? "bg-white dark:bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* 2. Top 4 Pastel KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Total Billed Revenue</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(data.totalRevenue)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">{data.salesCount} wholesale orders</div>
        </div>

        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Historical COGS</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-700">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950 font-mono">
            {formatCurrency(data.totalCogs)}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Batch acquisition cost</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Gross Margin Realized</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.grossProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Margin: {data.grossMarginPercent.toFixed(1)}%
          </div>
        </div>

        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Collections / Dues</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(data.totalPaid)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">
            Pending Due: {formatCurrency(data.totalDue)}
          </div>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters({ search: search.trim() || null });
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sale # (SO-...), pharmacy name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5 pr-16 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm"
          />
        </form>

        <Select
          value={selectedCustomer}
          onValueChange={(val) => {
            setSelectedCustomer(val);
            applyFilters({ customer: val });
          }}
        >
          <SelectTrigger className="h-10 text-xs rounded-xl w-[200px] bg-background">
            <SelectValue placeholder="Customer Pharmacy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Pharmacies</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.pharmacyName || c.tradeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedDistributor}
          onValueChange={(val) => {
            setSelectedDistributor(val);
            applyFilters({ distributor: val });
          }}
        >
          <SelectTrigger className="h-10 text-xs rounded-xl w-[180px] bg-background">
            <SelectValue placeholder="Representative" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Representatives</SelectItem>
            {distributors.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Sales Report Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Sale # & Invoice</th>
                <th className="px-4 py-3.5">Customer Pharmacy</th>
                <th className="px-4 py-3.5">Field Rep</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Grand Total</th>
                <th className="px-4 py-3.5 text-right">Paid / Due</th>
                <th className="px-4 py-3.5 text-right">COGS</th>
                <th className="px-4 py-3.5 text-right">Gross Profit</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">
                    No sales orders matched the selected filter criteria.
                  </td>
                </tr>
              ) : (
                data.sales.map((s: any) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                      <Link href={`/sales/${s.id}`} className="hover:underline text-[#0071E3]">
                        {s.saleNumber}
                      </Link>
                      <div className="text-[10px] text-muted-foreground">{s.invoiceNumber}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground">{s.customerName}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{s.distributorName}</td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDate(s.saleDate)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                      {formatCurrency(s.grandTotal)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      <span className="text-emerald-700 font-bold">{formatCurrency(s.paidAmount)}</span> /{" "}
                      <span className="text-amber-700 font-bold">{formatCurrency(s.dueAmount)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-rose-700 font-semibold">
                      {formatCurrency(s.cogsTotal)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(s.grossProfit)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
