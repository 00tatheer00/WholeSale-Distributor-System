"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Building2,
  DollarSign,
  Package,
  Layers,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  CreditCard,
  Receipt,
  Printer,
  XCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cancelPurchaseAction } from "@/server/actions/purchase.actions";
import { PurchaseDetailRecord } from "@/types/models";

interface PurchaseDetailClientProps {
  purchase: PurchaseDetailRecord;
}

export function PurchaseDetailClient({ purchase }: PurchaseDetailClientProps) {
  const router = useRouter();

  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleCancelPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCancelling(true);
    setFeedback(null);

    const res = await cancelPurchaseAction(purchase.id, cancelReason);
    setIsCancelling(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Purchase order cancelled & stock reversed." });
      setIsCancelOpen(false);
      router.refresh();
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to cancel purchase consignment." });
    }
  };

  const printGRN = () => {
    window.print();
  };

  const totalUnits = purchase.items.reduce((sum, item) => sum + item.quantity + (item.bonusQuantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
              Purchase Consignment #{purchase.poNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              Intake Date: {formatDate(purchase.purchaseDate)} • Warehouse: {purchase.warehouseName || "Main Depot"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={printGRN} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            Print Goods Received Note (GRN)
          </Button>

          {purchase.status !== "CANCELLED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelOpen(true)}
              className="gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel & Reverse PO
            </Button>
          )}

          <Button asChild size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 font-semibold shadow-sm">
            <Link href="/purchases/new">
              <Truck className="h-3.5 w-3.5" />
              New Purchase
            </Link>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg border flex items-center justify-between text-sm ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFeedback(null)} className="h-6 w-6 p-0">
            &times;
          </Button>
        </div>
      )}

      {/* Cancellation Notice if Cancelled */}
      {purchase.status === "CANCELLED" && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <XCircle className="h-4 w-4 shrink-0" />
            Purchase Consignment Voided & Cancelled
          </div>
          <p>
            <strong>Reason:</strong> {purchase.cancellationReason || "Voided by admin"}
          </p>
          {purchase.cancelledAt && (
            <p className="text-[11px] text-muted-foreground">
              Cancelled on: {formatDate(purchase.cancelledAt)}
            </p>
          )}
        </div>
      )}

      {/* Purchase Header Card */}
      <Card className="bg-card border-border/60 shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    purchase.status === "RECEIVED"
                      ? "default"
                      : purchase.status === "CANCELLED"
                      ? "destructive"
                      : "secondary"
                  }
                  className={`text-[11px] ${
                    purchase.status === "RECEIVED"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : purchase.status === "CANCELLED"
                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {purchase.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[11px] ${
                    purchase.paymentStatus === "PAID"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : purchase.paymentStatus === "PARTIALLY_PAID"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  }`}
                >
                  {purchase.paymentStatus === "PAID"
                    ? "Paid In Full"
                    : purchase.paymentStatus === "PARTIALLY_PAID"
                    ? "Partially Paid"
                    : "Unpaid (Due)"}
                </Badge>
              </div>

              <div className="pt-1">
                <Link
                  href={`/suppliers/${purchase.supplierId}`}
                  className="font-bold text-foreground text-sm hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{purchase.supplierName}</span>
                </Link>
                <p className="text-xs text-muted-foreground pt-0.5">
                  Supplier Inv: <span className="font-mono font-medium text-foreground">{purchase.supplierInvoiceNo || "Direct Intake"}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Consignment Dates</div>
              <div>
                Intake Date: <span className="font-mono text-foreground font-medium">{formatDate(purchase.purchaseDate)}</span>
              </div>
              {purchase.expectedDeliveryDate && (
                <div>
                  Delivery Date: <span className="font-mono text-foreground">{formatDate(purchase.expectedDeliveryDate)}</span>
                </div>
              )}
              <div className="text-muted-foreground pt-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Recorded By: {purchase.createdByName || "System Admin"}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Warehouse Allocation</div>
              <div className="font-semibold text-foreground">{purchase.warehouseName || "Central Distribution Hub"}</div>
              {purchase.notes && (
                <div className="text-muted-foreground pt-1">
                  Memo: <em>&quot;{purchase.notes}&quot;</em>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grand Total</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatCurrency(purchase.grandTotal)}
              </p>
              <p className="text-[11px] text-muted-foreground">{purchase.items.length} Line Items</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid Amount</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(purchase.paidAmount)}
              </p>
              <p className="text-[11px] text-emerald-600/80 font-medium">Settled to supplier</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding Due</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(purchase.dueAmount)}
              </p>
              <p className="text-[11px] text-rose-600/80 font-medium">Pending payable</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Physical Intake Units</p>
              <p className="text-2xl font-bold text-foreground font-mono">{totalUnits.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">Committed to Batches</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Received Items Table */}
      <Card className="bg-card border-border/60 shadow-sm">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Received Batch Consignment Items ({purchase.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/50 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Medicine Description</th>
                  <th className="py-2.5 px-3 font-semibold">Batch #</th>
                  <th className="py-2.5 px-3 font-semibold">Expiry Date</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Received Qty</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Bonus Qty</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Unit Cost (৳)</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Trade Price (৳)</th>
                  <th className="py-2.5 px-3 text-right font-semibold">MRP (৳)</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Disc %</th>
                  <th className="py-2.5 px-3 text-right font-semibold">VAT %</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Line Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {purchase.items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.medicineName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.genericName} • {item.dosageForm} {item.strength}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-foreground">
                      {item.batchNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {formatDate(item.expiryDate)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-foreground">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {item.bonusQuantity > 0 ? `+${item.bonusQuantity}` : "0"}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {formatCurrency(item.unitPurchaseCost)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      {formatCurrency(item.unitTradePrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      {formatCurrency(item.unitMrp)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      {item.discountPercent > 0 ? `${item.discountPercent}%` : "0%"}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      {item.taxPercent > 0 ? `${item.taxPercent}%` : "0%"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Sub-footer */}
          <div className="p-4 bg-muted/20 border-t border-border/50 flex flex-col sm:flex-row justify-end items-end gap-3 text-xs">
            <div className="space-y-1.5 min-w-[260px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-foreground">{formatCurrency(purchase.subtotalAmount)}</span>
              </div>
              {purchase.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Trade Discount:</span>
                  <span className="font-mono font-medium">- {formatCurrency(purchase.discountAmount)}</span>
                </div>
              )}
              {purchase.taxAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT / Taxes:</span>
                  <span className="font-mono font-medium">+ {formatCurrency(purchase.taxAmount)}</span>
                </div>
              )}
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between font-bold text-sm">
                <span className="text-foreground">Grand Total:</span>
                <span className="font-mono text-primary text-base">{formatCurrency(purchase.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Paid Amount:</span>
                <span className="font-mono">{formatCurrency(purchase.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold border-t border-dashed border-border/60 pt-1">
                <span>Outstanding Due:</span>
                <span className="font-mono text-sm">{formatCurrency(purchase.dueAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Payment Vouchers if any */}
      {purchase.payments.length > 0 && (
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              Payment Disbursements on this PO ({purchase.payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border/50 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Voucher #</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Method</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Amount (৳)</th>
                    <th className="py-2.5 px-4 font-semibold">Reference</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {purchase.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">{p.voucherNumber}</td>
                      <td className="py-3 px-3 text-muted-foreground">{formatDate(p.paymentDate)}</td>
                      <td className="py-3 px-3">{p.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{p.referenceNumber || "—"}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            p.status === "CONFIRMED"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-700 border-rose-500/30"
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Purchase Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCancelPurchase}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
                Void & Reverse Purchase Consignment
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel PO <strong>#{purchase.poNumber}</strong>?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg space-y-1 text-xs text-rose-700 dark:text-rose-300">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  Stock Reversal Guard
                </p>
                <p>
                  This action will deduct <strong>{totalUnits.toLocaleString()} units</strong> from the batches received in this order. If stock has already been sold, cancellation will be safely blocked.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cancelReason" className="text-xs font-semibold">
                  Mandatory Cancellation Reason <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="cancelReason"
                  required
                  placeholder="e.g., Damaged consignment returned to supplier"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCancelOpen(false)}>
                Keep PO
              </Button>
              <Button
                type="submit"
                disabled={isCancelling || cancelReason.trim().length < 3}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {isCancelling ? "Reversing Stock..." : "Confirm Void & Reversal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
