"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Boxes,
  ArrowLeft,
  Download,
  Printer,
  Search,
  Building2,
  Tag,
  TrendingUp,
  Package,
  ArrowUpRight,
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

interface InventoryReportClientProps {
  reportData?: any;
  categories: any[];
  suppliers: any[];
}

export function InventoryReportClient({
  reportData,
  categories,
  suppliers,
}: InventoryReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get("category") || "ALL");
  const [selectedSupplier, setSelectedSupplier] = React.useState(searchParams.get("supplier") || "ALL");

  const data = reportData || {
    totalUnits: 0,
    totalBatches: 0,
    totalCostValuation: 0,
    totalSellingValuation: 0,
    potentialGrossProfit: 0,
    items: [],
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
    router.push(`/reports/inventory?${current.toString()}`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Medicine Brand",
      "Generic Name",
      "Category",
      "Manufacturer",
      "Batch Number",
      "Expiry Date",
      "Units on Hand",
      "Unit Cost (AFN)",
      "Trade Price (AFN)",
      "Cost Valuation (AFN)",
      "Potential Selling Revenue (AFN)",
    ];

    const rows = data.items.map((it: any) => [
      it.brandName,
      it.genericName,
      it.categoryName,
      it.supplierName,
      it.batchNumber,
      it.expiryDate,
      it.quantityOnHand,
      it.purchaseCost,
      it.tradePrice,
      it.inventoryValue,
      it.potentialRevenue,
    ]);

    exportToCSV("Warehouse_Inventory_Valuation_Report", headers, rows);
  };

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
        title="Warehouse Stock & Inventory Valuation Intelligence"
        description="Active batch quantities on hand, acquisition cost valuations, and potential gross revenue."
      />

      {/* 2. Top 4 Pastel KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Total Units on Hand</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {data.totalUnits.toLocaleString()} Units
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Across {data.totalBatches} active batches</div>
        </div>

        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Inventory Cost Valuation</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-700">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950 font-mono">
            {formatCurrency(data.totalCostValuation)}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Acquisition capital locked in warehouse</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Potential Selling Value</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.totalSellingValuation)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">At standard wholesale trade prices (TP)</div>
        </div>

        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Potential Gross Profit</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-700">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(data.potentialGrossProfit)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Realizable upon complete stock clearance</div>
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
            placeholder="Search medicine brand, generic name, batch #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-16 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm"
          />
        </form>

        <Select
          value={selectedCategory}
          onValueChange={(val) => {
            setSelectedCategory(val);
            applyFilters({ category: val });
          }}
        >
          <SelectTrigger className="h-10 text-xs rounded-xl w-[180px] bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSupplier}
          onValueChange={(val) => {
            setSelectedSupplier(val);
            applyFilters({ supplier: val });
          }}
        >
          <SelectTrigger className="h-10 text-xs rounded-xl w-[190px] bg-background">
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
                <th className="px-5 py-3.5">Medicine Product</th>
                <th className="px-4 py-3.5">Category & Manufacturer</th>
                <th className="px-4 py-3.5 font-mono">Batch #</th>
                <th className="px-4 py-3.5">Expiry Date</th>
                <th className="px-4 py-3.5 text-right">Units on Hand</th>
                <th className="px-4 py-3.5 text-right">Unit Cost</th>
                <th className="px-4 py-3.5 text-right">Trade Price</th>
                <th className="px-4 py-3.5 text-right">Cost Valuation</th>
                <th className="px-5 py-3.5 text-right">Potential Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">
                    No inventory batches found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                data.items.map((it: any) => (
                  <tr key={it.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-foreground">{it.brandName}</div>
                      <div className="text-[10px] text-muted-foreground">{it.genericName}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-foreground">{it.categoryName}</div>
                      <div className="text-[10px] text-muted-foreground">{it.supplierName}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-foreground">{it.batchNumber}</td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground whitespace-nowrap">
                      {it.expiryDate}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                      {it.quantityOnHand}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                      {formatCurrency(it.purchaseCost)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                      {formatCurrency(it.tradePrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-700">
                      {formatCurrency(it.inventoryValue)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(it.potentialRevenue)}
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
