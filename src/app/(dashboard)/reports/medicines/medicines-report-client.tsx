"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pill,
  ArrowLeft,
  Download,
  Printer,
  Search,
  TrendingUp,
  Award,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/export-utils";

interface MedicinesReportClientProps {
  reportData?: any;
}

export function MedicinesReportClient({ reportData }: MedicinesReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPreset = reportData?.preset || "this_month";
  const [search, setSearch] = React.useState("");

  const data = reportData || {
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    preset: "this_month",
    top10Selling: [],
    allItems: [],
  };

  const filteredItems = data.allItems.filter((it: any) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        it.brandName.toLowerCase().includes(q) ||
        it.genericName.toLowerCase().includes(q) ||
        it.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const applyPreset = (preset: string) => {
    router.push(`/reports/medicines?preset=${preset}`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Medicine Brand",
      "Generic Name",
      "Therapeutic Category",
      "Quantity Sold (Units)",
      "Sales Revenue (BDT)",
      "Historical COGS (BDT)",
      "Gross Profit (BDT)",
      "Gross Margin %",
    ];

    const rows = filteredItems.map((it: any) => [
      it.brandName,
      it.genericName,
      it.categoryName,
      it.quantitySold,
      it.salesRevenue,
      it.historicalCogs,
      it.grossProfit,
      `${it.marginPercent.toFixed(1)}%`,
    ]);

    exportToCSV(`Medicine_Performance_Report_${data.startDate}_to_${data.endDate}`, headers, rows);
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
        title="Fast-Moving Medicines & Product Profitability"
        description="Top-selling pharmaceutical products ranked by volume, revenue generation, and gross profit margins."
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

      {/* 2. Top 3 Fast-Moving Medicine Champions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.top10Selling.slice(0, 3).map((top: any, idx: number) => (
          <div
            key={top.medicineId}
            className={`border rounded-2xl p-4.5 shadow-sm relative overflow-hidden ${
              idx === 0
                ? "bg-sky-50/70 border-sky-100/80"
                : idx === 1
                ? "bg-emerald-50/70 border-emerald-100/80"
                : "bg-purple-50/70 border-purple-100/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rank #{idx + 1} Champion
              </span>
              <div className="h-7 w-7 rounded-lg bg-foreground/5 flex items-center justify-center font-bold text-xs">
                #{idx + 1}
              </div>
            </div>
            <div className="mt-2 text-lg font-bold text-foreground truncate">
              {top.brandName}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{top.genericName}</div>

            <div className="mt-3 pt-2.5 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block">Revenue</span>
                <span className="font-mono font-bold text-foreground">
                  {formatCurrency(top.salesRevenue)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">Volume Sold</span>
                <span className="font-mono font-bold text-foreground">{top.quantitySold} units</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medicine brand, generic name, category..."
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
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-4 py-3.5">Medicine Product</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-right">Units Sold</th>
                <th className="px-4 py-3.5 text-right">Billed Revenue</th>
                <th className="px-4 py-3.5 text-right">Batch COGS</th>
                <th className="px-4 py-3.5 text-right font-bold text-emerald-700">Gross Profit</th>
                <th className="px-5 py-3.5 text-right">Gross Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                    No medicine performance records found for this period.
                  </td>
                </tr>
              ) : (
                filteredItems.map((it: any, i: number) => (
                  <tr key={it.medicineId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-muted-foreground">
                      #{i + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/medicines/${it.medicineId}`} className="font-bold text-foreground hover:underline text-[#0071E3]">
                        {it.brandName}
                      </Link>
                      <div className="text-[10px] text-muted-foreground">{it.genericName}</div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{it.categoryName}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                      {it.quantitySold} units
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                      {formatCurrency(it.salesRevenue)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-rose-700">
                      {formatCurrency(it.historicalCogs)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(it.grossProfit)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-foreground">
                      {it.marginPercent.toFixed(1)}%
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
