"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  Boxes,
  ArrowRightLeft,
  AlertTriangle,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  History,
  Clock,
  MapPin,
  RefreshCw,
  TrendingDown,
  DollarSign,
  Package,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  InventoryItemRecord,
  InventorySummaryMetrics,
} from "@/types/inventory";
import { CategoryRecord } from "@/types/models";
import { getInventoryAction } from "@/server/actions/inventory.actions";

interface InventoryClientProps {
  initialItems: InventoryItemRecord[];
  initialSummary: InventorySummaryMetrics;
  categories: CategoryRecord[];
  suppliers: { id: string; name: string }[];
  totalCount: number;
  totalPages: number;
  initialPage: number;
}

export function InventoryClient({
  initialItems,
  initialSummary,
  categories,
  suppliers,
  totalCount: initialTotalCount,
  totalPages: initialTotalPages,
  initialPage,
}: InventoryClientProps) {
  const [items, setItems] = React.useState<InventoryItemRecord[]>(initialItems);
  const [summary] = React.useState<InventorySummaryMetrics>(initialSummary);
  const [totalCount, setTotalCount] = React.useState(initialTotalCount);
  const [totalPages, setTotalPages] = React.useState(initialTotalPages);
  const [page, setPage] = React.useState(initialPage);

  // Filters State
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [selectedSupplier, setSelectedSupplier] = React.useState("ALL");
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshInventory = async (
    newPage = page,
    q = search,
    st = statusFilter,
    cat = selectedCategory,
    sup = selectedSupplier
  ) => {
    setIsLoading(true);
    try {
      const res = await getInventoryAction({
        page: newPage,
        pageSize: 20,
        search: q,
        statusFilter: st,
        categoryId: cat,
        supplierId: sup,
      });

      if (res.success && res.data) {
        setItems(res.data);
        if (res.totalCount !== undefined) setTotalCount(res.totalCount);
        if (res.totalPages !== undefined) setTotalPages(res.totalPages);
        setPage(newPage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    refreshInventory(1, val, statusFilter, selectedCategory, selectedSupplier);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    refreshInventory(1, search, val, selectedCategory, selectedSupplier);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    refreshInventory(1, search, statusFilter, val, selectedSupplier);
  };

  const handleSupplierChange = (val: string) => {
    setSelectedSupplier(val);
    refreshInventory(1, search, statusFilter, selectedCategory, val);
  };

  const columns: ColumnDef<InventoryItemRecord>[] = [
    {
      accessorKey: "brandName",
      header: "Medicine & Formulation",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Link
              href={`/medicines/${row.original.medicineId}`}
              className="text-primary hover:underline font-bold"
            >
              {row.original.brandName}
            </Link>
            <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 h-4">
              {row.original.dosageForm}
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {row.original.genericName} • <strong>{row.original.strength}</strong>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "batchNumber",
      header: "Batch & Location",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-foreground">
            {row.original.batchNumber}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{row.original.warehouseName}</span>
            <span className="font-mono text-primary font-medium">({row.original.rackName})</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry & FEFO Status",
      cell: ({ row }) => {
        const isExpired = row.original.expiryStatus === "EXPIRED";
        const isCritical = row.original.expiryStatus === "NEAR_EXPIRY_CRITICAL";
        const isWarning = row.original.expiryStatus === "NEAR_EXPIRY_WARNING";

        return (
          <div className="space-y-1">
            <div className="font-mono text-xs text-foreground font-medium">
              {formatDate(row.original.expiryDate)}
            </div>
            <div>
              <Badge
                variant={
                  isExpired || isCritical
                    ? "destructive"
                    : isWarning
                    ? "warning"
                    : "success"
                }
                className="text-[10px] gap-1 px-1.5 py-0"
              >
                <Clock className="h-2.5 w-2.5" />
                {isExpired
                  ? `Expired (${Math.abs(row.original.daysToExpiry)}d ago)`
                  : `${row.original.daysToExpiry}d left`}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "purchaseCostPrice",
      header: "Acquisition Cost",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-medium text-foreground">
            {formatCurrency(row.original.purchaseCostPrice)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            TP: {formatCurrency(row.original.tradePrice)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "quantityOnHand",
      header: "Stock Balance",
      cell: ({ row }) => {
        const qty = row.original.quantityOnHand;
        const low = row.original.reorderAlertLevel;
        const isOut = qty === 0;
        const isLow = qty > 0 && qty <= low;

        return (
          <div className="space-y-0.5">
            <div
              className={`font-extrabold text-sm ${
                isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-foreground"
              }`}
            >
              {qty.toLocaleString()} {row.original.primaryUnitName}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Valuation: {formatCurrency(qty * row.original.purchaseCostPrice)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Stock Status",
      cell: ({ row }) => {
        const isExpired = row.original.expiryStatus === "EXPIRED";
        const isOut = row.original.quantityOnHand === 0;
        const isLow = row.original.quantityOnHand > 0 && row.original.quantityOnHand <= row.original.reorderAlertLevel;

        if (isExpired) {
          return <Badge variant="destructive">EXPIRED</Badge>;
        }
        if (isOut) {
          return <Badge variant="destructive">OUT OF STOCK</Badge>;
        }
        if (isLow) {
          return <Badge variant="warning">LOW STOCK</Badge>;
        }
        return <Badge variant="success">IN STOCK</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Inventory & FEFO Ledger"
        description="Authoritative batch-level pharmaceutical stock balances, historical purchase cost valuation, and FEFO expiry queues."
        badge={<Badge variant="outline">Engine Module M04</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5">
              <Link href="/inventory/movements">
                <History className="h-4 w-4 text-primary" />
                Movement Ledger
              </Link>
            </Button>

            <Button size="sm" asChild className="h-9 text-xs gap-1.5 font-semibold">
              <Link href="/inventory/adjustments">
                <SlidersHorizontal className="h-4 w-4" />
                Stock Adjustments
              </Link>
            </Button>
          </div>
        }
      />

      {/* Real-time KPI Summary Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Stock Units */}
        <Card className="border border-border/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Available Units</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {summary.totalStockUnits.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Across {summary.totalInventoryItems} tracked batches
            </div>
          </CardContent>
        </Card>

        {/* Total Valuation */}
        <Card className="border border-border/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Asset Valuation</span>
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-violet-600 mt-1">
              {formatCurrency(summary.inventoryPurchaseValue)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Exact historical batch acquisition cost
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border border-border/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Reorder Alerts</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {summary.lowStockCount} SKUs
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {summary.outOfStockCount} out of stock
            </div>
          </CardContent>
        </Card>

        {/* Expiry Alerts */}
        <Card className="border border-border/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">FEFO Expiry Alerts</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">
              {summary.nearExpiryCount} Batches
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {summary.expiredCount} expired batches in quarantine
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-card p-3 rounded-lg border">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by brand name, generic, batch #, SKU..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Batches</SelectItem>
            <SelectItem value="ACTIVE">Active in Stock</SelectItem>
            <SelectItem value="LOW_STOCK">Low Stock (Reorder Alert)</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Out of Stock (Zero Balance)</SelectItem>
            <SelectItem value="NEAR_EXPIRY">Near Expiry (&lt;90d)</SelectItem>
            <SelectItem value="EXPIRED">Expired Batches</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All Categories" />
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

        {/* Supplier Filter */}
        <Select value={selectedSupplier} onValueChange={handleSupplierChange}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="All Manufacturers" />
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

      {/* Main Inventory DataTable */}
      <DataTable
        columns={columns}
        data={items}
        searchKey="brandName"
        searchPlaceholder="Filter batch table..."
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Showing {items.length} of {totalCount} total inventory batches (Page {page} of {totalPages || 1})
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshInventory(page - 1)}
            disabled={page <= 1 || isLoading}
            className="h-8 text-xs gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshInventory(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="h-8 text-xs gap-1"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
