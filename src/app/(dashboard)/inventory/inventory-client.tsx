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
  PackagePlus,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  getInventoryAction,
  updateBatchAction,
  deleteBatchAction,
} from "@/server/actions/inventory.actions";

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

  // Edit & Delete Batch state
  const [editingBatch, setEditingBatch] = React.useState<InventoryItemRecord | null>(null);
  const [editForm, setEditForm] = React.useState({
    batchNumber: "",
    expiryDate: "",
    quantityOnHand: 0,
    purchaseCostPrice: 0,
    tradePrice: 0,
    mrp: 0,
    rackName: "",
  });
  const [deletingBatch, setDeletingBatch] = React.useState<InventoryItemRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleOpenEdit = (b: InventoryItemRecord) => {
    setEditingBatch(b);
    setEditForm({
      batchNumber: b.batchNumber,
      expiryDate: b.expiryDate ? b.expiryDate.split("T")[0] : "",
      quantityOnHand: b.quantityOnHand,
      purchaseCostPrice: b.purchaseCostPrice,
      tradePrice: b.tradePrice,
      mrp: b.mrp,
      rackName: b.rackName || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    setIsSubmitting(true);
    setFeedback(null);
    const res = await updateBatchAction(editingBatch.id || editingBatch.batchId, {
      batchNumber: editForm.batchNumber,
      expiryDate: editForm.expiryDate,
      quantityOnHand: Number(editForm.quantityOnHand),
      purchaseCostPrice: Number(editForm.purchaseCostPrice),
      tradePrice: Number(editForm.tradePrice),
      mrp: Number(editForm.mrp),
      location: editForm.rackName,
    });
    setIsSubmitting(false);
    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Batch updated successfully." });
      setEditingBatch(null);
      refreshInventory();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to update batch." });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBatch) return;
    setIsSubmitting(true);
    setFeedback(null);
    const res = await deleteBatchAction(deletingBatch.id || deletingBatch.batchId);
    setIsSubmitting(false);
    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Batch deleted permanently." });
      setDeletingBatch(null);
      refreshInventory();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to delete batch." });
    }
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
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenEdit(row.original)}
            className="h-8 px-2 text-xs font-semibold text-primary hover:bg-primary/10 gap-1 rounded-lg"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeletingBatch(row.original)}
            className="h-8 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1 rounded-lg"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine Stock & Batches (Inventory)"
        description="Available pharmaceutical stock, batch expiry dates, godown locations, and stock valuation."
        badge={<Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50">Live Stock Cockpit</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="h-9 text-xs gap-1.5 font-bold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm rounded-xl">
              <Link href="/purchases/new">
                <PackagePlus className="h-4 w-4" />
                + Add New Stock (Factory Intake)
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5 font-semibold rounded-xl border-amber-300 hover:bg-amber-50 text-amber-800 dark:border-amber-800 dark:text-amber-300">
              <Link href="/inventory/adjustments">
                <SlidersHorizontal className="h-4 w-4 text-amber-600" />
                ± Correct Stock / Damage
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-1.5 rounded-xl border-border">
              <Link href="/inventory/movements">
                <History className="h-4 w-4 text-muted-foreground" />
                Stock In/Out History
              </Link>
            </Button>
          </div>
        }
      />

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Helper Banner for Idiot-Proof Clarity */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/20">
            <PackagePlus className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-foreground">Want to add new medicines received from factory?</div>
            <div className="text-muted-foreground">Click the blue &ldquo;+ Add New Stock&rdquo; button above to record invoice, batch number, and expiry date.</div>
          </div>
        </div>
        <Button size="sm" asChild className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white shrink-0 font-bold rounded-xl shadow-sm">
          <Link href="/purchases/new">
            + Add Stock Now
          </Link>
        </Button>
      </div>

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

      {/* 1. Edit Batch Modal */}
      <Dialog open={!!editingBatch} onOpenChange={(open) => !open && setEditingBatch(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Medicine Batch Stock
            </DialogTitle>
          </DialogHeader>

          {editingBatch && (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/50 border space-y-1">
                <div className="font-bold text-foreground text-sm">{editingBatch.brandName}</div>
                <div className="text-muted-foreground">{editingBatch.genericName} • {editingBatch.strength}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Batch Number *</Label>
                  <Input
                    required
                    value={editForm.batchNumber}
                    onChange={(e) => setEditForm({ ...editForm, batchNumber: e.target.value })}
                    className="h-9 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Expiry Date *</Label>
                  <Input
                    required
                    type="date"
                    value={editForm.expiryDate}
                    onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Stock Quantity (Units) *</Label>
                  <Input
                    required
                    type="number"
                    min="0"
                    value={editForm.quantityOnHand}
                    onChange={(e) => setEditForm({ ...editForm, quantityOnHand: Number(e.target.value) })}
                    className="h-9 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Rack / Storage Location</Label>
                  <Input
                    placeholder="Shelf / Rack A-1"
                    value={editForm.rackName}
                    onChange={(e) => setEditForm({ ...editForm, rackName: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Cost Price (Afs.) *</Label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.purchaseCostPrice}
                    onChange={(e) => setEditForm({ ...editForm, purchaseCostPrice: Number(e.target.value) })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Trade Price (Afs.) *</Label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.tradePrice}
                    onChange={(e) => setEditForm({ ...editForm, tradePrice: Number(e.target.value) })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">MRP (Afs.) *</Label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.mrp}
                    onChange={(e) => setEditForm({ ...editForm, mrp: Number(e.target.value) })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBatch(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold"
                >
                  {isSubmitting ? "Saving..." : "Save Batch Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Permanent Delete Confirmation Modal */}
      <Dialog open={!!deletingBatch} onOpenChange={(open) => !open && setDeletingBatch(null)}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Permanently Delete Stock Batch?
            </DialogTitle>
          </DialogHeader>

          {deletingBatch && (
            <div className="space-y-3 pt-2 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Are you sure you want to permanently delete batch <strong className="text-foreground font-mono">{deletingBatch.batchNumber}</strong> for <strong className="text-foreground">{deletingBatch.brandName}</strong>?
              </p>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 space-y-1">
                <div className="font-bold">⚠️ Irreversible Action</div>
                <div>This will permanently remove this batch and all related inventory records from the system.</div>
              </div>

              <DialogFooter className="gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingBatch(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={handleConfirmDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {isSubmitting ? "Deleting..." : "Yes, Delete Permanently"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
