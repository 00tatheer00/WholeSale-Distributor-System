"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Printer,
  PackageX,
  Plus,
  Phone,
  Search,
  ShoppingCart,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportToCSV } from "@/lib/export-utils";

interface LowStockReportClientProps {
  reportData?: any;
}

export function LowStockReportClient({ reportData }: LowStockReportClientProps) {
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState<"ALL" | "OUT" | "LOW">("ALL");

  const data = reportData || {
    outOfStockCount: 0,
    lowStockCount: 0,
    totalDeficitItems: 0,
    items: [],
  };

  const filteredItems = data.items.filter((it: any) => {
    if (filterType === "OUT" && it.status !== "OUT_OF_STOCK") return false;
    if (filterType === "LOW" && it.status !== "LOW_STOCK") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        it.brandName.toLowerCase().includes(q) ||
        it.genericName.toLowerCase().includes(q) ||
        it.supplierName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      "Medicine Brand",
      "Generic Name",
      "Dosage Form",
      "Category",
      "Primary Supplier",
      "Current Stock",
      "Minimum Stock Level",
      "Reorder Level",
      "Reorder Deficit Quantity",
      "Status",
    ];

    const rows = filteredItems.map((it: any) => [
      it.brandName,
      it.genericName,
      it.dosageForm,
      it.categoryName,
      it.supplierName,
      it.currentStock,
      it.minStockLevel,
      it.reorderLevel,
      it.reorderDeficit,
      it.status,
    ]);

    exportToCSV("Low_Stock_and_Reorder_Report", headers, rows);
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
        title="Low Stock & Reorder Deficit Intelligence"
        description="Real-time stock audit highlighting medicines at or below minimum threshold and zero-inventory outages."
      />

      {/* 2. Top 3 Pastel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Out of Stock */}
        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Out of Stock Outages</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-700">
              <PackageX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950 font-mono">
            {data.outOfStockCount} Products
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Zero units available in warehouse</div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Low Stock Warnings</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {data.lowStockCount} Products
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Stock on hand &le; min threshold</div>
        </div>

        {/* Total Reorder Deficit Items */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Procurement Actions</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {data.totalDeficitItems} Purchase Orders
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Suggested supplier replenishments</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medicine brand, generic name, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5 pr-4 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl">
          {[
            { label: `All Deficits (${data.items.length})`, value: "ALL" },
            { label: `Out of Stock (${data.outOfStockCount})`, value: "OUT" },
            { label: `Low Stock (${data.lowStockCount})`, value: "LOW" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterType === f.value
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
                <th className="px-4 py-3.5 text-right">Current Stock</th>
                <th className="px-4 py-3.5 text-right">Min Level</th>
                <th className="px-4 py-3.5 text-right">Reorder Level</th>
                <th className="px-4 py-3.5 text-right font-bold text-rose-700">Reorder Deficit</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                    All medicines have healthy stock above their configured minimum levels.
                  </td>
                </tr>
              ) : (
                filteredItems.map((it: any) => (
                  <tr key={it.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-foreground">{it.brandName}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {it.genericName} • {it.dosageForm}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-foreground">{it.supplierName}</div>
                      <div className="text-[10px] text-muted-foreground">{it.supplierPhone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold">
                      {it.currentStock === 0 ? (
                        <span className="text-rose-600">0 units</span>
                      ) : (
                        <span className="text-amber-700">{it.currentStock} units</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                      {it.minStockLevel}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                      {it.reorderLevel}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600">
                      +{it.reorderDeficit} units
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {it.status === "OUT_OF_STOCK" ? (
                        <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">
                          Out of Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                          Low Stock
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        asChild
                        size="sm"
                        className="h-7 text-xs bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-lg px-2.5"
                      >
                        <Link href="/purchases/new">
                          <Plus className="h-3 w-3 mr-1" /> Order
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
