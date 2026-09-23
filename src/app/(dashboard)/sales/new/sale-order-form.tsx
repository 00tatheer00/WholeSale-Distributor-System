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
  Printer,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { createSaleOrderAction } from "@/server/actions/sales.actions";
import { createCustomerAction } from "@/server/actions/customer.actions";
import { createDistributorAction } from "@/server/actions/distributor.actions";
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

  const [customerList, setCustomerList] = React.useState(customers);
  const [distributorList, setDistributorList] = React.useState(distributors);

  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>("");
  const [selectedDistributorId, setSelectedDistributorId] = React.useState<string>("");

  // Quick Add Customer Dialog State
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = React.useState(false);
  const [quickCustomer, setQuickCustomer] = React.useState({
    tradeName: "",
    proprietorName: "",
    phone: "",
    deliveryAddress: "",
    city: "Karachi",
    creditLimit: 100000,
    drugLicenseNo: "",
  });
  const [isSavingQuickCustomer, setIsSavingQuickCustomer] = React.useState(false);

  // Quick Add Sales Rep Dialog State
  const [isQuickDistributorOpen, setIsQuickDistributorOpen] = React.useState(false);
  const [quickDistributor, setQuickDistributor] = React.useState({
    name: "",
    phone: "",
    assignedTerritory: "",
    commissionPercent: 2,
  });
  const [isSavingQuickDistributor, setIsSavingQuickDistributor] = React.useState(false);

  const handleSaveQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustomer.tradeName.trim() || !quickCustomer.phone.trim()) {
      alert("Pharmacy / Customer Name and Phone are required.");
      return;
    }
    setIsSavingQuickCustomer(true);
    const res = await createCustomerAction({
      tradeName: quickCustomer.tradeName.trim(),
      proprietorName: quickCustomer.proprietorName?.trim() || null,
      phone: quickCustomer.phone.trim(),
      deliveryAddress: quickCustomer.deliveryAddress.trim() || "Local Address",
      city: quickCustomer.city.trim() || "Karachi",
      creditLimit: Number(quickCustomer.creditLimit) || 100000,
      drugLicenseNo: quickCustomer.drugLicenseNo?.trim() || "DL-PENDING",
      drugLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      customerType: "RETAIL_PHARMACY",
      maxDueDays: 30,
      openingBalance: 0,
      defaultDiscountPercent: 0,
      status: "ACTIVE",
    });
    setIsSavingQuickCustomer(false);
    if (res.success && res.data) {
      const newCust: CustomerOption = {
        id: res.data.id,
        customerCode: res.data.customerCode,
        tradeName: res.data.tradeName,
        proprietorName: res.data.proprietorName,
        customerType: res.data.customerType,
        drugLicenseNo: res.data.drugLicenseNo,
        drugLicenseExpiry: res.data.drugLicenseExpiry ? res.data.drugLicenseExpiry.toString() : "",
        phone: res.data.phone,
        deliveryAddress: res.data.deliveryAddress,
        city: res.data.city,
        creditLimit: Number(res.data.creditLimit),
        currentDue: Number(res.data.currentDue || 0),
        availableCredit: Number(res.data.availableCredit || res.data.creditLimit),
        status: res.data.status,
      };
      setCustomerList([newCust, ...customerList]);
      setSelectedCustomerId(newCust.id);
      setIsQuickCustomerOpen(false);
      setQuickCustomer({ tradeName: "", proprietorName: "", phone: "", deliveryAddress: "", city: "Karachi", creditLimit: 100000, drugLicenseNo: "" });
    } else {
      alert(res.error || "Failed to create customer.");
    }
  };

  const handleSaveQuickDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDistributor.name.trim() || !quickDistributor.phone.trim()) {
      alert("Representative Name and Phone are required.");
      return;
    }
    setIsSavingQuickDistributor(true);
    const res = await createDistributorAction({
      name: quickDistributor.name.trim(),
      phone: quickDistributor.phone.trim(),
      assignedTerritory: quickDistributor.assignedTerritory.trim() || "General Beat",
      commissionRatePercent: Number(quickDistributor.commissionPercent) || 2.5,
      monthlySalesTarget: 500000,
      status: "ACTIVE",
    });
    setIsSavingQuickDistributor(false);
    if (res.success && res.data) {
      const newRep: DistributorOption = {
        id: res.data.id,
        name: res.data.name,
        phone: res.data.phone,
        assignedTerritory: res.data.assignedTerritory || "General Beat",
      };
      setDistributorList([newRep, ...distributorList]);
      setSelectedDistributorId(newRep.id);
      setIsQuickDistributorOpen(false);
      setQuickDistributor({ name: "", phone: "", assignedTerritory: "", commissionPercent: 2 });
    } else {
      alert(res.error || "Failed to create sales representative.");
    }
  };

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

  // Review and Success modal states
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);
  const [saleSuccessData, setSaleSuccessData] = React.useState<{
    saleId: string;
    saleNumber: string;
    invoiceId?: string;
    invoiceNumber?: string;
    grandTotal: number;
    paidAmount: number;
    dueAmount: number;
  } | null>(null);

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

  const selectedCustomer = customerList.find((c) => c.id === selectedCustomerId);

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

  // Open Review Summary Modal
  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!selectedCustomerId) {
      setServerError("Please select a Customer Pharmacy.");
      return;
    }

    if (selectedCustomer?.status === "INACTIVE") {
      setServerError(`Customer pharmacy "${selectedCustomer.tradeName}" is inactive. Orders cannot be dispatched.`);
      return;
    }

    if (items.some((it) => !it.medicineId || !it.batchId)) {
      setServerError("Please ensure all items have a valid medicine and FEFO batch selected.");
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
        `Credit barrier hold: Order pushes customer balance to Rs. ${projectedDue.toFixed(2)}, exceeding credit limit of Rs. ${customerCreditLimit.toFixed(2)}. Please check manager override approval to proceed.`
      );
      return;
    }

    setIsReviewOpen(true);
  };

  // Final Action: Confirm and create order
  const handleConfirmSale = async () => {
    try {
      setIsSubmitting(true);
      setServerError(null);

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
        setIsReviewOpen(false);
        setSaleSuccessData({
          saleId: res.data.saleId,
          saleNumber: res.data.saleNumber || "SO-CONFIRMED",
          invoiceId: res.data.invoiceId || res.data.saleId,
          invoiceNumber: res.data.invoiceNumber || "INV-CONFIRMED",
          grandTotal,
          paidAmount,
          dueAmount,
        });
      } else {
        setServerError(res.error || "Failed to create wholesale order.");
        setIsReviewOpen(false);
      }
    } catch (err: any) {
      setServerError("Unexpected error occurred while creating order.");
      setIsReviewOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnotherSale = () => {
    setSaleSuccessData(null);
    setSelectedCustomerId("");
    setSelectedDistributorId("");
    setItems([
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
    setSpecialDiscountPercent(0);
    setDeliveryCharge(0);
    setNotes("");
    setPaymentType("CREDIT");
    setPaidAmount(0);
    setCreditOverrideApproved(false);
    setCreditOverrideReason("");
    setServerError(null);
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
        title="Create Sale Invoice & Bill (+ Naya Bill)"
        description="Select customer pharmacy, choose medicine batches (auto-sorted earliest expiry first), and print instant wholesale invoice."
      />

      {/* 3-Step Idiot-Proof Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-emerald-500/10 border border-blue-500/20 text-xs shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-blue-900 dark:text-blue-300">
          <span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] shrink-0 font-extrabold shadow-sm">1</span>
          <span>Step 1: Choose Customer Pharmacy</span>
        </div>
        <div className="flex items-center gap-2.5 font-bold text-purple-900 dark:text-purple-300">
          <span className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] shrink-0 font-extrabold shadow-sm">2</span>
          <span>Step 2: Add Medicines & Stock Batches</span>
        </div>
        <div className="flex items-center gap-2.5 font-bold text-emerald-900 dark:text-emerald-300">
          <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] shrink-0 font-extrabold shadow-sm">3</span>
          <span>Step 3: Save & Print Invoice</span>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleOpenReview} className="space-y-6">
        {/* 2. Customer Selection & Credit Verification Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-[#0071E3]">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Step 1 — Customer Pharmacy & Sales Representative</h3>
              <p className="text-xs text-muted-foreground">Select licensed retail pharmacy or medical store, and responsible sales officer.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Pharmacy */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Customer Pharmacy / Medical Store <span className="text-rose-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuickCustomerOpen(true)}
                  className="h-6 px-2 text-[10px] rounded-lg text-primary border-primary/30 hover:bg-primary/5 font-bold gap-1"
                >
                  <Plus className="h-3 w-3" /> New Customer
                </Button>
              </div>
              <Select
                value={selectedCustomerId}
                onValueChange={(val) => setSelectedCustomerId(val)}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm bg-muted/20">
                  <SelectValue placeholder="Select Customer Pharmacy / Medical Store" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {customerList.map((c) => (
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

            {/* Sales Representative */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Sales Representative</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuickDistributorOpen(true)}
                  className="h-6 px-2 text-[10px] rounded-lg text-primary border-primary/30 hover:bg-primary/5 font-bold gap-1"
                >
                  <Plus className="h-3 w-3" /> New Rep
                </Button>
              </div>
              <Select
                value={selectedDistributorId}
                onValueChange={(val) => setSelectedDistributorId(val)}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm bg-muted/20">
                  <SelectValue placeholder="Direct Order / HQ Cashier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Direct Order / HQ Cashier</SelectItem>
                  {distributorList.map((d) => (
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
            <div className="space-y-3">
              {selectedCustomer.status === "BLOCKED_OVERDUE" && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                    Account On Hold: Overdue Invoices Detected
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Customer pharmacy &ldquo;{selectedCustomer.tradeName}&rdquo; has invoices past credit aging limit (Current due: {formatCurrency(selectedCustomer.currentDue)}). Wholesale shipments are locked. To dispatch this consignment, Sales Manager override approval is required at bottom.
                  </p>
                </div>
              )}

              {selectedCustomer.status === "INACTIVE" && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                    <AlertCircle className="h-4 w-4 text-rose-700 shrink-0" />
                    Customer Inactive / Regulatory Hold
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Customer pharmacy &ldquo;{selectedCustomer.tradeName}&rdquo; is deactivated or drug license has lapsed. Inactive accounts cannot be issued wholesale invoices.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">DRAP Drug License:</span>
                  <div className="font-mono font-bold text-foreground mt-0.5">
                    {selectedCustomer.drugLicenseNo || "Valid on File"}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Credit Limit:</span>
                  <div className="font-mono font-bold text-foreground mt-0.5">
                    {formatCurrency(selectedCustomer.creditLimit)}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Current Outstanding (AR):</span>
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
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-bold text-foreground">
                          Batch & Expiry Date
                        </Label>
                        <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                          FEFO (Earliest Expiry)
                        </span>
                      </div>
                      <Select
                        value={row.batchId}
                        disabled={!row.medicineId || row.batches.length === 0}
                        onValueChange={(val) => handleBatchChange(idx, val)}
                      >
                        <SelectTrigger className="h-9 rounded-xl text-xs bg-background font-mono">
                          <SelectValue
                            placeholder={
                              !row.medicineId
                                ? "Select medicine first"
                                : row.batches.length === 0
                                ? "❌ Out of stock"
                                : "Select Batch & Expiry"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {row.batches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              <div className="text-xs font-mono flex items-center gap-1.5">
                                <span className="font-bold text-foreground">{b.batchNumber}</span>
                                <span className="text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/40 px-1 py-0.5 rounded text-[10px]">
                                  Exp: {formatDate(b.expiryDate)}
                                </span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">• {b.quantityOnHand} in stock</span>
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
                  Credit Sale (Rs. 0)
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
                      <Label className="text-xs font-semibold text-foreground">Amount Paid (PKR / Rs.)</Label>
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
                          <SelectItem value="MFS_BKASH_NAGAD">Raast / JazzCash / EasyPaisa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bank / Cheque / Ref Inputs */}
                  {paymentMethod !== "CASH" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Bank Name / Digital Rail</Label>
                        <Input
                          placeholder="e.g. Habib Bank (HBL) / Meezan Bank"
                          value={paymentBank}
                          onChange={(e) => setPaymentBank(e.target.value)}
                          className="h-9 rounded-xl bg-muted/20 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Cheque # / Trx ID</Label>
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
                  <Label className="text-xs font-semibold text-foreground">Delivery Charge (PKR / Rs.)</Label>
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
                  <span className="text-muted-foreground">Sales Tax (VAT / Drug Act):</span>
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
                  <span>Amount Paid Now:</span>
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
                  Projected balance Rs. {projectedDue.toFixed(2)} exceeds limit of Rs. {customerCreditLimit.toFixed(2)}.
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
            <ArrowRight className="h-4 w-4 mr-2" />
            Review Order & Confirm Sale
          </Button>
        </div>
      </form>

      {/* Step 7: Pre-Submission Review Summary Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Receipt className="h-5 w-5 text-[#0071E3]" />
              Confirm Wholesale Order & Tax Invoice
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please review order details and credit allocation before final confirmation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            {/* Customer & Rep Recap */}
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Customer Pharmacy</span>
                <div className="font-bold text-sm text-foreground mt-0.5">{selectedCustomer?.tradeName}</div>
                <div className="text-muted-foreground">{selectedCustomer?.deliveryAddress || "Karachi, Pakistan"}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Sales Representative</span>
                <div className="font-semibold text-foreground mt-0.5">
                  {distributors.find((d) => d.id === selectedDistributorId)?.name || "Direct Order / HQ Cashier"}
                </div>
                <div className="text-muted-foreground">Order Date: {orderDate}</div>
              </div>
            </div>

            {/* Line items summary */}
            <div className="p-3 rounded-xl bg-muted/20 border border-border/60 space-y-1.5">
              <div className="flex justify-between font-semibold text-foreground pb-1 border-b border-border/40">
                <span>Items Ordered ({items.length} product lines)</span>
                <span>Total Units: {items.reduce((s, it) => s + (it.quantity || 0) + (it.bonusQuantity || 0), 0)}</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {items.map((it, idx) => {
                  const m = medicines.find((x) => x.id === it.medicineId);
                  const b = it.batches.find((x) => x.id === it.batchId);
                  return (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span className="truncate max-w-[280px]">
                        {m?.brandName || `Item #${idx + 1}`} ({b?.batchNumber || "FEFO"})
                      </span>
                      <span>
                        {it.quantity} {it.bonusQuantity > 0 ? `(+${it.bonusQuantity} free)` : ""} @ Rs. {it.unitTradePrice}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-100 space-y-1.5 font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discounts Applied:</span>
                  <span>−{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              {lineTaxes > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Sales Tax (VAT):</span>
                  <span>+{formatCurrency(lineTaxes)}</span>
                </div>
              )}
              {deliveryCharge > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charge:</span>
                  <span>+{formatCurrency(deliveryCharge)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#0071E3] pt-1 border-t border-sky-200">
                <span>Invoice Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Immediate Payment:</span>
                <span>−{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-800">
                <span>Remaining Credit Balance Added:</span>
                <span>{formatCurrency(dueAmount)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl text-xs"
            >
              Back to Edit
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSale}
              disabled={isSubmitting}
              className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs font-semibold px-5 shadow-sm"
            >
              {isSubmitting ? (
                "Authorizing & Booking..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Confirm Sale & Issue Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 8: Post-Sale Success Modal */}
      <Dialog open={!!saleSuccessData} onOpenChange={() => {}}>
        <DialogContent className="max-w-md rounded-2xl p-6 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground">Sale Completed Successfully!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Stock has been depleted according to strict FEFO and accounts receivable recorded.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 text-xs font-mono text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-sans">Sale Order:</span>
              <span className="font-bold text-foreground">{saleSuccessData?.saleNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-sans">Tax Invoice #:</span>
              <span className="font-bold text-[#0071E3]">{saleSuccessData?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-sans">Total Billed:</span>
              <span className="font-bold text-foreground">{formatCurrency(saleSuccessData?.grandTotal || 0)}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span className="font-sans">Amount Paid:</span>
              <span className="font-bold">{formatCurrency(saleSuccessData?.paidAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span className="font-sans">Accounts Receivable:</span>
              <span className="font-bold">{formatCurrency(saleSuccessData?.dueAmount || 0)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                asChild
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-10 shadow-sm"
              >
                <Link href={`/invoices/${saleSuccessData?.invoiceId}`}>
                  <FileText className="h-3.5 w-3.5 mr-1.5" /> View Invoice
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-xl text-xs h-10 border-border"
              >
                <Link href={`/invoices/${saleSuccessData?.invoiceId}`}>
                  <Printer className="h-3.5 w-3.5 mr-1.5 text-sky-600" /> Print Challan
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBookAnotherSale}
                className="text-xs text-[#0071E3] hover:underline flex-1"
              >
                + Book New Sale
              </Button>

              <Button
                asChild
                variant="ghost"
                className="text-xs text-muted-foreground hover:underline flex-1"
              >
                <Link href="/sales">Back to Sales</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QUICK ADD CUSTOMER / PHARMACY MODAL */}
      <Dialog open={isQuickCustomerOpen} onOpenChange={setIsQuickCustomerOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <form onSubmit={handleSaveQuickCustomer}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Store className="h-5 w-5 text-primary" />
                Quick Register New Pharmacy / Customer
              </DialogTitle>
              <DialogDescription className="text-xs">
                Quickly register a new medical store or pharmacy without leaving your sale bill.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pharmacy / Medical Store Name *</Label>
                <Input
                  required
                  placeholder="e.g., Al-Shifa Chemist, Care Pharmacy"
                  value={quickCustomer.tradeName}
                  onChange={(e) => setQuickCustomer({ ...quickCustomer, tradeName: e.target.value })}
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Proprietor / Owner Name</Label>
                  <Input
                    placeholder="e.g., Dr. Tariq Mahmood"
                    value={quickCustomer.proprietorName}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, proprietorName: e.target.value })}
                    className="rounded-xl text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Phone Number *</Label>
                  <Input
                    required
                    placeholder="e.g., 03001234567"
                    value={quickCustomer.phone}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, phone: e.target.value })}
                    className="rounded-xl text-xs h-9 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Delivery Address *</Label>
                <Input
                  required
                  placeholder="e.g., Shop 4, Main Market, Saddar"
                  value={quickCustomer.deliveryAddress}
                  onChange={(e) => setQuickCustomer({ ...quickCustomer, deliveryAddress: e.target.value })}
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">DRAP Drug License #</Label>
                  <Input
                    placeholder="e.g., 05-421-0089"
                    value={quickCustomer.drugLicenseNo}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, drugLicenseNo: e.target.value })}
                    className="rounded-xl text-xs h-9 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Credit Limit (Rs.)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="100000"
                    value={quickCustomer.creditLimit}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, creditLimit: parseInt(e.target.value, 10) || 0 })}
                    className="rounded-xl text-xs h-9 font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQuickCustomerOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingQuickCustomer}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs h-9 font-bold px-4"
              >
                {isSavingQuickCustomer ? "Saving..." : "Add & Select Pharmacy"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QUICK ADD SALES REP MODAL */}
      <Dialog open={isQuickDistributorOpen} onOpenChange={setIsQuickDistributorOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <form onSubmit={handleSaveQuickDistributor}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                Quick Register Sales Representative
              </DialogTitle>
              <DialogDescription className="text-xs">
                Add an order booker or medical sales representative.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input
                  required
                  placeholder="e.g., Muhammad Imran, Ali Raza"
                  value={quickDistributor.name}
                  onChange={(e) => setQuickDistributor({ ...quickDistributor, name: e.target.value })}
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Phone Number *</Label>
                  <Input
                    required
                    placeholder="e.g., 03211234567"
                    value={quickDistributor.phone}
                    onChange={(e) => setQuickDistributor({ ...quickDistributor, phone: e.target.value })}
                    className="rounded-xl text-xs h-9 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Assigned Beat / Territory</Label>
                  <Input
                    placeholder="e.g., Saddar & Clifton"
                    value={quickDistributor.assignedTerritory}
                    onChange={(e) => setQuickDistributor({ ...quickDistributor, assignedTerritory: e.target.value })}
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
                onClick={() => setIsQuickDistributorOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingQuickDistributor}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs h-9 font-bold px-4"
              >
                {isSavingQuickDistributor ? "Saving..." : "Add & Select Rep"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
