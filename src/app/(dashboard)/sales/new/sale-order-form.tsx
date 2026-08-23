"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Building2,
  Store,
  CreditCard,
  FileText,
  AlertTriangle,
  Receipt,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createSaleOrderAction } from "@/server/actions/sales.actions";
import { SaleOrderInput, SaleItemInput } from "@/validations/sales.schema";

interface BatchOption {
  id: string;
  batchNumber: string;
  expiryDate: string;
  quantityOnHand: number;
  unitPurchaseCost: number;
  unitTradePrice: number;
  unitMrp: number;
}

interface MedicineOption {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  categoryName: string;
  unitTradePrice: number;
  unitMrp: number;
  vatPercent: number;
  totalStockOnHand: number;
  batches: BatchOption[];
}

interface CustomerOption {
  id: string;
  customerCode?: string | null;
  tradeName: string;
  proprietorName?: string | null;
  customerType: string;
  drugLicenseNo: string;
  drugLicenseExpiry: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  creditLimit: number;
  currentDue: number;
  availableCredit: number;
  status: string;
}

interface DistributorOption {
  id: string;
  name: string;
  phone: string;
  assignedTerritory: string;
}

interface SaleOrderFormProps {
  customers: CustomerOption[];
  medicines: MedicineOption[];
  distributors: DistributorOption[];
}

