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
import { createSupplierAction } from "@/server/actions/supplier.actions";
import { createWarehouseAction } from "@/server/actions/warehouse.actions";
import { PurchaseOrderInput, PurchaseItemInput } from "@/validations/purchase.schema";
import { useUiMode } from "@/providers/ui-mode-provider";

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
  const { isSimple } = useUiMode();

  const [supplierList, setSupplierList] = React.useState(suppliers);
  const [warehouseList, setWarehouseList] = React.useState(warehouses);

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

  // Quick Add Supplier Dialog State
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = React.useState(false);
  const [quickSupplier, setQuickSupplier] = React.useState({
    name: "",
    phone: "",
    address: "",
    creditDays: 30,
    creditLimit: 500000,
  });
  const [isSavingQuickSupplier, setIsSavingQuickSupplier] = React.useState(false);

  // Quick Add Warehouse Dialog State
  const [isQuickWarehouseOpen, setIsQuickWarehouseOpen] = React.useState(false);
  const [quickWarehouse, setQuickWarehouse] = React.useState({
    name: "",
    code: "",
    location: "",
  });
  const [isSavingQuickWarehouse, setIsSavingQuickWarehouse] = React.useState(false);

  const handleSaveQuickSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSupplier.name.trim() || !quickSupplier.phone.trim()) {
      alert("Supplier Name and Phone are required.");
      return;
    }
    setIsSavingQuickSupplier(true);
    const res = await createSupplierAction({
      name: quickSupplier.name.trim(),
      phone: quickSupplier.phone.trim(),
      address: quickSupplier.address.trim() || null,
      creditDays: Number(quickSupplier.creditDays) || 30,
      creditLimit: Number(quickSupplier.creditLimit) || 500000,
      openingBalance: 0,
      country: "Pakistan",
      status: "ACTIVE",
    });
    setIsSavingQuickSupplier(false);
    if (res.success && res.data) {
      const newSup = {
        id: res.data.id,
        name: res.data.name,
        code: res.data.code,
        creditDays: res.data.creditDays || 30,
        currentPayable: 0,
      };
      setSupplierList([newSup, ...supplierList]);
      setSupplierId(newSup.id);
      setIsQuickSupplierOpen(false);
      setQuickSupplier({ name: "", phone: "", address: "", creditDays: 30, creditLimit: 500000 });
    } else {
      alert(res.error || "Failed to create supplier.");
    }
  };

  const handleSaveQuickWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickWarehouse.name.trim() || !quickWarehouse.code.trim()) {
      alert("Warehouse Name and Code are required.");
      return;
    }
    setIsSavingQuickWarehouse(true);
    const res = await createWarehouseAction({
      name: quickWarehouse.name.trim(),
      code: quickWarehouse.code.trim().toUpperCase(),
      location: quickWarehouse.location.trim() || "Main Facility",
      isDefault: false,
      isActive: true,
    });
    setIsSavingQuickWarehouse(false);
    if (res.success && res.data) {
      const newWh = {
        id: res.data.id,
        name: res.data.name,
        code: res.data.code,
        isDefault: false,
      };
      setWarehouseList([newWh, ...warehouseList]);
      setWarehouseId(newWh.id);
      setIsQuickWarehouseOpen(false);
      setQuickWarehouse({ name: "", code: "", location: "" });
    } else {
      alert(res.error || "Failed to create warehouse.");
    }
  };

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
      location: "",
    },
  ]);

  const [isReviewOpen, setIsReviewOpen] = React.useState(false);
  const [createdPurchaseResult, setCreatedPurchaseResult] = React.useState<any | null>(null);
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
      location: "",
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
      setErrorMessage(`Upfront payment (Rs. ${paidAmount.toLocaleString()}) cannot exceed Grand Total (Rs. ${grandTotal.toLocaleString()}).`);
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
        location: item.location?.trim() || undefined,
        warehouseId: warehouseId || undefined,
      })),
    };

    const res = await createPurchaseOrderAction(payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setIsReviewOpen(false);
      setCreatedPurchaseResult(res.data);
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="supplier" className="text-xs font-semibold">
                    Supplier / Manufacturer <span className="text-rose-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsQuickSupplierOpen(true)}
                    className="h-6 px-2 text-[10px] rounded-lg text-primary border-primary/30 hover:bg-primary/5 font-bold gap-1"
                  >
                    <Plus className="h-3 w-3" /> New Supplier
                  </Button>
                </div>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger id="supplier" className="text-xs h-9">
                    <SelectValue placeholder="Select manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierList.map((s) => (
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="warehouse" className="text-xs font-semibold flex items-center gap-1.5">
                    <WarehouseIcon className="h-3.5 w-3.5 text-teal-600" />
                    Destination Godown / Warehouse <span className="text-rose-500">*</span>
                  </Label>
                  {!isSimple && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsQuickWarehouseOpen(true)}
                      className="h-6 px-2 text-[10px] rounded-lg text-teal-600 border-teal-300 hover:bg-teal-50 font-bold gap-1"
                    >
                      <Plus className="h-3 w-3" /> New Godown
                    </Button>
                  )}
                </div>
                {isSimple ? (
                  <div className="h-9 px-3 rounded-md bg-muted/60 border border-border/80 flex items-center justify-between text-xs text-foreground">
                    <span className="font-medium flex items-center gap-1.5 text-foreground">
                      📍 {warehouseList.find((w) => w.id === warehouseId)?.name || "Main Godown"}
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
                      Auto-Allocated
                    </span>
                  </div>
                ) : (
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger id="warehouse" className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouseList.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name} ({w.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                    <th className="py-2.5 px-2 font-semibold min-w-[110px]">Location (Rack/Bin)</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[130px]">Mfg Date</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[130px]">Expiry Date <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 font-semibold min-w-[80px]">Qty <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 font-semibold min-w-[70px]">Bonus Qty</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[90px]">Cost (Rs.) <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-2 font-semibold min-w-[90px]">TP (Rs.)</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[90px]">MRP (Rs.)</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[70px]">Disc %</th>
                    <th className="py-2.5 px-2 font-semibold min-w-[70px]">VAT %</th>
                    <th className="py-2.5 px-3 text-right font-semibold min-w-[100px]">Line Total (Rs.)</th>
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

                      {/* Location (Rack/Shelf/Bin) */}
                      <td className="py-2 px-2">
                        <Input
                          placeholder="e.g. R-1, B-4"
                          className="h-8 text-xs font-mono"
                          value={item.location || ""}
                          onChange={(e) => updateItem(idx, "location", e.target.value)}
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
                    Disbursed Payment Amount (Rs.)
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
                <Badge variant="outline" className="font-mono text-[10px]">Rs.</Badge>
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

          <DialogFooter className="p-4 bg-muted/20 border-t flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setIsReviewOpen(false)}>
              Back &amp; Edit
            </Button>
            <Button
              size="sm"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isSubmitting ? "Committing Consignment..." : "Confirm & Commit Stock Intake"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post-Intake Success Modal */}
      {createdPurchaseResult && (
        <Dialog open={!!createdPurchaseResult} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                Purchase Consignment Received!
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Batch inventory and stock ledger movements have been committed to the warehouse.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-lg space-y-2 text-xs text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Consignment Number:</span>
                <span className="font-mono font-bold text-emerald-800">{createdPurchaseResult.purchaseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total B2B Valuation:</span>
                <span className="font-bold">{formatCurrency(createdPurchaseResult.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Warehouse:</span>
                <span className="font-medium text-slate-700">
                  {warehouses.find((w) => w.id === warehouseId)?.name || "Central Warehouse"}
                </span>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/purchases")}
                className="text-xs h-9"
              >
                View Purchases List
              </Button>
              <Button
                size="sm"
                onClick={() => router.push(`/purchases/${createdPurchaseResult.id}`)}
                className="text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                View Receiving Slip & Batches
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* QUICK ADD SUPPLIER MODAL */}
      <Dialog open={isQuickSupplierOpen} onOpenChange={setIsQuickSupplierOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <form onSubmit={handleSaveQuickSupplier}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                Quick Register New Supplier
              </DialogTitle>
              <DialogDescription className="text-xs">
                Quickly add a pharmaceutical company or vendor without leaving your purchase intake.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Company / Manufacturer Name *</Label>
                <Input
                  required
                  placeholder="e.g., Getz Pharma, Abbott Laboratories"
                  value={quickSupplier.name}
                  onChange={(e) => setQuickSupplier({ ...quickSupplier, name: e.target.value })}
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Phone Number *</Label>
                  <Input
                    required
                    placeholder="e.g., 03001234567"
                    value={quickSupplier.phone}
                    onChange={(e) => setQuickSupplier({ ...quickSupplier, phone: e.target.value })}
                    className="rounded-xl text-xs h-9 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Payment Credit Days</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="30"
                    value={quickSupplier.creditDays}
                    onChange={(e) => setQuickSupplier({ ...quickSupplier, creditDays: parseInt(e.target.value, 10) || 0 })}
                    className="rounded-xl text-xs h-9 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Factory / Office Address</Label>
                <Input
                  placeholder="e.g., Korangi Industrial Area, Karachi"
                  value={quickSupplier.address}
                  onChange={(e) => setQuickSupplier({ ...quickSupplier, address: e.target.value })}
                  className="rounded-xl text-xs h-9"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQuickSupplierOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingQuickSupplier}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs h-9 font-bold px-4"
              >
                {isSavingQuickSupplier ? "Saving..." : "Add & Select Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QUICK ADD WAREHOUSE MODAL */}
      <Dialog open={isQuickWarehouseOpen} onOpenChange={setIsQuickWarehouseOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <form onSubmit={handleSaveQuickWarehouse}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <WarehouseIcon className="h-5 w-5 text-teal-600" />
                Quick Add Storage Godown / Warehouse
              </DialogTitle>
              <DialogDescription className="text-xs">
                Add a new warehouse, shelf or storage room for incoming stock.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Godown / Facility Name *</Label>
                <Input
                  required
                  placeholder="e.g., Secondary Godown, Basement Cold Room"
                  value={quickWarehouse.name}
                  onChange={(e) => setQuickWarehouse({ ...quickWarehouse, name: e.target.value })}
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Godown Code *</Label>
                  <Input
                    required
                    placeholder="e.g., WH-02, GD-NORTH"
                    value={quickWarehouse.code}
                    onChange={(e) => setQuickWarehouse({ ...quickWarehouse, code: e.target.value.toUpperCase() })}
                    className="rounded-xl text-xs h-9 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Location / Rack</Label>
                  <Input
                    placeholder="e.g., Floor 1, Rack B"
                    value={quickWarehouse.location}
                    onChange={(e) => setQuickWarehouse({ ...quickWarehouse, location: e.target.value })}
                    className="rounded-xl text-xs h-9"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQuickWarehouseOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingQuickWarehouse}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs h-9 font-bold px-4"
              >
                {isSavingQuickWarehouse ? "Saving..." : "Add & Select Godown"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
