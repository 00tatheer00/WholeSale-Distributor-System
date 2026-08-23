"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Printer,
  FileText,
  Building2,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Ban,
  CheckCircle2,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SaleDetailRecord } from "@/server/services/sales.service";
import { cancelSaleAction } from "@/server/actions/sales.actions";

interface SaleDetailsClientProps {
  sale: SaleDetailRecord;
}

export function SaleDetailsClient({ sale }: SaleDetailsClientProps) {
  const router = useRouter();

  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) return;

    try {
      setIsCancelling(true);
      const res = await cancelSaleAction({
        saleId: sale.id,
        reason: cancelReason.trim(),
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: `Sale ${sale.saleNumber} has been cancelled and batch stock was restored.`,
        });
        setCancelModalOpen(false);
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to cancel sale." });
      }
    } catch {
      setFeedback({ type: "error", message: "Unexpected error during cancellation." });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1300px] mx-auto pb-20">
      {/* 1. Navigation & Actions */}
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

        <div className="flex items-center gap-2">
          {sale.invoiceNumber && (
            <Button
              asChild
              className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4 shadow-sm"
            >
              <Link href={`/invoices/${sale.invoiceNumber}`}>
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                View & Print Tax Invoice
              </Link>
            </Button>
          )}

          {sale.status === "CONFIRMED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              className="rounded-xl text-xs h-9 text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Ban className="h-3.5 w-3.5 mr-1.5" />
              Cancel Sale
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-medium border animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {sale.saleNumber}
            </h1>
            {sale.status === "CONFIRMED" && (
              <Badge className="bg-sky-50 text-[#0071E3] border-sky-200 text-xs font-semibold">
                Confirmed
              </Badge>
            )}
            {sale.status === "CANCELLED" && (
              <Badge variant="destructive" className="text-xs font-semibold">
                Cancelled
              </Badge>
            )}
            {sale.paymentStatus === "PAID" && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                Fully Paid
              </Badge>
            )}
            {sale.paymentStatus === "PARTIALLY_PAID" && (
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-semibold">
                Partial Paid
              </Badge>
            )}
            {sale.paymentStatus === "UNPAID" && (
              <Badge variant="outline" className="text-rose-600 border-rose-200 text-xs font-semibold">
                Unpaid / Due
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Booked on {formatDate(sale.saleDate)} • Created by {sale.createdByName || "System Admin"}
          </p>
        </div>

        {sale.invoiceNumber && (
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Wholesale Tax Invoice:</span>
            <div className="font-mono font-bold text-sm text-[#0071E3]">
              <Link href={`/invoices/${sale.invoiceNumber}`} className="hover:underline">
                {sale.invoiceNumber}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Banner if Cancelled */}
      {sale.status === "CANCELLED" && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" /> This wholesale order was CANCELLED
          </div>
          <p>
            Cancelled on {sale.cancelledAt ? formatDate(sale.cancelledAt) : "N/A"} by{" "}
            {sale.cancelledByName || "Authorized Admin"}.
          </p>
          <p>
            <strong>Reason:</strong> {sale.cancellationReason || "No reason specified."}
          </p>
        </div>
      )}

      {/* 3. Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-sky-800">Grand Total (BDT)</div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(sale.grandTotal)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Invoice billed value</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-emerald-800">Amount Collected</div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(sale.paidAmount)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Cash/bank receipts</div>
        </div>

        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-amber-800">Accounts Receivable Due</div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(sale.dueAmount)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Pending customer settlement</div>
        </div>

        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-purple-800">Gross Margin Profit</div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(sale.grossProfit)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">
            COGS: {formatCurrency(sale.totalCogs)} ({Math.round((sale.grossProfit / sale.grandTotal) * 100)}% margin)
          </div>
        </div>
      </div>

      {/* 4. Customer Information Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-sm text-foreground pb-3 border-b border-border/60 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#0071E3]" /> Customer Pharmacy & Dispatch Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs">
          <div>
            <span className="text-muted-foreground">Pharmacy Name:</span>
            <div className="font-bold text-sm text-foreground mt-0.5">
              <Link href={`/customers/${sale.customerId}`} className="hover:underline">
                {sale.customerName}
              </Link>
            </div>
            {sale.customerCode && (
              <div className="font-mono text-muted-foreground mt-0.5">Code: {sale.customerCode}</div>
            )}
          </div>

          <div>
            <span className="text-muted-foreground">Contact & Drug License:</span>
            <div className="font-semibold text-foreground mt-0.5">{sale.customerPhone}</div>
            <div className="font-mono text-muted-foreground mt-0.5">DGDA: {sale.companyDrugLicense || "Verified"}</div>
          </div>

          <div>
            <span className="text-muted-foreground">Assigned Salesman / Route:</span>
            <div className="font-semibold text-foreground mt-0.5">{sale.salesmanName}</div>
            <div className="text-muted-foreground mt-0.5">Delivery Status: {sale.deliveryStatus}</div>
          </div>
        </div>
      </div>

      {/* 5. Line Items & Historical Cost Breakdown */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-[#0071E3]" /> Billed Medicine Items ({sale.items.length})
          </h3>
          <span className="text-xs text-muted-foreground">Batch-specific historical COGS preserved</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-4 py-3.5">Medicine Name</th>
                <th className="px-4 py-3.5">Batch / Expiry</th>
                <th className="px-4 py-3.5 text-center">Qty / Bonus</th>
                <th className="px-4 py-3.5 text-right">Unit TP</th>
                <th className="px-4 py-3.5 text-right">Unit Cost (COGS)</th>
                <th className="px-4 py-3.5 text-right">Line Total</th>
                <th className="px-5 py-3.5 text-right">Gross Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {sale.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono">{idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-foreground text-xs">{item.medicineName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.genericName} • {item.dosageForm}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-semibold text-xs text-foreground">{item.batchNumber}</div>
                    <div className="text-[11px] text-muted-foreground">{formatDate(item.expiryDate)}</div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs font-mono">
                    <span className="font-bold text-foreground">{item.quantity}</span>
                    {item.bonusQuantity > 0 && (
                      <span className="text-emerald-700 ml-1 font-semibold">(+{item.bonusQuantity} free)</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs text-foreground">
                    {formatCurrency(item.unitTradePrice)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs text-muted-foreground">
                    {formatCurrency(item.unitCostPrice)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-xs text-foreground">
                    {formatCurrency(item.lineTotal)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-xs text-emerald-700">
                    {formatCurrency(item.lineGrossProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Cancel Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 text-base">
              <AlertCircle className="h-5 w-5" /> Cancel Sale {sale.saleNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Cancelling this order will automatically restore stock to all batches, reverse customer account dues, and void invoice.
            </p>

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-semibold text-foreground">
                Cancellation Reason <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                placeholder="Enter cancellation explanation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="rounded-xl bg-muted/20 text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              className="rounded-xl"
            >
              Close
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isCancelling || !cancelReason.trim()}
              onClick={handleConfirmCancel}
              className="rounded-xl font-medium"
            >
              {isCancelling ? "Processing..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
