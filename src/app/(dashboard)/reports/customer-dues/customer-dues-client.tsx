"use client";

import * as React from "react";
import Link from "next/link";
import {
  Store,
  ArrowLeft,
  Download,
  Printer,
  ShieldAlert,
  CreditCard,
  Search,
  Eye,
  Phone,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { exportToCSV } from "@/lib/export-utils";

interface CustomerDuesClientProps {
  reportData?: any;
}

export function CustomerDuesClient({ reportData }: CustomerDuesClientProps) {
  const [search, setSearch] = React.useState("");
  const [filterOverLimit, setFilterOverLimit] = React.useState<boolean | null>(null);

  const data = reportData || {
    totalReceivables: 0,
    totalCreditLimit: 0,
    overLimitCount: 0,
    totalCustomersWithDue: 0,
    items: [],
  };

  const filteredItems = data.items.filter((c: any) => {
    if (filterOverLimit === true && !c.isOverLimit) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.pharmacyName.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.proprietorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      "Customer Code",
      "Pharmacy Name",
      "Proprietor",
      "Phone",
      "Credit Limit (AFN)",
      "Current Due (AFN)",
      "Available Credit (AFN)",
      "Credit Utilization %",
      "Over Limit Status",
    ];

    const rows = filteredItems.map((c: any) => [
      c.customerCode,
      c.pharmacyName,
      c.proprietorName,
      c.phone,
      c.creditLimit,
      c.currentDue,
      c.availableCredit,
      `${c.creditUtilizationPercent}%`,
      c.isOverLimit ? "OVER_LIMIT_HOLD" : "NORMAL",
    ]);

    exportToCSV("Customer_Accounts_Receivable_Dues_Report", headers, rows);
  };

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
        title="Customer Receivables (AR) & Credit Aging Intelligence"
        description="Authoritative customer ledger dues, credit limit exposure, and collection risk rankings."
      />

      {/* 2. Top 4 Pastel KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Total Receivables (AR)</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(data.totalReceivables)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Across {data.totalCustomersWithDue} pharmacies</div>
        </div>

        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Total Authorized Credit</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(data.totalCreditLimit)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Total approved credit room</div>
        </div>

        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Over-Limit Accounts</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-700">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950 font-mono">
            {data.overLimitCount} Pharmacies
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Credit barrier order holds active</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Overall AR Exposure</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {data.totalCreditLimit > 0
              ? `${Math.round((data.totalReceivables / data.totalCreditLimit) * 100)}%`
              : "0%"}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Credit pool utilization</div>
        </div>
      </div>

      {/* 3. Search & Filter */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customer pharmacy, code, phone, proprietor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5 pr-4 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl">
          <button
            onClick={() => setFilterOverLimit(null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterOverLimit === null
                ? "bg-white dark:bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Outstanding ({data.items.length})
          </button>
          <button
            onClick={() => setFilterOverLimit(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterOverLimit === true
                ? "bg-white dark:bg-card text-rose-700 shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Over-Limit Only ({data.overLimitCount})
          </button>
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer Pharmacy</th>
                <th className="px-4 py-3.5">Proprietor & Phone</th>
                <th className="px-4 py-3.5 text-right">Credit Limit</th>
                <th className="px-4 py-3.5 text-right font-bold text-rose-700">Current Due (AR)</th>
                <th className="px-4 py-3.5 text-right">Available Credit</th>
                <th className="px-4 py-3.5 text-right">Utilization</th>
                <th className="px-4 py-3.5 text-center">Credit Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                    No customer dues found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/customers/${c.id}`}
                        className="font-bold text-foreground hover:text-[#0071E3] transition-colors"
                      >
                        {c.pharmacyName}
                      </Link>
                      <div className="text-[10px] text-muted-foreground font-mono">{c.customerCode}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-foreground">{c.proprietorName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                      {formatCurrency(c.creditLimit)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600 text-xs">
                      {formatCurrency(c.currentDue)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-700 font-semibold">
                      {formatCurrency(c.availableCredit)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold">
                      <span className={c.creditUtilizationPercent > 100 ? "text-rose-600" : "text-foreground"}>
                        {c.creditUtilizationPercent}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {c.isOverLimit ? (
                        <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">
                          Over-Limit Hold
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          Normal
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#0071E3]">
                        <Link href={`/customers/${c.id}/ledger`}>
                          <Eye className="h-3 w-3 mr-1" /> Ledger
                        </Link>
                      </Button>
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
