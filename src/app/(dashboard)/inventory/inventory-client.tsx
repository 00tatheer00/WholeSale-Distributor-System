"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Boxes, ArrowRightLeft, AlertTriangle, ShieldCheck, Plus, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FefoBatchBadge } from "@/components/shared/fefo-batch-badge";
import { adjustStockAction } from "@/server/actions/inventory.actions";
import { StockAdjustmentInput } from "@/validations/inventory.schema";

interface InventoryClientProps {
  initialBatches: any[];
  warehouses: any[];
}

export function InventoryClient({ initialBatches, warehouses }: InventoryClientProps) {
  const [batches, setBatches] = React.useState(initialBatches);
  const [activeTab, setActiveTab] = React.useState("all");
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [adjustForm, setAdjustForm] = React.useState<StockAdjustmentInput>({
    batchId: initialBatches[0]?.id || "",
    adjustmentType: "DAMAGE_WRITE_OFF",
    quantityChange: 1,
    reason: "",
  });

  const filteredBatches = React.useMemo(() => {
    if (activeTab === "near_expiry") {
      return batches.filter((b) => b.status === "NEAR_EXPIRY" || b.status === "EXPIRED");
    }
    if (activeTab === "active") {
      return batches.filter((b) => b.status === "ACTIVE" && b.quantityOnHand > 0);
    }
    if (activeTab === "quarantine") {
      return batches.filter((b) => b.isQuarantined || b.status === "QUARANTINED");
    }
    return batches;
  }, [batches, activeTab]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "medicineName",
      header: "Medicine & Batch",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">{row.original.medicineName}</div>
          <div className="text-[11px] text-muted-foreground">{row.original.genericName}</div>
          <div>
            <FefoBatchBadge
              batchNumber={row.original.batchNumber}
              expiryDate={row.original.expiryDate}
              showDays={true}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-foreground font-medium">
          {formatDate(row.original.expiryDate)}
        </span>
      ),
    },
    {
      accessorKey: "quantityOnHand",
      header: "Stock On Hand",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-foreground">
            {row.original.quantityOnHand} units
          </div>
          <div className="text-[10px] text-muted-foreground">
            Init: {row.original.initialQuantity} units
          </div>
        </div>
      ),
    },
    {
      accessorKey: "unitCostPrice",
      header: "Unit Cost / TP",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-semibold text-foreground">
            Cost: {formatCurrency(row.original.unitCostPrice)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            TP: {formatCurrency(row.original.unitTradePrice)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "warehouseName",
      header: "Location",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-medium text-foreground">{row.original.warehouseName}</div>
          <div className="text-[11px] text-muted-foreground">Rack: <strong>{row.original.rackName}</strong></div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant={
              s === "ACTIVE"
                ? "success"
                : s === "NEAR_EXPIRY"
                ? "warning"
                : "destructive"
            }
            className="text-[10px]"
          >
            {s}
          </Badge>
        );
      },
    },
  ];

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await adjustStockAction(adjustForm);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Stock adjusted." });
      // Update local batch stock
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id === adjustForm.batchId) {
            const isDeduct =
              adjustForm.adjustmentType !== "COUNT_DISCREPANCY_ADD";
            const newQty = isDeduct
              ? Math.max(0, b.quantityOnHand - adjustForm.quantityChange)
              : b.quantityOnHand + adjustForm.quantityChange;
            return { ...b, quantityOnHand: newQty };
          }
          return b;
        })
      );
      setTimeout(() => {
        setIsAdjustOpen(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: "error", message: res.error || "Adjustment failed." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Inventory & FEFO Control"
        description="First-Expire, First-Out (FEFO) batch lifecycle control, shelf-life monitoring, warehouse rack allocation, and audit adjustments."
        badge={<Badge variant="outline">Module M05</Badge>}
        actions={
          <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Record Stock Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Stock Adjustment & Write-Off</DialogTitle>
              </DialogHeader>

              {feedback && (
                <div
                  className={`p-3 rounded-md text-xs font-medium ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Target Batch *</Label>
                  <Select
                    value={adjustForm.batchId}
                    onValueChange={(val) => setAdjustForm({ ...adjustForm, batchId: val })}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.medicineName} ({b.batchNumber} - {b.quantityOnHand} units)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Adjustment Type *</Label>
                  <Select
                    value={adjustForm.adjustmentType}
                    onValueChange={(val: any) =>
                      setAdjustForm({ ...adjustForm, adjustmentType: val })
                    }
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAMAGE_WRITE_OFF">Damaged in Transit / Warehouse Write-off</SelectItem>
                      <SelectItem value="EXPIRY_REMOVAL">Expired Stock Removal & Destruction</SelectItem>
                      <SelectItem value="COUNT_DISCREPANCY_DEDUCT">Physical Count Discrepancy (Deduct)</SelectItem>
                      <SelectItem value="COUNT_DISCREPANCY_ADD">Physical Count Discrepancy (Add)</SelectItem>
                      <SelectItem value="RETURN_TO_SUPPLIER">Return to Manufacturer / Supplier</SelectItem>
                      <SelectItem value="SAMPLE_GIVEN">Doctor Sample / Promotional Dispensation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quantityChange" className="text-xs font-medium">
                    Adjustment Quantity (Units) *
                  </Label>
                  <Input
                    id="quantityChange"
                    type="number"
                    min="1"
                    value={adjustForm.quantityChange}
                    onChange={(e) =>
                      setAdjustForm({
                        ...adjustForm,
                        quantityChange: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-xs font-medium">
                    Mandatory Audit Reason Code *
                  </Label>
                  <Input
                    id="reason"
                    placeholder="e.g. Broken ampoules during warehouse unboxing"
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdjustOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adjusting..." : "Commit Adjustment"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="all">All Batches</TabsTrigger>
          <TabsTrigger value="active">Active Stock</TabsTrigger>
          <TabsTrigger value="near_expiry">Near Expiry</TabsTrigger>
          <TabsTrigger value="quarantine">Quarantine</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={filteredBatches}
        searchKey="medicineName"
        searchPlaceholder="Search medicine name, batch #..."
      />
    </div>
  );
}
