"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Boxes,
  ArrowLeft,
  Thermometer,
  ShieldAlert,
  Search,
  DollarSign,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MedicineRecord, BatchRecord } from "@/types/models";
import { getBatchExpiryStatus } from "@/lib/expiry-utils";
import { batchFormSchema, BatchFormValues } from "@/validations/batch.schema";
import {
  createBatchAction,
  toggleBatchStatusAction,
  getBatchesByMedicineIdAction,
} from "@/server/actions/batch.actions";

interface MedicineDetailClientProps {
  medicine: MedicineRecord;
  initialBatches: BatchRecord[];
  warehouses: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function MedicineDetailClient({
  medicine,
  initialBatches,
  warehouses,
  suppliers,
}: MedicineDetailClientProps) {
  const [batches, setBatches] = React.useState<BatchRecord[]>(initialBatches);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState<"expiryDate" | "batchNumber" | "purchaseCostPrice" | "quantityOnHand">("expiryDate");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = React.useState(false);

  // Dialog States
  const [isAddBatchOpen, setIsAddBatchOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  // React Hook Form for Batch creation
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      medicineId: medicine.id,
      batchNumber: "",
      warehouseId: warehouses[0]?.id || "wh-001",
      rackId: "Rack-A1",
      supplierId: medicine.supplierId || suppliers[0]?.id || "",
      mfgDate: "",
      expiryDate: "",
      purchaseCostPrice: medicine.unitTradePrice * 0.85,
      tradePrice: medicine.unitTradePrice,
      mrp: medicine.unitMrp,
      initialQuantity: 100,
      status: "ACTIVE",
    },
  });

  const refreshBatches = async (
    q = search,
    st = statusFilter,
    sb = sortBy,
    so = sortOrder
  ) => {
    setIsLoading(true);
    try {
      const res = await getBatchesByMedicineIdAction(medicine.id, {
        search: q,
        status: st,
        sortBy: sb,
        sortOrder: so,
      });
      if (res.success && res.data) {
        setBatches(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    refreshBatches(val, statusFilter, sortBy, sortOrder);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    refreshBatches(search, val, sortBy, sortOrder);
  };

  const handleOpenAddBatch = () => {
    setFormError(null);
    reset({
      medicineId: medicine.id,
      batchNumber: "",
      warehouseId: warehouses[0]?.id || "wh-001",
      rackId: "Rack-A1",
      supplierId: medicine.supplierId || suppliers[0]?.id || "",
      mfgDate: "",
      expiryDate: "",
      purchaseCostPrice: medicine.unitTradePrice * 0.85,
      tradePrice: medicine.unitTradePrice,
      mrp: medicine.unitMrp,
      initialQuantity: 100,
      status: "ACTIVE",
    });
    setIsAddBatchOpen(true);
  };

  const onSubmitBatch = async (values: BatchFormValues) => {
    setFormError(null);
    const res = await createBatchAction(values);
    if (!res.success) {
      setFormError(res.error || "Failed to create batch");
      return;
    }

    setIsAddBatchOpen(false);
    setActionMessage(res.message || `Batch #${values.batchNumber} added successfully.`);
    setTimeout(() => setActionMessage(null), 3000);
    refreshBatches();
  };

  const handleToggleBatchStatus = async (
    batch: BatchRecord,
    newStatus: "ACTIVE" | "NEAR_EXPIRY" | "EXPIRED" | "QUARANTINED" | "EXHAUSTED"
  ) => {
    await toggleBatchStatusAction(batch.id, newStatus, medicine.id);
    setActionMessage(`Batch #${batch.batchNumber} status set to ${newStatus}.`);
    setTimeout(() => setActionMessage(null), 3000);
    refreshBatches();
  };

  const totalStock = batches.reduce((sum, b) => sum + b.quantityOnHand, 0);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href="/medicines">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={medicine.brandName}
          description={`${medicine.genericName} • ${medicine.strength} • ${medicine.dosageForm}`}
          badge={
            <Badge variant={medicine.status === "ACTIVE" ? "success" : "secondary"}>
              {medicine.status}
            </Badge>
          }
          actions={
            <Button onClick={handleOpenAddBatch} size="sm" className="h-9 text-xs gap-1.5 font-semibold">
              <Plus className="h-4 w-4" />
              Add Medicine Batch
            </Button>
          }
        />
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium animate-in fade-in">
          {actionMessage}
        </div>
      )}

      {/* Medicine Master Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Pricing Card */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              B2B Pricing Matrix
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trade Price (TP):</span>
              <span className="font-bold text-foreground">{formatCurrency(medicine.unitTradePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maximum Retail (MRP):</span>
              <span className="font-medium text-foreground">{formatCurrency(medicine.unitMrp)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-600 font-medium pt-1 border-t">
              <span>Retailer Margin:</span>
              <span>
                {Math.round(((medicine.unitMrp - medicine.unitTradePrice) / (medicine.unitTradePrice || 1)) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Packaging Hierarchy */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Packaging Hierarchy
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary Unit:</span>
              <span className="font-bold text-foreground">{medicine.primaryUnitName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sub-Unit Conversion:</span>
              <span className="font-medium text-foreground">
                1 Box = {medicine.stripPerBox || 10} Strips
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t">
              <span>Total Units per Box:</span>
              <span>{(medicine.stripPerBox || 10) * (medicine.unitsPerStrip || 10)} Tablets/Caps</span>
            </div>
          </CardContent>
        </Card>

        {/* Storage & Regulatory */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Storage &amp; Safeguards
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              {medicine.isColdChain ? (
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/40">
                  <Thermometer className="h-3 w-3 mr-1" /> Cold Chain (2-8°C)
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Room Temperature
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {medicine.isNarcotic ? (
                <Badge variant="destructive" className="text-[10px]">
                  <ShieldAlert className="h-3 w-3 mr-1" /> Narcotic / Controlled
                </Badge>
              ) : (
                <span className="text-[11px] text-muted-foreground">Standard Rx Pharmaceutical</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock & Reorder Threshold */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Stock Balance
            </CardTitle>
            <Boxes className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1 text-xs">
            <div className="text-2xl font-extrabold text-foreground">
              {totalStock.toLocaleString()}{" "}
              <span className="text-xs font-normal text-muted-foreground">units</span>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t">
              <span>Reorder Alert: {medicine.reorderAlertLevel} units</span>
              <span>{batches.length} Active Batches</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches Management Section */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" />
                Batch-Level Inventory &amp; Strict FEFO Tracking
              </CardTitle>
              <CardDescription className="text-xs">
                Each batch maintains its own distinct manufacturing date, expiry date, acquisition cost, and rack location.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search batch #..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Batches</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="QUARANTINED">Quarantined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {batches.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
              <Boxes className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <div className="font-semibold text-foreground">No batches registered for this medicine yet.</div>
              <div className="text-[11px] mt-1">Click &quot;Add Medicine Batch&quot; above to register an initial batch consignment.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3.5">Batch Number</th>
                    <th className="p-3.5">Warehouse &amp; Rack</th>
                    <th className="p-3.5">Mfg Date</th>
                    <th className="p-3.5">Expiry Date</th>
                    <th className="p-3.5 text-center">FEFO Expiry Status</th>
                    <th className="p-3.5 text-right">Purchase Cost</th>
                    <th className="p-3.5 text-right">Trade Price (TP)</th>
                    <th className="p-3.5 text-right">Quantity on Hand</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {batches.map((batch) => {
                    const expiry = getBatchExpiryStatus(batch.expiryDate);
                    return (
                      <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-foreground">
                          {batch.batchNumber}
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {batch.warehouseName}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {batch.rackName}
                          </div>
                        </td>
                        <td className="p-3.5 text-muted-foreground">
                          {batch.manufacturingDate ? formatDate(batch.manufacturingDate) : "—"}
                        </td>
                        <td className="p-3.5 font-medium text-foreground">
                          {formatDate(batch.expiryDate)}
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge variant={expiry.badgeVariant} className="text-[10px] gap-1">
                            <Clock className="h-3 w-3" />
                            {expiry.label}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right font-medium text-muted-foreground">
                          {formatCurrency(batch.unitCostPrice)}
                        </td>
                        <td className="p-3.5 text-right font-bold text-foreground">
                          {formatCurrency(batch.unitTradePrice)}
                        </td>
                        <td className="p-3.5 text-right">
                          <span
                            className={`font-extrabold ${
                              batch.quantityOnHand === 0
                                ? "text-rose-600"
                                : batch.quantityOnHand <= 50
                                ? "text-amber-600"
                                : "text-foreground"
                            }`}
                          >
                            {batch.quantityOnHand.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge
                            variant={
                              batch.status === "ACTIVE"
                                ? "success"
                                : batch.status === "QUARANTINED"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {batch.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          {batch.status === "QUARANTINED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleBatchStatus(batch, "ACTIVE")}
                              className="h-7 text-[10px] text-emerald-600 hover:text-emerald-700"
                            >
                              Release
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleBatchStatus(batch, "QUARANTINED")}
                              className="h-7 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            >
                              Quarantine
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Batch Dialog */}
      <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" />
              Add Batch Consignment: {medicine.brandName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record a distinct manufacturing lot, factory batch number, and expiration date.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitBatch)} className="space-y-3.5 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Batch Number *</Label>
                <Input
                  {...register("batchNumber")}
                  placeholder="e.g. SQ-NE-2608"
                  className="h-9 text-xs uppercase font-mono"
                />
                {errors.batchNumber && (
                  <p className="text-[11px] text-rose-600">{errors.batchNumber.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Warehouse Location *</Label>
                <Select
                  defaultValue={warehouses[0]?.id || "wh-001"}
                  onValueChange={(val) => setValue("warehouseId", val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Manufacturing Date (Mfg)</Label>
                <Input
                  type="date"
                  {...register("mfgDate")}
                  className="h-9 text-xs"
                />
                {errors.mfgDate && (
                  <p className="text-[11px] text-rose-600">{errors.mfgDate.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Expiration Date (Exp) *</Label>
                <Input
                  type="date"
                  {...register("expiryDate")}
                  className="h-9 text-xs"
                />
                {errors.expiryDate && (
                  <p className="text-[11px] text-rose-600">{errors.expiryDate.message}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
              <div className="text-xs font-bold text-foreground">Acquisition &amp; Pricing Parameters</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Purchase Cost (৳) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("purchaseCostPrice")}
                    className="h-9 text-xs font-mono"
                  />
                  {errors.purchaseCostPrice && (
                    <p className="text-[11px] text-rose-600">{errors.purchaseCostPrice.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Trade Price (৳) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("tradePrice")}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">MRP (৳) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("mrp")}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Initial Batch Stock Quantity *</Label>
                <Input
                  type="number"
                  {...register("initialQuantity")}
                  placeholder="100"
                  className="h-9 text-xs"
                />
                {errors.initialQuantity && (
                  <p className="text-[11px] text-rose-600">{errors.initialQuantity.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Rack Identification</Label>
                <Input
                  {...register("rackId")}
                  placeholder="e.g. Rack-B2-Top"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddBatchOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-9 text-xs font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Save Batch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
