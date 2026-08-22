"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FileSpreadsheet, Plus, CheckCircle2, AlertTriangle, ShieldCheck, Printer } from "lucide-react";
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
import { createSaleOrderAction } from "@/server/actions/sales.actions";
import { SaleOrderInput, SaleItemInput } from "@/validations/sales.schema";
import { InvoicePrintModal, InvoicePrintData } from "@/components/shared/invoice-print-modal";

interface SalesClientProps {
  initialInvoices: any[];
  customers: any[];
  distributors: any[];
  medicines: any[];
  batches: any[];
}

export function SalesClient({
  initialInvoices,
  customers,
  distributors,
  medicines,
  batches,
}: SalesClientProps) {
  const [invoices, setInvoices] = React.useState(initialInvoices);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Print Modal
  const [printInvoice, setPrintInvoice] = React.useState<InvoicePrintData | null>(null);
  const [isPrintOpen, setIsPrintOpen] = React.useState(false);

  // Form State
  const [customerId, setCustomerId] = React.useState(customers[0]?.id || "");
  const [distributorId, setDistributorId] = React.useState(distributors[0]?.id || "");
  const [orderDate, setOrderDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [specialDiscountPercent, setSpecialDiscountPercent] = React.useState(0);
  const [deliveryCharge, setDeliveryCharge] = React.useState(0);

  const [items, setItems] = React.useState<SaleItemInput[]>([
    {
      medicineId: medicines[0]?.id || "",
      batchId: batches[0]?.id || "",
      quantity: 100,
      bonusQuantity: 5,
      unitTradePrice: medicines[0]?.unitTradePrice || 2.20,
      unitCostPrice: batches[0]?.unitCostPrice || 1.85,
      unitMrp: medicines[0]?.unitMrp || 2.50,
      discountPercent: 2.0,
      vatPercent: 0,
    },
  ]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice & Challan #",
      cell: ({ row }) => (
        <div className="space-y-0.5 font-mono">
          <div className="font-semibold text-foreground">{row.original.invoiceNumber}</div>
          <div className="text-[11px] text-muted-foreground">{row.original.challanNumber}</div>
        </div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer Pharmacy",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.original.customerName}</div>
          <div className="text-[11px] text-muted-foreground">Rep: {row.original.salesmanName}</div>
        </div>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "Date / Due",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div>{formatDate(row.original.issueDate)}</div>
          <div className="text-[11px] text-muted-foreground">Due: {formatDate(row.original.dueDate)}</div>
        </div>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Net Billed Amount",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-bold text-foreground">
            {formatCurrency(row.original.grandTotal)}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            Profit: +{formatCurrency(row.original.grossProfit)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dueAmount",
      header: "Outstanding Due",
      cell: ({ row }) => (
        <span className={`font-semibold ${row.original.dueAmount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
          {formatCurrency(row.original.dueAmount)}
        </span>
      ),
    },
    {
      accessorKey: "deliveryStatus",
      header: "Dispatch Status",
      cell: ({ row }) => (
        <Badge variant={row.original.deliveryStatus === "DELIVERED" ? "success" : "secondary"} className="text-[10px]">
          {row.original.deliveryStatus}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Print / PDF",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPrintInvoice({
              ...row.original,
              company: {
                name: "Apex Pharma Distributors Ltd.",
                tradeLicenseNo: "TRAD-DH-2024-8849",
                drugLicenseNo: "DL-DH-09182-W",
                taxIdTin: "8291039182",
                email: "info@apexpharmadist.com",
                phone: "+880 1711 000111",
                address: "Plot 14, Commercial Zone, Tejgaon Industrial Area, Dhaka",
              },
              customer: {
                tradeName: row.original.customerName,
                address: "Dhaka Retail Route 1",
                drugLicenseNo: "DL-DH-84910",
              },
            });
            setIsPrintOpen(true);
          }}
          className="h-8 px-2 text-xs gap-1"
        >
          <Printer className="h-3.5 w-3.5" />
          Invoice
        </Button>
      ),
    },
  ];

  const handleAddItem = () => {
    const med = medicines[0];
    const batch = batches.find((b) => b.medicineId === med?.id) || batches[0];
    setItems([
      ...items,
      {
        medicineId: med?.id || "",
        batchId: batch?.id || "",
        quantity: 50,
        bonusQuantity: 0,
        unitTradePrice: med?.unitTradePrice || 2.20,
        unitCostPrice: batch?.unitCostPrice || 1.85,
        unitMrp: med?.unitMrp || 2.50,
        discountPercent: 0,
        vatPercent: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const payload: SaleOrderInput = {
      customerId,
      distributorId,
      orderDate,
      specialDiscountPercent,
      deliveryCharge,
      items,
      isDirectInvoice: true,
    };

    const res = await createSaleOrderAction(payload);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Wholesale Order Invoiced." });
      const invoiceNumber = res.data?.invoiceNumber || `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const subtotal = items.reduce((s, it) => s + it.quantity * it.unitTradePrice, 0);
      const discountAmount = items.reduce((s, it) => s + (it.quantity * it.unitTradePrice * (it.discountPercent / 100)), 0);
      const grandTotal = subtotal - discountAmount + deliveryCharge;
      const cogsTotal = items.reduce((s, it) => s + ((it.quantity + it.bonusQuantity) * it.unitCostPrice), 0);

      setInvoices((prev) => [
        {
          id: `inv-${Date.now()}`,
          invoiceNumber,
          challanNumber: `CH-${invoiceNumber.slice(4)}`,
          customerId,
          customerName: selectedCustomer?.tradeName || "Customer Pharmacy",
          salesmanName: distributors.find((d) => d.id === distributorId)?.name || "Direct Sales",
          issueDate: orderDate,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          subtotal,
          discountAmount,
          taxAmount: 0,
          grandTotal,
          cogsTotal,
          grossProfit: grandTotal - cogsTotal,
          paidAmount: 0,
          dueAmount: grandTotal,
          status: "ISSUED",
          deliveryStatus: "DELIVERED",
          items: items.map((it) => {
            const med = medicines.find((m) => m.id === it.medicineId);
            const b = batches.find((b) => b.id === it.batchId);
            return {
              medicineName: med?.brandName || "Medicine",
              genericName: med?.genericName || "",
              dosageForm: med?.dosageForm || "",
              batchNumber: b?.batchNumber || "BATCH-01",
              expiryDate: b?.expiryDate || "2027-12-31",
              quantity: it.quantity,
              bonusQuantity: it.bonusQuantity,
              unitPrice: it.unitTradePrice,
              tradePrice: it.unitTradePrice,
              mrp: it.unitMrp,
              totalAmount: it.quantity * it.unitTradePrice * (1 - it.discountPercent / 100),
            };
          }),
        },
        ...prev,
      ]);

      setTimeout(() => {
        setIsAddOpen(false);
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback({ type: "error", message: res.error || "Order failed." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wholesale Sales Orders & Invoicing"
        description="Book field sales orders with First-Expire, First-Out (FEFO) batch allocation, customer credit barrier checks, and instant wholesale tax invoicing."
        badge={<Badge variant="outline">Module M07 & M08</Badge>}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-9">
                <Plus className="h-3.5 w-3.5" />
                Book Wholesale Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  Wholesale Sales Order & Tax Invoicing
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

              <form onSubmit={handleCreateSale} className="space-y-5 text-xs">
                {/* Customer & Route Selection */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Customer Pharmacy *</Label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select pharmacy" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.tradeName} ({c.status === "BLOCKED_OVERDUE" ? "BLOCKED" : "ACTIVE"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Sales Representative (MR)</Label>
                    <Select value={distributorId} onValueChange={setDistributorId}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select salesman" />
                      </SelectTrigger>
                      <SelectContent>
                        {distributors.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} ({d.assignedTerritory})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="orderDate" className="text-xs font-medium">Invoice Date *</Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                {/* Customer Credit Notice */}
                {selectedCustomer && (
                  <div className={`p-2.5 rounded-md border flex items-center justify-between text-xs ${
                    selectedCustomer.status === "BLOCKED_OVERDUE"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}>
                    <span>
                      <strong>Drug License:</strong> {selectedCustomer.drugLicenseNo} (Exp: {formatDate(selectedCustomer.drugLicenseExpiry)})
                    </span>
                    <span>
                      <strong>Credit Limit:</strong> {formatCurrency(selectedCustomer.creditLimit)} | <strong>Current Dues:</strong> {formatCurrency(selectedCustomer.currentDue)}
                    </span>
                  </div>
                )}

                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Ordered Medicines & Batch Allocation ({items.length})
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
                    {items.map((item, idx) => {
                      const availableBatches = batches.filter((b) => b.medicineId === item.medicineId && b.quantityOnHand > 0);
                      return (
                        <div key={idx} className="p-3 border rounded-lg bg-card space-y-3">
                          <div className="grid grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[11px]">Medicine *</Label>
                              <Select
                                value={item.medicineId}
                                onValueChange={(val) => {
                                  const selectedMed = medicines.find((m) => m.id === val);
                                  const matchingBatch = batches.find((b) => b.medicineId === val && b.quantityOnHand > 0) || batches[0];
                                  const updated = [...items];
                                  updated[idx] = {
                                    ...updated[idx],
                                    medicineId: val,
                                    batchId: matchingBatch?.id || "",
                                    unitTradePrice: selectedMed?.unitTradePrice || 2.20,
                                    unitCostPrice: matchingBatch?.unitCostPrice || 1.85,
                                    unitMrp: selectedMed?.unitMrp || 2.50,
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
                              <Label className="text-[11px]">FEFO Batch *</Label>
                              <Select
                                value={item.batchId}
                                onValueChange={(val) => {
                                  const selectedBatch = batches.find((b) => b.id === val);
                                  const updated = [...items];
                                  updated[idx] = {
                                    ...updated[idx],
                                    batchId: val,
                                    unitCostPrice: selectedBatch?.unitCostPrice || 1.85,
                                  };
                                  setItems(updated);
                                }}
                              >
                                <SelectTrigger className="text-xs h-8 font-mono">
                                  <SelectValue placeholder="Select batch" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableBatches.length > 0 ? (
                                    availableBatches.map((b) => (
                                      <SelectItem key={b.id} value={b.id}>
                                        {b.batchNumber} (Exp: {formatDate(b.expiryDate)} | {b.quantityOnHand}u)
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="none" disabled>No stock available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px]">Billed Qty *</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updated = [...items];
                                  updated[idx].quantity = parseInt(e.target.value) || 1;
                                  setItems(updated);
                                }}
                                required
                                className="text-xs h-8 font-bold"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px]">Free Bonus Units</Label>
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
                          </div>

                          <div className="grid grid-cols-4 gap-2">
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
                                className="text-xs h-8"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px]">Discount %</Label>
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                max="100"
                                value={item.discountPercent}
                                onChange={(e) => {
                                  const updated = [...items];
                                  updated[idx].discountPercent = parseFloat(e.target.value) || 0;
                                  setItems(updated);
                                }}
                                className="text-xs h-8"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px]">Line Net Total</Label>
                              <div className="text-xs font-bold text-foreground h-8 flex items-center">
                                {formatCurrency(item.quantity * item.unitTradePrice * (1 - item.discountPercent / 100))}
                              </div>
                            </div>

                            {items.length > 1 && (
                              <div className="flex items-end justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-rose-600 hover:text-rose-700 h-8 px-2 text-xs"
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <DialogFooter className="pt-2 border-t flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Total: <strong className="text-foreground text-sm">
                      {formatCurrency(items.reduce((s, it) => s + it.quantity * it.unitTradePrice * (1 - it.discountPercent / 100), 0))}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                      {isSubmitting ? "Generating..." : "Generate Wholesale Tax Invoice"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={invoices}
        searchKey="invoiceNumber"
        searchPlaceholder="Search invoice #, customer..."
      />

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        open={isPrintOpen}
        onOpenChange={setIsPrintOpen}
        invoice={printInvoice}
      />
    </div>
  );
}
