"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  ArrowLeft,
  Download,
  Printer,
  AlertTriangle,
  PackageX,
  ShieldAlert,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/export-utils";

interface ExpiryReportClientProps {
  reportData?: any;
}

export function ExpiryReportClient({ reportData }: ExpiryReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState("");
  const [filterBucket, setFilterBucket] = React.useState<string>("ALL");

  const data = reportData || {
    warningDays: 60,
    expiredCount: 0,
    expiredValue: 0,
    nearExpiryCount: 0,
    nearExpiryValue: 0,
    totalAtRiskValue: 0,
    items: [],
  };

  const filteredItems = data.items.filter((it: any) => {
    if (filterBucket === "EXPIRED" && !it.isExpired) return false;
    if (filterBucket === "30D" && it.riskBucket !== "CRITICAL_30D") return false;
    if (filterBucket === "60D" && it.riskBucket !== "WARNING_60D") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        it.brandName.toLowerCase().includes(q) ||
        it.genericName.toLowerCase().includes(q) ||
        it.batchNumber.toLowerCase().includes(q) ||
        it.supplierName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      "Medicine Brand",
      "Generic Name",
      "Manufacturer Supplier",
      "Batch Number",
      "Quantity on Hand",
      "Expiry Date",
      "Days Remaining",
      "Unit Cost Price (BDT)",
      "Inventory Value at Risk (BDT)",
      "Status",
    ];

    const rows = filteredItems.map((it: any) => [
      it.brandName,
      it.genericName,
      it.supplierName,
      it.batchNumber,
      it.quantityOnHand,
      it.expiryDate,
      it.daysLeft,
      it.unitCostPrice,
      it.inventoryCostValue,
      it.isExpired ? "EXPIRED" : "NEAR_EXPIRY",
    ]);

    exportToCSV(`DGDA_Expiry_Watchdog_Report_${data.warningDays}days`, headers, rows);
  };

  const setDays = (days: number) => {
    router.push(`/reports/expiry?days=${days}`);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* 1. Top Header */}
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
        title="DGDA Expiry Watchdog & Quarantine Intelligence"
        description="Strict FEFO audit identifying expired stocks and batch expirations within customizable warning thresholds."
      >
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/80">
          {[30, 60, 90, 180].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                data.warningDays === d
                  ? "bg-white dark:bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d} Days Threshold
            </button>
          ))}
        </div>
      </PageHeader>

      {/* 2. Top 4 Pastel KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Expired Stock */}
        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Expired Batches</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-700">
              <PackageX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950 font-mono">
            {data.expiredCount} Batches
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            Value: {formatCurrency(data.expiredValue)} (Quarantine)
          </div>
        </div>

        {/* Near Expiry <= 30 Days */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Expiring in &le; 30 Days</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {data.items.filter((i: any) => i.riskBucket === "CRITICAL_30D").length} Batches
          </div>
          <div className="text-[11px] text-amber-600 mt-1">High dispatch priority</div>
        </div>

        {/* Near Expiry <= 60 Days */}
        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Expiring in &le; 60 Days</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {data.nearExpiryCount} Batches
          </div>
          <div className="text-[11px] text-purple-600 mt-1">
            Value: {formatCurrency(data.nearExpiryValue)}
          </div>
        </div>

        {/* Total Capital At Risk */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Total Capital at Risk</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(data.totalAtRiskValue)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Based on batch purchase costs</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medicine brand, generic name, batch #, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5 pr-4 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl">
          {[
            { label: `All At-Risk (${data.items.length})`, value: "ALL" },
            { label: `Expired (${data.expiredCount})`, value: "EXPIRED" },
            { label: "&le; 30 Days", value: "30D" },
            { label: "&le; 60 Days", value: "60D" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterBucket(f.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterBucket === f.value
                  ? "bg-white dark:bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Medicine Product</th>
                <th className="px-4 py-3.5">Manufacturer</th>
                <th className="px-4 py-3.5 font-mono">Batch #</th>
                <th className="px-4 py-3.5 text-right">Units on Hand</th>
                <th className="px-4 py-3.5">Expiry Date</th>
                <th className="px-4 py-3.5 text-center">Days Left</th>
                <th className="px-4 py-3.5 text-right">Unit Cost</th>
                <th className="px-4 py-3.5 text-right">Cost Value</th>
                <th className="px-5 py-3.5 text-center">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">
                    No medicine batches found matching the selected expiry criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((it: any) => (
                  <tr key={it.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-foreground">{it.brandName}</div>
                      <div className="text-[10px] text-muted-foreground">{it.genericName}</div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{it.supplierName}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-foreground">{it.batchNumber}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                      {it.quantityOnHand} units
                    </td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground whitespace-nowrap">
                      {it.expiryDate}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold">
                      {it.isExpired ? (
                        <span className="text-rose-600">Expired</span>
                      ) : (
                        <span className={it.daysLeft <= 30 ? "text-amber-600" : "text-purple-600"}>
                          {it.daysLeft} days
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                      {formatCurrency(it.unitCostPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-700">
                      {formatCurrency(it.inventoryCostValue)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {it.isExpired ? (
                        <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">
                          EXPIRED
                        </Badge>
                      ) : it.daysLeft <= 30 ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                          &le; 30 Days
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">
                          &le; 60 Days
                        </Badge>
                      )}
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
