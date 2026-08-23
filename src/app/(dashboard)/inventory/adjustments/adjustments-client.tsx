"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SlidersHorizontal,
  Plus,
  ArrowLeft,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  Package,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StockAdjustmentRecord } from "@/types/inventory";
import { MedicineRecord, BatchRecord } from "@/types/models";
import {
  stockAdjustmentFormSchema,
  StockAdjustmentFormValues,
} from "@/validations/adjustment.schema";
import {
  performStockAdjustmentAction,
  getStockAdjustmentsAction,
} from "@/server/actions/inventory.actions";

interface AdjustmentsClientProps {
  initialAdjustments: StockAdjustmentRecord[];
  medicines: MedicineRecord[];
  batches: BatchRecord[];
}

export function AdjustmentsClient({
  initialAdjustments,
  medicines,
  batches,
}: AdjustmentsClientProps) {
  const [adjustments, setAdjustments] = React.useState<StockAdjustmentRecord[]>(initialAdjustments);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentFormSchema),
    defaultValues: {
      medicineId: medicines[0]?.id || "",
      batchId: batches[0]?.id || "",
      adjustmentType: "DAMAGE_WRITE_OFF",
      quantityDelta: -5,
      reason: "",
      notes: "",
    },
  });

  const selectedMedicineId = watch("medicineId");
  const selectedBatchId = watch("batchId");
  const quantityDelta = watch("quantityDelta") || 0;
  const adjustmentType = watch("adjustmentType");

  const availableBatches = React.useMemo(() => {
    return batches.filter((b) => b.medicineId === selectedMedicineId);
  }, [batches, selectedMedicineId]);

  const currentBatch = React.useMemo(() => {
    return batches.find((b) => b.id === selectedBatchId);
  }, [batches, selectedBatchId]);

  const currentStock = currentBatch?.quantityOnHand || 0;
  const projectedStock = currentStock + Number(quantityDelta);
  const isNegativeGuardTriggered = projectedStock < 0;

  const refreshList = async () => {
    const res = await getStockAdjustmentsAction();
    if (res.success && res.data) {
      setAdjustments(res.data);
    }
  };

  const handleOpenCreate = () => {
    setFormError(null);
    const firstMed = medicines[0]?.id || "";
    const firstBatch = batches.find((b) => b.medicineId === firstMed)?.id || batches[0]?.id || "";
    reset({
      medicineId: firstMed,
      batchId: firstBatch,
      adjustmentType: "DAMAGE_WRITE_OFF",
      quantityDelta: -5,
      reason: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: StockAdjustmentFormValues) => {
    setFormError(null);

    if (projectedStock < 0) {
      setFormError(
        `Negative Stock Error: Adjustment of ${values.quantityDelta} would reduce stock below 0 (Current: ${currentStock}).`
      );
      return;
    }

    const res = await performStockAdjustmentAction(values);
    if (!res.success) {
      setFormError(res.error || "Failed to record adjustment");
      return;
    }

    setIsModalOpen(false);
    setActionMessage(res.message || "Stock adjustment recorded successfully.");
    setTimeout(() => setActionMessage(null), 3000);
    refreshList();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Stock Adjustments &amp; Physical Reconciliations"
          description="Voucher-based inventory reconciliation for damages, expiry removals, count discrepancies, and factory returns."
          badge={<Badge variant="outline">Stock Control</Badge>}
          actions={
            <Button onClick={handleOpenCreate} size="sm" className="h-9 text-xs gap-1.5 font-semibold">
              <Plus className="h-4 w-4" />
              Record Stock Adjustment
            </Button>
          }
        />
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Adjustments History Table */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {adjustments.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
              <SlidersHorizontal className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <div className="font-semibold text-foreground">No stock adjustments recorded.</div>
              <div className="text-[11px] mt-1">All inventory balances currently match verified batch ledgers.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3.5">Voucher #</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Medicine &amp; Batch</th>
                    <th className="p-3.5">Adjustment Type</th>
                    <th className="p-3.5 text-right">Adjustment Delta</th>
                    <th className="p-3.5 text-center">Stock Progression</th>
                    <th className="p-3.5 text-right">Unit Cost</th>
                    <th className="p-3.5 text-right">Total Impact</th>
                    <th className="p-3.5">Reason &amp; User</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-foreground">
                        {adj.referenceNumber || `ADJ-${adj.id.slice(-6)}`}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {formatDate(adj.createdAt)}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{adj.medicineName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Batch: {adj.batchNumber}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            adj.quantityDelta < 0
                              ? "destructive"
                              : "success"
                          }
                          className="text-[10px]"
                        >
                          {adj.adjustmentType}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right font-extrabold font-mono">
                        <span className={adj.quantityDelta < 0 ? "text-rose-600" : "text-emerald-600"}>
                          {adj.quantityDelta > 0 ? `+${adj.quantityDelta}` : adj.quantityDelta} units
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono text-muted-foreground">
                        <span>{adj.quantityBefore}</span>
                        <span className="mx-1 text-primary">→</span>
                        <span className="font-bold text-foreground">{adj.quantityAfter}</span>
                      </td>
                      <td className="p-3.5 text-right text-muted-foreground">
                        {formatCurrency(adj.unitCostPrice)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-foreground">
                        {formatCurrency(adj.totalLossAmount)}
                      </td>
                      <td className="p-3.5">
                        <div className="text-foreground max-w-xs truncate font-medium">{adj.reason}</div>
                        <div className="text-[10px] text-muted-foreground">By: {adj.userName || "Admin"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Stock Adjustment Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Record Stock Adjustment Voucher
            </DialogTitle>
            <DialogDescription className="text-xs">
              Every manual inventory correction creates an immutable stock movement and audit trail.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-1">
            {/* Medicine Selection */}
            <div className="space-y-1">
              <Label className="text-xs">Medicine SKU *</Label>
              <Select
                value={selectedMedicineId}
                onValueChange={(val) => {
                  setValue("medicineId", val);
                  const matchingBatch = batches.find((b) => b.medicineId === val)?.id || "";
                  setValue("batchId", matchingBatch);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Medicine" />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.brandName} ({m.genericName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Batch Selection */}
            <div className="space-y-1">
              <Label className="text-xs">Select Batch *</Label>
              <Select
                value={selectedBatchId}
                onValueChange={(val) => setValue("batchId", val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  {availableBatches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      Batch #{b.batchNumber} (Stock: {b.quantityOnHand} units, Exp: {b.expiryDate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Adjustment Type */}
            <div className="space-y-1">
              <Label className="text-xs">Adjustment Reason Code *</Label>
              <Select
                value={adjustmentType}
                onValueChange={(val: any) => setValue("adjustmentType", val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAMAGE_WRITE_OFF">Damage &amp; Breakage Write-Off</SelectItem>
                  <SelectItem value="EXPIRY_REMOVAL">Expired Stock Quarantine Removal</SelectItem>
                  <SelectItem value="COUNT_DISCREPANCY_ADD">Physical Count Discrepancy (Stock Addition)</SelectItem>
                  <SelectItem value="COUNT_DISCREPANCY_DEDUCT">Physical Count Discrepancy (Stock Deduction)</SelectItem>
                  <SelectItem value="RETURN_TO_SUPPLIER">Return Consignment to Manufacturer</SelectItem>
                  <SelectItem value="SAMPLE_GIVEN">Doctor / Representative Sample Given</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Delta */}
            <div className="space-y-1">
              <Label className="text-xs">
                Quantity Delta (Units) * (Use negative for reductions, positive for additions)
              </Label>
              <Input
                type="number"
                {...register("quantityDelta")}
                className="h-9 text-xs font-mono"
              />
              {errors.quantityDelta && (
                <p className="text-[11px] text-rose-600">{errors.quantityDelta.message}</p>
              )}
            </div>

            {/* Live Stock Progression Preview & Negative Protection */}
            <div
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                isNegativeGuardTriggered
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-400"
                  : "bg-muted/40 border-border"
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Stock Progression Preview</span>
                {isNegativeGuardTriggered && (
                  <Badge variant="destructive" className="text-[9px]">
                    Negative Stock Blocked
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span>Current Stock: <strong>{currentStock}</strong> units</span>
                <span>Adjustment: <strong className={Number(quantityDelta) < 0 ? "text-rose-600" : "text-emerald-600"}>{Number(quantityDelta) > 0 ? `+${quantityDelta}` : quantityDelta}</strong></span>
                <span>Projected New: <strong className={isNegativeGuardTriggered ? "text-rose-600 font-extrabold" : "text-foreground"}>{projectedStock}</strong> units</span>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <Label className="text-xs">Auditable Reason *</Label>
              <Input
                {...register("reason")}
                placeholder="e.g. Broken packaging discovered during quarterly warehouse count"
                className="h-9 text-xs"
              />
              {errors.reason && (
                <p className="text-[11px] text-rose-600">{errors.reason.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs">Internal Notes (Optional)</Label>
              <Textarea
                {...register("notes")}
                placeholder="Additional audit notes or incident report details..."
                className="text-xs resize-none"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || isNegativeGuardTriggered}
                className="h-9 text-xs font-semibold"
              >
                {isSubmitting ? "Processing..." : "Commit Adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
