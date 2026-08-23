"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Plus,
  Trash2,
  Building2,
  Calendar,
  DollarSign,
  Package,
  Layers,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Receipt,
  FileText,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { createPurchaseOrderAction } from "@/server/actions/purchase.actions";
import { PurchaseOrderInput, PurchaseItemInput } from "@/validations/purchase.schema";

interface PurchaseFormClientProps {
  suppliers: Array<{ id: string; name: string; code?: string | null; creditDays: number; currentPayable: number }>;
  medicines: Array<{
    id: string;
    brandName: string;
    genericName: string;
    dosageForm: string;
    strength: string;
    defaultTradePrice: number;
    defaultMrp: number;
    unitOfMeasure: string;
    supplierId?: string | null;
  }>;
  warehouses: Array<{ id: string; name: string; code: string; isDefault: boolean }>;
  preselectedSupplierId?: string;
}

export function PurchaseFormClient({
  suppliers,
  medicines,
  warehouses,
  preselectedSupplierId,
}: PurchaseFormClientProps) {
  const router = useRouter();

  const [supplierId, setSupplierId] = React.useState(
    preselectedSupplierId || suppliers[0]?.id || ""
  );
  const [supplierInvoiceNo, setSupplierInvoiceNo] = React.useState("");
  const [purchaseDate, setPurchaseDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = React.useState("");
  const [warehouseId, setWarehouseId] = React.useState(
    warehouses.find((w) => w.isDefault)?.id || warehouses[0]?.id || ""
  );
  const [notes, setNotes] = React.useState("");

  // Payment section
  const [paidAmount, setPaidAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<any>("BANK_TRANSFER");
  const [paymentReference, setPaymentReference] = React.useState("");

  // Line items state
  const defaultMed = medicines[0];
  const [items, setItems] = React.useState<PurchaseItemInput[]>([
    {
      medicineId: defaultMed?.id || "",
      batchNumber: `BX-${new Date().getFullYear()}-01`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString().split("T")[0],
      manufacturingDate: new Date().toISOString().split("T")[0],
      quantity: 100,
      bonusQuantity: 0,
      unitCostPrice: defaultMed ? Number((defaultMed.defaultTradePrice * 0.85).toFixed(2)) || 10 : 10,
      unitTradePrice: defaultMed ? defaultMed.defaultTradePrice : 12,
      unitMrp: defaultMed ? defaultMed.defaultMrp : 15,
      discountPercent: 0,
      taxPercent: 0,
      warehouseId: warehouseId || undefined,
    },
  ]);

  const [isReviewOpen, setIsReviewOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Selected supplier object
  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  // Handle line item change
  const updateItem = (index: number, field: keyof PurchaseItemInput, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // If medicine changed, auto-fill unitTradePrice & unitMrp
    if (field === "medicineId") {
      const med = medicines.find((m) => m.id === value);
      if (med) {
        updated[index].unitTradePrice = med.defaultTradePrice || 0;
        updated[index].unitMrp = med.defaultMrp || 0;
        updated[index].unitCostPrice = Number((med.defaultTradePrice * 0.85).toFixed(2)) || 0;
      }
    }

    setItems(updated);
  };

  const addItem = () => {
    const nextMed = medicines[items.length % medicines.length] || medicines[0];
    const newRow: PurchaseItemInput = {
      medicineId: nextMed?.id || "",
      batchNumber: `BX-${new Date().getFullYear()}-${String(items.length + 1).padStart(2, "0")}`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString().split("T")[0],
      manufacturingDate: new Date().toISOString().split("T")[0],
      quantity: 50,
      bonusQuantity: 0,
      unitCostPrice: nextMed ? Number((nextMed.defaultTradePrice * 0.85).toFixed(2)) || 10 : 10,
      unitTradePrice: nextMed ? nextMed.defaultTradePrice : 12,
      unitMrp: nextMed ? nextMed.defaultMrp : 15,
      discountPercent: 0,
      taxPercent: 0,
      warehouseId: warehouseId || undefined,
    };
    setItems([...items, newRow]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedItems = items.map((item) => {
    const lineSubtotal = (item.quantity || 0) * (item.unitCostPrice || 0);
    const lineDiscount = lineSubtotal * ((item.discountPercent || 0) / 100);
    const taxable = lineSubtotal - lineDiscount;
    const lineTax = taxable * ((item.taxPercent || 0) / 100);
    const lineTotal = taxable + lineTax;
    return {
      ...item,
      lineSubtotal,
      lineDiscount,
      lineTax,
      lineTotal,
    };
  });

  const subtotal = calculatedItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const totalDiscount = calculatedItems.reduce((sum, item) => sum + item.lineDiscount, 0);
  const totalTax = calculatedItems.reduce((sum, item) => sum + item.lineTax, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;
  const dueAmount = Math.max(0, grandTotal - paidAmount);
  const totalUnits = calculatedItems.reduce((sum, item) => sum + item.quantity + (item.bonusQuantity || 0), 0);

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!supplierId) {
      setErrorMessage("Please select a valid supplier.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("At least one medicine item must be added.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.medicineId) {
        setErrorMessage(`Item #${i + 1}: Please select a medicine.`);
        return;
      }
      if (!item.batchNumber?.trim()) {
        setErrorMessage(`Item #${i + 1}: Batch number is mandatory.`);
        return;
      }
      if (!item.expiryDate) {
        setErrorMessage(`Item #${i + 1}: Expiry date is mandatory.`);
        return;
      }
      if (item.quantity <= 0) {
        setErrorMessage(`Item #${i + 1}: Quantity must be greater than 0.`);
        return;
      }
      if (item.unitCostPrice <= 0) {
        setErrorMessage(`Item #${i + 1}: Unit cost price must be greater than 0.`);
        return;
      }
    }

    if (paidAmount > grandTotal) {
      setErrorMessage(`Upfront payment (৳${paidAmount.toLocaleString()}) cannot exceed Grand Total (৳${grandTotal.toLocaleString()}).`);
      return;
    }

    setIsReviewOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: PurchaseOrderInput = {
      supplierId,
      supplierInvoiceNo: supplierInvoiceNo.trim() || undefined,
      purchaseDate,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
      warehouseId: warehouseId || undefined,
      notes: notes.trim() || undefined,
      paidAmount,
      paymentMethod: paidAmount > 0 ? paymentMethod : undefined,
      paymentReference: paidAmount > 0 ? paymentReference.trim() : undefined,
      items: items.map((item) => ({
        ...item,
        warehouseId: warehouseId || undefined,
      })),
    };

    const res = await createPurchaseOrderAction(payload);
    setIsSubmitting(false);

    if (res.success) {
      setIsReviewOpen(false);
      router.push(`/purchases/${res.data.id}`);
    } else {
      setErrorMessage(res.error || "Failed to commit purchase consignment.");
      setIsReviewOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-9 px-2">
            <Link href="/purchases">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Purchases
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Direct Purchase Intake & Batch Creation
            </h1>
            <p className="text-xs text-muted-foreground">
              Book vendor consignment, register batch shelf-life, and commit stock to warehouse inventory.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg border bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setErrorMessage(null)} className="h-6 w-6 p-0">
            &times;
          </Button>
        </div>
      )}

      <form onSubmit={handleOpenReview} className="space-y-6">
        {/* Consignment Header Information Card */}
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Supplier & Consignment Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="supplier" className="text-xs font-semibold">
                  Supplier / Manufacturer <span className="text-rose-500">*</span>
                </Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger id="supplier" className="text-xs h-9">
                    <SelectValue placeholder="Select manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} (Due: {formatCurrency(s.currentPayable)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSupplier && (
                  <p className="text-[11px] text-muted-foreground">
                    Credit Terms: <strong className="text-foreground">Net {selectedSupplier.creditDays} Days</strong> • Outstanding Due:{" "}
                    <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(selectedSupplier.currentPayable)}</strong>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="supplierInvoiceNo" className="text-xs">
                  Supplier Invoice / Bill #
                </Label>
                <Input
                  id="supplierInvoiceNo"
                  placeholder="e.g., SQ-INV-2026-99"
                  className="text-xs h-9 font-mono"
                  value={supplierInvoiceNo}
                  onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="warehouse" className="text-xs font-semibold">
                  Receiving Warehouse <span className="text-rose-500">*</span>
                </Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger id="warehouse" className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purchaseDate" className="text-xs font-semibold">
                  Intake Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  required
                  className="text-xs h-9"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expectedDeliveryDate" className="text-xs">
                  Delivery / Arrival Date
                </Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  className="text-xs h-9"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="notes" className="text-xs">
                  Consignment Memo / Notes
                </Label>
                <Input
                  id="notes"
                  placeholder="e.g., Seasonal bulk stock intake with free bonus goods"
                  className="text-xs h-9"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Multi-Item Purchase Items Table */}
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Purchased Medicines & Batch Allocation ({items.length} Lines)
              </CardTitle>
              <CardDescription className="text-xs">
                Specify batch codes, manufacturing/expiry dates, purchased quantities, bonus goods, and unit rates.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Line Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border/50 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold min-w-[200px]">Medicine <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 font-semibold min-w-[130px]">Batch # <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 font-semibold min-w-[130px]">Mfg Date</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[130px]">Expiry Date <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 font-semibold min-w-[80px]">Qty <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 font-semibold min-w-[70px]">Bonus Qty</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[90px]">Cost (৳) <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 font-semibold min-w-[90px]">TP (৳)</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[90px]">MRP (৳)</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[70px]">Disc %</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[70px]">VAT %</th>
                    <th className="py-2.5 px-3 text-right font-semibold min-w-[100px]">Line Total (৳)</th>
                    <th className="py-2.5 px-2 text-center font-semibold w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {calculatedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      {/* Medicine Selector */}
                      <td className="py-2 px-3">
                        <Select
                          value={item.medicineId}
                          onValueChange={(val) => updateItem(idx, "medicineId", val)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select medicine" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {medicines.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.brandName} ({m.dosageForm} {m.strength})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Batch Number */}
                      <td className="py-2 px-2">
                        <Input
                          required
                          placeholder="Batch #"
                          className="h-8 text-xs font-mono"
                          value={item.batchNumber}
                          onChange={(e) => updateItem(idx, "batchNumber", e.target.value)}
                        />
                      </td>

                      {/* Mfg Date */}
                      <td className="py-2 px-2">
                        <Input
                          type="date"
                          className="h-8 text-xs"
                          value={item.manufacturingDate || ""}
                          onChange={(e) => updateItem(idx, "manufacturingDate", e.target.value)}
                        />
                      </td>

                      {/* Expiry Date */}
                      <td className="py-2 px-2">
                        <Input
                          type="date"
                          required
                          className="h-8 text-xs"
                          value={item.expiryDate}
                          onChange={(e) => updateItem(idx, "expiryDate", e.target.value)}
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          min={1}
                          required
                          className="h-8 text-xs font-mono"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 0)}
                        />
                      </td>

                      {/* Bonus Qty */}
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          min={0}
                          className="h-8 text-xs font-mono"
                          value={item.bonusQuantity}
                          onChange={(e) => updateItem(idx, "bonusQuantity", parseInt(e.target.value) || 0)}
                        />
                      </td>

                      {/* Cost Price */}
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          min={0.01}
                          required
                          className="h-8 text-xs font-mono"
                          value={item.unitCostPrice}
                          onChange={(e) => updateItem(idx, "unitCostPrice", parseFloat(e.target.value) || 0)}
                        />
                      </td>

                      {/* Trade Price */}
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          min={0.01}
                          className="h-8 text-xs font-mono"
                          value={item.unitTradePrice}
                          onChange={(e) => updateItem(idx, "unitTradePrice", parseFloat(e.target.value) || 0)}
                        />
                      </td>

                      {/* MRP */}
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          min={0.01}
                          className="h-8 text-xs font-mono"
                          value={item.unitMrp}
                          onChange={(e) => updateItem(idx, "unitMrp", parseFloat(e.target.value) || 0)}
                        />
                      </td>

                      {/* Discount % */}
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          max={100}
                          className="h-8 text-xs font-mono"
                          value={item.discountPercent}
                          onChange={(e) => updateItem(idx, "discountPercent", parseFloat(e.target.value) || 0)}
                        />
                      </td>

                      {/* Tax % */}
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          max={100}
                          className="h-8 text-xs font-mono"
                          value={item.taxPercent}
                          onChange={(e) => updateItem(idx, "taxPercent", parseFloat(e.target.value) || 0)}
                        />
                      </td>

                      {/* Line Total */}
                      <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                        {formatCurrency(item.lineTotal)}
                      </td>

                      {/* Delete */}
                      <td className="py-2 px-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={items.length <= 1}
                          onClick={() => removeItem(idx)}
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-muted/20 border-t border-border/50 flex justify-between items-center text-xs">
              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="gap-1.5 text-xs text-primary">
                <Plus className="h-3.5 w-3.5" />
                Add Another Medicine Line
              </Button>
              <div className="text-muted-foreground">
                Total Physical Units to Receive: <strong className="text-foreground font-mono">{totalUnits.toLocaleString()} units</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary & Payment Cockpit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border/60 shadow-sm md:col-span-2">
            <CardHeader className="p-4 border-b border-border/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                Upfront Supplier Payment Settlement (Optional)
              </CardTitle>
              <CardDescription className="text-xs">
                Record an instant partial or full payment disbursement against this purchase invoice.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="paidAmount" className="text-xs font-semibold">
                    Disbursed Payment Amount (৳)
                  </Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    step="0.01"
                    min={0}
                    max={grandTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="paymentMethod" className="text-xs font-semibold">
                    Payment Method
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="paymentMethod" className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer / NEFT</SelectItem>
                      <SelectItem value="CHEQUE">Bank Cheque</SelectItem>
                      <SelectItem value="CASH">Cash Payment</SelectItem>
                      <SelectItem value="MFS_BKASH_NAGAD">MFS (bKash/Nagad)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="paymentRef" className="text-xs">
                    Transaction / Cheque #
                  </Label>
                  <Input
                    id="paymentRef"
                    placeholder="e.g., TXN-998822"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Payment Status on Submission:</span>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${
                    paidAmount >= grandTotal && grandTotal > 0
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : paidAmount > 0
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  }`}
                >
                  {paidAmount >= grandTotal && grandTotal > 0
                    ? "PAID IN FULL"
                    : paidAmount > 0
                    ? "PARTIALLY PAID"
                    : "UNPAID (FULL DUE)"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Grand Totals Box */}
          <Card className="bg-card border-border/60 shadow-sm">
            <CardHeader className="p-4 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Invoice Breakdown</span>
                <Badge variant="outline" className="font-mono text-[10px]">BDT (৳)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Trade Discounts:</span>
                <span className="font-mono font-medium">- {formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>VAT / Taxes:</span>
                <span className="font-mono font-medium">+ {formatCurrency(totalTax)}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-baseline text-sm font-bold">
                <span className="text-foreground">Grand Total:</span>
                <span className="font-mono text-primary text-base">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1">
                <span>Upfront Paid:</span>
                <span className="font-mono font-semibold">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs font-bold text-rose-600 dark:text-rose-400 border-t border-dashed border-border/60 pt-2">
                <span>Remaining Due:</span>
                <span className="font-mono text-sm">{formatCurrency(dueAmount)}</span>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Review & Commit Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Review & Confirmation Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Confirm Purchase Intake & Stock Commitment
            </DialogTitle>
            <DialogDescription>
              Please verify the consignment financial summary before committing batches to active inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="p-3 bg-muted/40 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier:</span>
                <strong className="text-foreground">{selectedSupplier?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consignment Date:</span>
                <span className="font-mono">{purchaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Line Items:</span>
                <span className="font-semibold">{items.length} Medicines ({totalUnits} total units)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receiving Warehouse:</span>
                <span className="font-semibold">{warehouses.find((w) => w.id === warehouseId)?.name || "Central Warehouse"}</span>
              </div>
            </div>

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-foreground">Grand Total Amount:</span>
                <span className="font-mono font-bold text-primary">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upfront Disbursed Payment:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(paidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier Payable Due:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(dueAmount)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              ⚡ <strong>Automatic Actions upon Confirmation:</strong> Medicine batches will be generated or incremented in <code>MedicineBatch</code>, immutable <code>PURCHASE_IN</code> stock movements logged, and supplier financial ledger updated in a single atomic transaction.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsReviewOpen(false)}>
              Back to Edit
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="bg-primary hover:bg-primary/90 font-semibold text-primary-foreground gap-1.5"
            >
              {isSubmitting ? "Committing to Inventory..." : "Confirm & Save Consignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
