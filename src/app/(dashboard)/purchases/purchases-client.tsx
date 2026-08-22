"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Truck, Plus, FileSpreadsheet, PackageCheck, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { createPurchaseOrderAction } from "@/server/actions/purchase.actions";
import { PurchaseOrderInput, PurchaseItemInput } from "@/validations/purchase.schema";

interface PurchasesClientProps {
  initialPurchases: any[];
  suppliers: any[];
  medicines: any[];
}

export function PurchasesClient({
  initialPurchases,
  suppliers,
  medicines,
}: PurchasesClientProps) {
  const [purchases, setPurchases] = React.useState(initialPurchases);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Line item drafting
  const [supplierId, setSupplierId] = React.useState(suppliers[0]?.id || "");
  const [supplierInvoiceNo, setSupplierInvoiceNo] = React.useState("");
  const [purchaseDate, setPurchaseDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = React.useState<PurchaseItemInput[]>([
    {
      medicineId: medicines[0]?.id || "",
      batchNumber: "SQ-BAT-2601",
      expiryDate: "2027-12-31",
      quantity: 500,
      bonusQuantity: 25,
      unitCostPrice: 1.85,
      unitTradePrice: 2.20,
      unitMrp: 2.50,
      discountPercent: 0,
      taxPercent: 0,
    },
  ]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "poNumber",
      header: "PO & Consignment #",
      cell: ({ row }) => (
        <div className="space-y-0.5 font-mono">
          <div className="font-semibold text-foreground">{row.original.poNumber}</div>
          <div className="text-[11px] text-muted-foreground">
            Inv: {row.original.supplierInvoiceNo || "Direct Intake"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "supplierName",
      header: "Supplier / Manufacturer",
      cell: ({ row }) => (
        <span className="font-medium text-foreground text-xs">
          {row.original.supplierName}
        </span>
      ),
    },
    {
      accessorKey: "purchaseDate",
      header: "Intake Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.purchaseDate)}
        </span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "dueAmount",
      header: "Payable Due (AP)",
      cell: ({ row }) => (
        <span className={`font-semibold ${row.original.dueAmount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
          {formatCurrency(row.original.dueAmount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "RECEIVED" ? "success" : "secondary"}
          className="text-[10px]"
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

  const handleAddItem = () => {
    const defaultMed = medicines[0];
    setItems([
      ...items,
      {
        medicineId: defaultMed?.id || "",
        batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: "2027-12-31",
        quantity: 100,
        bonusQuantity: 0,
        unitCostPrice: defaultMed?.wholesaleBasePrice || 2.0,
        unitTradePrice: defaultMed?.unitTradePrice || 2.2,
        unitMrp: defaultMed?.unitMrp || 2.5,
        discountPercent: 0,
        taxPercent: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const payload: PurchaseOrderInput = {
      supplierId,
      supplierInvoiceNo,
      purchaseDate,
      items,
    };

    const res = await createPurchaseOrderAction(payload);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Purchase recorded." });
      const supplierObj = suppliers.find((s) => s.id === supplierId);
      const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.unitCostPrice, 0);

      setPurchases((prev) => [
        {
          id: `po-${Date.now()}`,
          poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          supplierId,
          supplierName: supplierObj?.name || "Direct Supplier",
          purchaseDate,
          supplierInvoiceNo,
          totalAmount,
          paidAmount: 0,
          dueAmount: totalAmount,
          status: "RECEIVED",
          itemsCount: items.length,
        },
        ...prev,
      ]);

      setTimeout(() => {
        setIsAddOpen(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to process intake." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement, PO & GRN Batch Intake"
        description="Record pharmaceutical consignment receipts, manufacturer batch inspection, shelf-life verification, and inventory commitment."
        badge={<Badge variant="outline">Module M04</Badge>}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-9">
                <Plus className="h-3.5 w-3.5" />
                New GRN Intake
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <PackageCheck className="h-5 w-5 text-primary" />
                  Goods Received Note (GRN) & Batch Intake Wizard
                </DialogTitle>
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

              <form onSubmit={handleCreatePurchase} className="space-y-5 text-xs">
                {/* Header Information */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Supplier / Manufacturer *</Label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="supplierInvoiceNo" className="text-xs font-medium">
                      Supplier Invoice / Challan #
                    </Label>
                    <Input
                      id="supplierInvoiceNo"
                      placeholder="e.g. SQ-INV-9941"
                      value={supplierInvoiceNo}
                      onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="purchaseDate" className="text-xs font-medium">
                      Intake Date *
                    </Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Received Medicine Batches ({items.length})
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                      className="text-xs h-7 gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Item Line
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 border rounded-lg bg-card space-y-3 relative"
                      >
                        <div className="grid grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px]">Medicine *</Label>
                            <Select
                              value={item.medicineId}
                              onValueChange={(val) => {
                                const selected = medicines.find((m) => m.id === val);
                                const updated = [...items];
                                updated[idx] = {
                                  ...updated[idx],
                                  medicineId: val,
                                  unitCostPrice: selected?.wholesaleBasePrice || 2.0,
                                  unitTradePrice: selected?.unitTradePrice || 2.2,
                                  unitMrp: selected?.unitMrp || 2.5,
                                };
                                setItems(updated);
                              }}
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {medicines.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.brandName} ({m.strength})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px]">Batch # *</Label>
                            <Input
                              value={item.batchNumber}
                              onChange={(e) => {
                                const updated = [...items];
                                updated[idx].batchNumber = e.target.value;
                                setItems(updated);
                              }}
                              placeholder="Batch Number"
                              required
                              className="text-xs h-8 font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px]">Expiry Date *</Label>
                            <Input
                              type="date"
                              value={item.expiryDate}
                              onChange={(e) => {
                                const updated = [...items];
                                updated[idx].expiryDate = e.target.value;
                                setItems(updated);
                              }}
                              required
                              className="text-xs h-8"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px]">Received Qty *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...items];
                                updated[idx].quantity = parseInt(e.target.value) || 0;
                                setItems(updated);
                              }}
                              required
                              className="text-xs h-8 font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px]">Bonus Qty</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.bonusQuantity}
                              onChange={(e) => {
                                const updated = [...items];
                                updated[idx].bonusQuantity = parseInt(e.target.value) || 0;
                                setItems(updated);
                              }}
                              className="text-xs h-8 text-emerald-600 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px]">Unit Cost (৳) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitCostPrice}
                              onChange={(e) => {
                                const updated = [...items];
                                updated[idx].unitCostPrice = parseFloat(e.target.value) || 0;
                                setItems(updated);
                              }}
                              required
                              className="text-xs h-8 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px]">Trade Price (TP ৳) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitTradePrice}
                              onChange={(e) => {
                                const updated = [...items];
                                updated[idx].unitTradePrice = parseFloat(e.target.value) || 0;
                                setItems(updated);
                              }}
                              required
                              className="text-xs h-8 font-medium"
                            />
                          </div>

                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              <Label className="text-[11px]">Line Cost</Label>
                              <div className="text-xs font-bold text-foreground h-8 flex items-center">
                                {formatCurrency(item.quantity * item.unitCostPrice)}
                              </div>
                            </div>

                            {items.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-rose-600 hover:text-rose-700 h-8 px-2 text-xs"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter className="pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                    {isSubmitting ? "Committing..." : "Commit GRN to Inventory"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={purchases}
        searchKey="poNumber"
        searchPlaceholder="Search PO # or supplier..."
      />
    </div>
  );
}