export function SaleOrderForm({ customers, medicines, distributors }: SaleOrderFormProps) {
  const router = useRouter();

  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>("");
  const [selectedDistributorId, setSelectedDistributorId] = React.useState<string>("");
  const [orderDate, setOrderDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [deliveryAddress, setDeliveryAddress] = React.useState<string>("");
  const [specialDiscountPercent, setSpecialDiscountPercent] = React.useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = React.useState<number>(0);
  const [notes, setNotes] = React.useState<string>("");

  // Payment at booking state
  const [paymentType, setPaymentType] = React.useState<"CREDIT" | "FULL" | "PARTIAL">("CREDIT");
  const [paidAmount, setPaidAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "BANK_TRANSFER" | "CHEQUE" | "MFS_BKASH_NAGAD">("CASH");
  const [paymentReference, setPaymentReference] = React.useState<string>("");
  const [paymentBank, setPaymentBank] = React.useState<string>("");
  const [paymentChequeNumber, setPaymentChequeNumber] = React.useState<string>("");

  // Credit override state
  const [creditOverrideApproved, setCreditOverrideApproved] = React.useState<boolean>(false);
  const [creditOverrideReason, setCreditOverrideReason] = React.useState<string>("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Line items state
  const [items, setItems] = React.useState<
    Array<{
      medicineId: string;
      batchId: string;
      quantity: number;
      bonusQuantity: number;
      unitTradePrice: number;
      unitCostPrice: number;
      unitMrp: number;
      discountPercent: number;
      vatPercent: number;
      availableStock: number;
      batches: BatchOption[];
    }>
  >([
    {
      medicineId: "",
      batchId: "",
      quantity: 10,
      bonusQuantity: 0,
      unitTradePrice: 0,
      unitCostPrice: 0,
      unitMrp: 0,
      discountPercent: 0,
      vatPercent: 0,
      availableStock: 0,
      batches: [],
    },
  ]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // When customer changes, update default delivery address
  React.useEffect(() => {
    if (selectedCustomer) {
      setDeliveryAddress(selectedCustomer.deliveryAddress);
    }
  }, [selectedCustomer]);

  // Add line item
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        medicineId: "",
        batchId: "",
        quantity: 10,
        bonusQuantity: 0,
        unitTradePrice: 0,
        unitCostPrice: 0,
        unitMrp: 0,
        discountPercent: 0,
        vatPercent: 0,
        availableStock: 0,
        batches: [],
      },
    ]);
  };

  // Remove line item
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // When medicine changes for a row
  const handleMedicineChange = (index: number, medicineId: string) => {
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;

    const availableBatches = med.batches || [];
    const firstBatch = availableBatches[0];

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      medicineId,
      batches: availableBatches,
      batchId: firstBatch ? firstBatch.id : "",
      unitTradePrice: firstBatch ? firstBatch.unitTradePrice : med.unitTradePrice,
      unitCostPrice: firstBatch ? firstBatch.unitPurchaseCost : 0,
      unitMrp: firstBatch ? firstBatch.unitMrp : med.unitMrp,
      vatPercent: med.vatPercent || 0,
      availableStock: firstBatch ? firstBatch.quantityOnHand : 0,
    };
    setItems(updated);
  };

  // When batch changes for a row
  const handleBatchChange = (index: number, batchId: string) => {
    const row = items[index];
    const batch = row.batches.find((b) => b.id === batchId);
    if (!batch) return;

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      batchId,
      unitTradePrice: batch.unitTradePrice,
      unitCostPrice: batch.unitPurchaseCost,
      unitMrp: batch.unitMrp,
      availableStock: batch.quantityOnHand,
    };
    setItems(updated);
  };

  // Update specific field on line item
  const handleItemFieldChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  // Calculate Financials
  const calculateTotals = () => {
    let subtotal = 0;
    let lineDiscounts = 0;
    let lineTaxes = 0;
    let totalCogs = 0;

    items.forEach((it) => {
      const lineRaw = (it.quantity || 0) * (it.unitTradePrice || 0);
      const discount = lineRaw * ((it.discountPercent || 0) / 100);
      const discountedLine = lineRaw - discount;
      const tax = discountedLine * ((it.vatPercent || 0) / 100);
      const cogs = ((it.quantity || 0) + (it.bonusQuantity || 0)) * (it.unitCostPrice || 0);

      subtotal += lineRaw;
      lineDiscounts += discount;
      lineTaxes += tax;
      totalCogs += cogs;
    });

    const specialDiscount = (subtotal - lineDiscounts) * (specialDiscountPercent / 100);
    const totalDiscount = lineDiscounts + specialDiscount;
    const grandTotal = Math.max(0, subtotal - totalDiscount + lineTaxes + deliveryCharge);
    const grossProfit = grandTotal - totalCogs;

    return {
      subtotal,
      lineDiscounts,
      specialDiscount,
      totalDiscount,
      lineTaxes,
      grandTotal,
      totalCogs,
      grossProfit,
    };
  };

  const { subtotal, totalDiscount, lineTaxes, grandTotal, totalCogs, grossProfit } = calculateTotals();

  // Keep paid amount updated based on payment type
  React.useEffect(() => {
    if (paymentType === "FULL") {
      setPaidAmount(grandTotal);
    } else if (paymentType === "CREDIT") {
      setPaidAmount(0);
    }
  }, [paymentType, grandTotal]);

  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Credit limit calculation
  const currentCustomerDue = selectedCustomer?.currentDue || 0;
  const customerCreditLimit = selectedCustomer?.creditLimit || 0;
  const projectedDue = currentCustomerDue + dueAmount;
  const isCreditExceeded = customerCreditLimit > 0 && projectedDue > customerCreditLimit;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!selectedCustomerId) {
      setServerError("Please select a Customer Pharmacy.");
      return;
    }

    if (items.some((it) => !it.medicineId || !it.batchId)) {
      setServerError("Please ensure all items have a valid medicine and batch selected.");
      return;
    }

    // Stock validation
    for (const it of items) {
      const totalReq = (it.quantity || 0) + (it.bonusQuantity || 0);
      if (totalReq <= 0) {
        setServerError("Item quantity must be greater than 0.");
        return;
      }
      if (totalReq > it.availableStock) {
        setServerError(
          `Stock error: Requested ${totalReq} units, but only ${it.availableStock} available in selected batch.`
        );
        return;
      }
    }

    if (isCreditExceeded && !creditOverrideApproved) {
      setServerError(
        `Credit limit exceeded (৳${projectedDue.toFixed(2)} > ৳${customerCreditLimit.toFixed(2)}). Please check manager override approval to proceed.`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: SaleOrderInput = {
        customerId: selectedCustomerId,
        distributorId: selectedDistributorId || undefined,
        orderDate,
        deliveryAddress,
        specialDiscountPercent,
        deliveryCharge,
        paidAmount,
        paymentMethod,
        paymentReference,
        paymentBank,
        paymentChequeNumber,
        creditOverrideApproved,
        creditOverrideReason: creditOverrideReason || undefined,
        notes,
        items: items.map((it) => ({
          medicineId: it.medicineId,
          batchId: it.batchId,
          quantity: it.quantity,
          bonusQuantity: it.bonusQuantity,
          unitTradePrice: it.unitTradePrice,
          unitCostPrice: it.unitCostPrice,
          unitMrp: it.unitMrp,
          discountPercent: it.discountPercent,
          vatPercent: it.vatPercent,
        })),
        isDirectInvoice: true,
      };

      const res = await createSaleOrderAction(payload);

      if (res.success && res.data) {
        router.push(`/sales/${res.data.saleId}`);
      } else {
        setServerError(res.error || "Failed to create wholesale order.");
      }
    } catch (err: any) {
      setServerError("Unexpected error occurred while creating order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1300px] mx-auto pb-20">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Link href="/sales">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Sales Directory
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Create Wholesale Sales Order & Tax Invoice"
        description="Book bulk pharmacy orders with strict FEFO batch allocation, historical COGS capture, and credit barrier verification."
      />

      {serverError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2. Customer Selection & Credit Verification Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-[#0071E3]">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Customer Pharmacy & Route</h3>
              <p className="text-xs text-muted-foreground">Select licensed retail pharmacy or hospital buyer.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Pharmacy */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-foreground">
                Customer Pharmacy <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedCustomerId}
                onValueChange={(val) => setSelectedCustomerId(val)}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm bg-muted/20">
                  <SelectValue placeholder="Select Customer Pharmacy / Medical Store" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold">{c.tradeName}</span>
                        {c.customerCode && <span className="font-mono text-muted-foreground">({c.customerCode})</span>}
                        <span className="text-muted-foreground">• Due: {formatCurrency(c.currentDue)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Salesman / Distributor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Assigned Field Salesman</Label>
              <Select
                value={selectedDistributorId}
                onValueChange={(val) => setSelectedDistributorId(val)}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm bg-muted/20">
                  <SelectValue placeholder="Direct / Cashier HQ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Direct / Cashier HQ</SelectItem>
                  {distributors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.assignedTerritory})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer Live Credit & Compliance Snapshot */}
          {selectedCustomer && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">DGDA Drug License:</span>
                <div className="font-mono font-bold text-foreground mt-0.5">
                  {selectedCustomer.drugLicenseNo}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Credit Limit:</span>
                <div className="font-mono font-bold text-foreground mt-0.5">
                  {formatCurrency(selectedCustomer.creditLimit)}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Current Outstanding Due:</span>
                <div className="font-mono font-bold text-amber-700 mt-0.5">
                  {formatCurrency(selectedCustomer.currentDue)}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Available Credit Room:</span>
                <div
                  className={`font-mono font-bold mt-0.5 ${
                    selectedCustomer.availableCredit > 0 ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {formatCurrency(selectedCustomer.availableCredit)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Multi-Item Medicine Line Builder */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Medicine Line Items & FEFO Batches</h3>
                <p className="text-xs text-muted-foreground">Select medicine, choose FEFO batch, and set quantities.</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddItem}
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-8 text-[#0071E3] border-sky-200 hover:bg-sky-50"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Medicine Line
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((row, idx) => {
              const lineRaw = (row.quantity || 0) * (row.unitTradePrice || 0);
              const lineDiscount = lineRaw * ((row.discountPercent || 0) / 100);
              const lineTotal = lineRaw - lineDiscount + (lineRaw - lineDiscount) * ((row.vatPercent || 0) / 100);
              const totalRequired = (row.quantity || 0) + (row.bonusQuantity || 0);
              const isOverStock = totalRequired > row.availableStock && row.batchId !== "";

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isOverStock
                      ? "bg-rose-50/50 border-rose-200"
                      : "bg-muted/10 border-border/60 hover:border-border"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* 1. Medicine Selector */}
                    <div className="md:col-span-4 space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">
                        Medicine #{idx + 1}
                      </Label>
                      <Select
                        value={row.medicineId}
                        onValueChange={(val) => handleMedicineChange(idx, val)}
                      >
                        <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                          <SelectValue placeholder="Select Medicine" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {medicines.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className="text-xs">
                                <span className="font-semibold">{m.brandName}</span>{" "}
                                <span className="text-muted-foreground">({m.strength} • {m.dosageForm})</span>
                                <span className="text-emerald-700 ml-1.5">• {m.totalStockOnHand} in stock</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 2. Batch Selector (FEFO) */}
                    <div className="md:col-span-3 space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">
                        Batch (FEFO Order)
                      </Label>
                      <Select
                        value={row.batchId}
                        disabled={!row.medicineId || row.batches.length === 0}
                        onValueChange={(val) => handleBatchChange(idx, val)}
                      >
                        <SelectTrigger className="h-9 rounded-xl text-xs bg-background font-mono">
                          <SelectValue
                            placeholder={row.batches.length === 0 ? "No active stock" : "Select Batch"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {row.batches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              <div className="text-xs font-mono">
                                <span>{b.batchNumber}</span>{" "}
                                <span className="text-muted-foreground">({formatDate(b.expiryDate)})</span>
                                <span className="text-emerald-700 ml-1.5 font-bold">• {b.quantityOnHand} available</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 3. Billed Quantity */}
                    <div className="md:col-span-1 space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) =>
                          handleItemFieldChange(idx, "quantity", parseInt(e.target.value, 10) || 0)
                        }
                        className="h-9 rounded-xl text-xs font-mono font-bold bg-background text-center"
                      />
                    </div>

                    {/* 4. Bonus Quantity */}
                    <div className="md:col-span-1 space-y-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Bonus</Label>
                      <Input
                        type="number"
                        min="0"
                        value={row.bonusQuantity}
                        onChange={(e) =>
                          handleItemFieldChange(idx, "bonusQuantity", parseInt(e.target.value, 10) || 0)
                        }
                        className="h-9 rounded-xl text-xs font-mono bg-background text-center"
                      />
                    </div>

                    {/* 5. Trade Price (TP) */}
                    <div className="md:col-span-1 space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">Unit TP</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={row.unitTradePrice}
                        onChange={(e) =>
                          handleItemFieldChange(idx, "unitTradePrice", parseFloat(e.target.value) || 0)
                        }
                        className="h-9 rounded-xl text-xs font-mono bg-background text-right"
                      />
                    </div>

                    {/* 6. Discount % */}
                    <div className="md:col-span-1 space-y-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Disc%</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={row.discountPercent}
                        onChange={(e) =>
                          handleItemFieldChange(idx, "discountPercent", parseFloat(e.target.value) || 0)
                        }
                        className="h-9 rounded-xl text-xs font-mono bg-background text-center"
                      />
                    </div>

                    {/* 7. Line Total & Delete */}
                    <div className="md:col-span-1 flex items-center justify-between gap-1">
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground">Line Total</div>
                        <div className="text-xs font-bold font-mono text-foreground">
                          {formatCurrency(lineTotal)}
                        </div>
                      </div>

                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(idx)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {isOverStock && (
                    <div className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Total requested ({totalRequired}) exceeds available batch stock ({row.availableStock}).
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Financial Summary & Payment Settlement Deck */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Payment at Booking */}
          <div className="md:col-span-6 bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Payment Collection at Booking</h3>
                <p className="text-xs text-muted-foreground">Full settlement, partial deposit, or credit dispatch.</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Payment Type Switcher */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType("CREDIT")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    paymentType === "CREDIT"
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  Credit Sale (৳0)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("FULL")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    paymentType === "FULL"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  Full Paid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("PARTIAL")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    paymentType === "PARTIAL"
                      ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                      : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  Partial Paid
                </button>
              </div>

              {/* Amount Paid Input */}
              {paymentType !== "CREDIT" && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-foreground">Amount Paid (AFN / ؋)</Label>
                      <Input
                        type="number"
                        min="0"
                        max={grandTotal}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        className="h-10 rounded-xl bg-muted/20 text-sm font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-foreground">Payment Method</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(val: any) => setPaymentMethod(val)}
                      >
                        <SelectTrigger className="h-10 rounded-xl text-xs bg-muted/20">
                          <SelectValue placeholder="Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash Deposit</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Online Transfer</SelectItem>
                          <SelectItem value="CHEQUE">Cheque / Demand Draft</SelectItem>
                          <SelectItem value="MFS_BKASH_NAGAD">Hawala / Digital Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bank / Cheque / Ref Inputs */}
                  {paymentMethod !== "CASH" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Bank Name / Wallet</Label>
                        <Input
                          placeholder="e.g. Kabul Bank / Da Afghanistan Bank"
                          value={paymentBank}
                          onChange={(e) => setPaymentBank(e.target.value)}
                          className="h-9 rounded-xl bg-muted/20 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Cheque / Trx ID</Label>
                        <Input
                          placeholder="e.g. CHQ-99124 / Trx-881"
                          value={paymentChequeNumber || paymentReference}
                          onChange={(e) => {
                            setPaymentChequeNumber(e.target.value);
                            setPaymentReference(e.target.value);
                          }}
                          className="h-9 rounded-xl bg-muted/20 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Charge & Special Discount */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">Special Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={specialDiscountPercent}
                    onChange={(e) => setSpecialDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="h-9 rounded-xl bg-muted/20 text-xs text-center font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">Delivery Charge (AFN / ؋)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                    className="h-9 rounded-xl bg-muted/20 text-xs text-right font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Grand Totals & COGS / Profit Summary */}
          <div className="md:col-span-6 bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Order Settlement & COGS Breakdown</h3>
                  <p className="text-xs text-muted-foreground">Historical batch cost preservation & gross profit.</p>
                </div>
              </div>

              <div className="space-y-2.5 py-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Line Subtotal:</span>
                  <span className="font-mono font-semibold text-foreground">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Wholesale Discounts:</span>
                  <span className="font-mono font-semibold text-rose-600">−{formatCurrency(totalDiscount)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT / Medicine Tax:</span>
                  <span className="font-mono text-foreground">+{formatCurrency(lineTaxes)}</span>
                </div>

                {deliveryCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery & Handling:</span>
                    <span className="font-mono text-foreground">+{formatCurrency(deliveryCharge)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-border/60 flex justify-between items-center">
                  <span className="font-bold text-sm text-foreground">Invoice Grand Total:</span>
                  <span className="font-mono font-extrabold text-base text-[#0071E3]">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 pt-1">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-bold">−{formatCurrency(paidAmount)}</span>
                </div>

                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Remaining Accounts Receivable Due:</span>
                  <span className="font-mono font-bold">{formatCurrency(dueAmount)}</span>
                </div>

                {/* Historical COGS & Margin Insight */}
                <div className="mt-4 p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs text-purple-950">
                  <div>
                    <span className="text-purple-700 font-medium">Batch COGS Snapshot:</span>
                    <div className="font-mono font-bold">{formatCurrency(totalCogs)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-purple-700 font-medium">Estimated Gross Profit:</span>
                    <div className="font-mono font-bold text-emerald-800">
                      {formatCurrency(grossProfit)} (
                      {grandTotal > 0 ? Math.round((grossProfit / grandTotal) * 100) : 0}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Limit Barrier Override Checkbox */}
            {isCreditExceeded && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>Customer Credit Limit Barrier Exceeded</span>
                </div>
                <p className="text-amber-800 text-[11px]">
                  Projected balance ৳{projectedDue.toFixed(2)} exceeds limit of ৳{customerCreditLimit.toFixed(2)}.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="creditOverride"
                    checked={creditOverrideApproved}
                    onChange={(e) => setCreditOverrideApproved(e.target.checked)}
                    className="h-4 w-4 rounded text-[#0071E3]"
                  />
                  <label htmlFor="creditOverride" className="font-semibold text-foreground cursor-pointer">
                    Authorize Sales Manager Credit Override
                  </label>
                </div>

                {creditOverrideApproved && (
                  <Input
                    placeholder="Enter reason for credit limit override approval..."
                    value={creditOverrideReason}
                    onChange={(e) => setCreditOverrideReason(e.target.value)}
                    className="h-8 rounded-lg bg-background text-xs"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* 5. Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            asChild
            type="button"
            variant="outline"
            className="rounded-xl h-11 px-5"
          >
            <Link href="/sales">Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm rounded-xl font-medium px-6 h-11 transition-all active:scale-95"
          >
            {isSubmitting ? (
              "Processing Order & Invoice..."
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Issue Wholesale Tax Invoice & Dispatch
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
