"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ReceiptText,
  ArrowLeft,
  Download,
  Printer,
  Search,
  Truck,
  TrendingUp,
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

interface PurchasesReportClientProps {
  reportData?: any;
  suppliers: any[];
}

export function PurchasesReportClient({
  reportData,
  suppliers,
}: PurchasesReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPreset = reportData?.preset || "this_month";
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [selectedSupplier, setSelectedSupplier] = React.useState(searchParams.get("supplier") || "ALL");

  const data = reportData || {
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    preset: "this_month",
    totalPurchases: 0,
    totalPaid: 0,
    totalDue: 0,
    purchaseCount: 0,
    purchases: [],
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
    router.push(`/reports/purchases?${current.toString()}`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Purchase Number",
      "Supplier Invoice #",
      "Manufacturer Supplier",
      "Date",
      "Total Amount (AFN)",
      "Paid Amount (AFN)",
      "Due Balance (AFN)",
      "Status",
    ];

    const rows = data.purchases.map((p: any) => [
      p.purchaseNumber,
      p.supplierInvoiceNumber,
      p.supplierName,
      p.purchaseDate,
      p.totalAmount,
      p.paidAmount,
      p.dueAmount,
      p.status,
    ]);

    exportToCSV(`Procurement_Report_${data.startDate}_to_${data.endDate}`, headers, rows);
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
      {/* 1. Header Navigation */}
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
        title="Procurement & Supplier Intake Intelligence"
        description="Direct medicine batch intakes, manufacturer bills, payment settlements, and AP payables."
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

      {/* 2. Top 3 Pastel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Total Purchases Invoiced</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <ReceiptText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.totalPurchases)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">{data.purchaseCount} consignments received</div>
        </div>

        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Supplier Payments Paid</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(data.totalPaid)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Disbursed via bank / payment vouchers</div>
        </div>

        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Pending Payables (AP)</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(data.totalDue)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Outstanding manufacturer balances</div>
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
            placeholder="Search PO # (PO-...), supplier invoice #, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-16 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm"
          />
        </form>

        <Select
          value={selectedSupplier}
          onValueChange={(val) => {
            setSelectedSupplier(val);
            applyFilters({ supplier: val });
          }}
        >
          <SelectTrigger className="h-10 text-xs rounded-xl w-[220px] bg-background">
            <SelectValue placeholder="Manufacturer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Manufacturers</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Purchase Order #</th>
                <th className="px-4 py-3.5">Supplier Invoice #</th>
                <th className="px-4 py-3.5">Manufacturer</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Total Amount</th>
                <th className="px-4 py-3.5 text-right">Paid Amount</th>
                <th className="px-4 py-3.5 text-right font-bold text-amber-700">Due Balance</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                    No purchase consignments matched the selected filter criteria.
                  </td>
                </tr>
              ) : (
                data.purchases.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                      <Link href={`/purchases/${p.id}`} className="hover:underline text-[#0071E3]">
                        {p.purchaseNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">{p.supplierInvoiceNumber}</td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">{p.supplierName}</td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDate(p.purchaseDate)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-700 font-semibold">
                      {formatCurrency(p.paidAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-700">
                      {formatCurrency(p.dueAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {p.status}
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
