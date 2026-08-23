"use client";

import * as React from "react";
import Link from "next/link";
import {
  Truck,
  ArrowLeft,
  Download,
  Printer,
  Search,
  Building2,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { exportToCSV } from "@/lib/export-utils";

interface SupplierDuesClientProps {
  reportData?: any;
}

export function SupplierDuesClient({ reportData }: SupplierDuesClientProps) {
  const [search, setSearch] = React.useState("");

  const data = reportData || {
    totalPayables: 0,
    totalSuppliersWithDue: 0,
    items: [],
  };

  const filteredItems = data.items.filter((s: any) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.drugLicenseNo && s.drugLicenseNo.toLowerCase().includes(q)) ||
        s.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      "Manufacturer Name",
      "Drug License #",
      "Phone",
      "Credit Period (Days)",
      "Outstanding Payable Due (AFN)",
      "Status",
    ];

    const rows = filteredItems.map((s: any) => [
      s.name,
      s.drugLicenseNo,
      s.phone,
      s.creditPeriodDays,
      s.currentDue,
      s.status,
    ]);

    exportToCSV("Supplier_Accounts_Payable_Dues_Report", headers, rows);
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
        title="Supplier Accounts Payable (AP) & Aging Intelligence"
        description="Outstanding manufacturer consignment balances, payment credit terms, and cash disbursement liabilities."
      />

      {/* 2. Top 2 Pastel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Total Supplier Payables (AP)</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(data.totalPayables)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">
            Across {data.totalSuppliersWithDue} pharmaceutical manufacturers
          </div>
        </div>

        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Creditor Liability Concentration</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {data.totalSuppliersWithDue} Active Creditors
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Pending payment vouchers</div>
        </div>
      </div>

      {/* 3. Search */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search manufacturer name, drug license #, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5 pr-4 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm"
          />
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Manufacturer Supplier</th>
                <th className="px-4 py-3.5">Drug License # & Phone</th>
                <th className="px-4 py-3.5 text-center">Credit Period</th>
                <th className="px-4 py-3.5 text-right font-bold text-amber-700">Outstanding Payable (AP)</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    No supplier payables found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((s: any) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/suppliers/${s.id}`}
                        className="font-bold text-foreground hover:text-[#0071E3] transition-colors"
                      >
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-foreground">{s.drugLicenseNo}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{s.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      {s.creditPeriodDays} days
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-700 text-xs">
                      {formatCurrency(s.currentDue)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#0071E3]">
                        <Link href={`/suppliers/${s.id}`}>
                          <Eye className="h-3 w-3 mr-1" /> Profile
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
