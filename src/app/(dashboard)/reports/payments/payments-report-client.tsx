"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ArrowLeft,
  Download,
  Printer,
  Search,
  TrendingUp,
  Receipt,
  Truck,
  Store,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/export-utils";

interface PaymentsReportClientProps {
  reportData?: any;
}

export function PaymentsReportClient({ reportData }: PaymentsReportClientProps) {
  const router = useRouter();
  const currentPreset = reportData?.preset || "this_month";
  const [activeTab, setActiveTab] = React.useState<"CUSTOMERS" | "SUPPLIERS">("CUSTOMERS");
  const [search, setSearch] = React.useState("");
  const [selectedDistributor, setSelectedDistributor] = React.useState<string>("ALL");

  const data = reportData || {
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    preset: "this_month",
    totalCollected: 0,
    totalDisbursed: 0,
    netCashFlow: 0,
    collectedToday: 0,
    receiptsTodayCount: 0,
    collectedThisMonth: 0,
    receiptsThisMonthCount: 0,
    collectorBreakdown: [],
    availableDistributors: [],
    customerPayments: [],
    supplierPayments: [],
  };

  const applyPreset = (preset: string) => {
    const params = new URLSearchParams();
    params.set("preset", preset);
    if (selectedDistributor && selectedDistributor !== "ALL") {
      params.set("distributorId", selectedDistributor);
    }
    router.push(`/reports/payments?${params.toString()}`);
  };

  const handleSelectDistributor = (distId: string) => {
    setSelectedDistributor(distId);
    const params = new URLSearchParams();
    params.set("preset", currentPreset);
    if (distId !== "ALL") {
      params.set("distributorId", distId);
    }
    router.push(`/reports/payments?${params.toString()}`);
  };

  const handleExportCSV = () => {
    if (activeTab === "CUSTOMERS") {
      const headers = ["Receipt #", "Customer Pharmacy", "Sales Representative / Collector", "Date", "Method", "Amount"];
      const rows = filteredCustomerPayments.map((p: any) => [
        p.receiptNumber,
        p.customerName,
        p.collectorName,
        p.paymentDate,
        p.paymentMethod,
        p.amount,
      ]);
      exportToCSV(`Customer_Collections_Report_${data.startDate}_to_${data.endDate}`, headers, rows);
    } else {
      const headers = ["Voucher #", "Manufacturer Supplier", "Date", "Method", "Amount"];
      const rows = filteredSupplierPayments.map((p: any) => [
        p.voucherNumber,
        p.supplierName,
        p.paymentDate,
        p.paymentMethod,
        p.amount,
      ]);
      exportToCSV(`Supplier_Disbursements_Report_${data.startDate}_to_${data.endDate}`, headers, rows);
    }
  };

  const presets = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
    { label: "Last Month", value: "last_month" },
  ];

  const filteredCustomerPayments = (data.customerPayments || []).filter((p: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.receiptNumber?.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q) ||
      p.collectorName?.toLowerCase().includes(q) ||
      p.referenceNumber?.toLowerCase().includes(q)
    );
  });

  const filteredSupplierPayments = (data.supplierPayments || []).filter((p: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.voucherNumber?.toLowerCase().includes(q) ||
      p.supplierName?.toLowerCase().includes(q) ||
      p.referenceNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* 1. Header */}
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
        title="Payment & Collections Reconciliation Ledger"
        description="Double-entry reconciliation between salesman money receipts collected and supplier purchase payables disbursed."
      >
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/80">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => applyPreset(p.value)}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Filtered Period Collections */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Period Collections</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.totalCollected)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            {filteredCustomerPayments.length} money receipts in period
          </div>
        </div>

        {/* Card 2: Today's Recovery */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Collected Today (Day)</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(data.collectedToday || 0)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">
            {data.receiptsTodayCount || 0} receipts today
          </div>
        </div>

        {/* Card 3: This Month's Recovery */}
        <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-800">This Month's Recovery</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-950 font-mono">
            {formatCurrency(data.collectedThisMonth || 0)}
          </div>
          <div className="text-[11px] text-indigo-600 mt-1">
            {data.receiptsThisMonthCount || 0} monthly total receipts
          </div>
        </div>

        {/* Card 4: Supplier Disbursements */}
        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Supplier Outflow</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950 font-mono">
            {formatCurrency(data.totalDisbursed)}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            {data.supplierPayments.length} payment vouchers
          </div>
        </div>
      </div>

      {/* 3. Search & Salesman Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search receipt #, pharmacy or rep..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9 rounded-xl border-border/80"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Salesman / Collector:</span>
          <select
            value={selectedDistributor}
            onChange={(e) => handleSelectDistributor(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-border/80 bg-background font-medium"
          >
            <option value="ALL">All Salesmen & Reps</option>
            {(data.availableDistributors || []).map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code || d.territory || "Territory"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Tabbed Ledger */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-border/60 bg-muted/20 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("CUSTOMERS")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "CUSTOMERS"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Store className="h-3.5 w-3.5" />
            Customer Collections ({filteredCustomerPayments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SUPPLIERS")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "SUPPLIERS"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            Supplier Disbursements ({filteredSupplierPayments.length})
          </button>
        </div>

        {/* Tab 1: Customer Payments */}
        {activeTab === "CUSTOMERS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Money Receipt #</th>
                  <th className="px-4 py-3.5">Customer Pharmacy</th>
                  <th className="px-4 py-3.5">Collector / Salesman</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5 text-right font-bold text-emerald-700">Amount Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCustomerPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                      No customer collections recorded during this period.
                    </td>
                  </tr>
                ) : (
                  filteredCustomerPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-foreground">{p.receiptNumber}</td>
                      <td className="px-4 py-3.5 font-medium text-foreground">{p.customerName}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="text-[10px] font-medium bg-muted/40">
                          {p.collectorName}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="px-4 py-3.5 capitalize">{p.paymentMethod.replace(/_/g, " ").toLowerCase()}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Supplier Payments */}
        {activeTab === "SUPPLIERS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Voucher #</th>
                  <th className="px-4 py-3.5">Manufacturer Supplier</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5 text-right font-bold text-rose-700">Amount Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSupplierPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                      No supplier disbursements recorded during this period.
                    </td>
                  </tr>
                ) : (
                  filteredSupplierPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-foreground">{p.voucherNumber}</td>
                      <td className="px-4 py-3.5 font-semibold text-foreground">{p.supplierName}</td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="px-4 py-3.5 capitalize">{p.paymentMethod.replace(/_/g, " ").toLowerCase()}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-rose-700">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Supplier Disbursements</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950 font-mono">
            {formatCurrency(data.totalDisbursed)}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">{data.supplierPayments.length} payment vouchers</div>
        </div>

        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Net Operating Cash Balance</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(data.netCashFlow)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Inflow minus supplier outflow</div>
        </div>
      </div>

      {/* 3. Tabbed Ledger */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-border/60 bg-muted/20 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("CUSTOMERS")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "CUSTOMERS"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Store className="h-3.5 w-3.5" />
            Customer Collections ({data.customerPayments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SUPPLIERS")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "SUPPLIERS"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            Supplier Disbursements ({data.supplierPayments.length})
          </button>
        </div>

        {/* Tab 1: Customer Payments */}
        {activeTab === "CUSTOMERS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Money Receipt #</th>
                  <th className="px-4 py-3.5">Customer Pharmacy</th>
                  <th className="px-4 py-3.5">Collector / Rep</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5 text-right font-bold text-emerald-700">Amount Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.customerPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                      No customer collections recorded during this period.
                    </td>
                  </tr>
                ) : (
                  data.customerPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-foreground">{p.receiptNumber}</td>
                      <td className="px-4 py-3.5 font-medium text-foreground">{p.customerName}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{p.collectorName}</td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="px-4 py-3.5 capitalize">{p.paymentMethod.replace(/_/g, " ").toLowerCase()}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Supplier Payments */}
        {activeTab === "SUPPLIERS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Voucher #</th>
                  <th className="px-4 py-3.5">Manufacturer Supplier</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5 text-right font-bold text-rose-700">Amount Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.supplierPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                      No supplier disbursements recorded during this period.
                    </td>
                  </tr>
                ) : (
                  data.supplierPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-foreground">{p.voucherNumber}</td>
                      <td className="px-4 py-3.5 font-semibold text-foreground">{p.supplierName}</td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="px-4 py-3.5 capitalize">{p.paymentMethod.replace(/_/g, " ").toLowerCase()}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-rose-700">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
