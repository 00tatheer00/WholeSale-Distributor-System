"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Search,
  SlidersHorizontal,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  Ban,
  Phone,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SaleQueryResult, SaleSummaryItem } from "@/server/services/sales.service";
import { cancelSaleAction } from "@/server/actions/sales.actions";
import { CustomerRecord } from "@/types/models";

interface SalesClientProps {
  initialSalesData?: SaleQueryResult;
  customers: CustomerRecord[];
}

export function SalesClient({ initialSalesData, customers }: SalesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [customerFilter, setCustomerFilter] = React.useState(searchParams.get("customer") || "ALL");
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get("status") || "ALL");
  const [paymentFilter, setPaymentFilter] = React.useState(searchParams.get("payment") || "ALL");
  const [deliveryFilter, setDeliveryFilter] = React.useState(searchParams.get("delivery") || "ALL");

  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [selectedSaleToCancel, setSelectedSaleToCancel] = React.useState<SaleSummaryItem | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const data = initialSalesData || {
    sales: [],
    totalCount: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalDue: 0,
    totalGrossProfit: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };

  const applyFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === "ALL") {
        current.delete(k);
      } else {
        current.set(k, v);
      }
    });
    if (!newParams.page) {
      current.delete("page");
    }
    router.push(`/sales?${current.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: search.trim() || null });
  };

  const handleConfirmCancel = async () => {
    if (!selectedSaleToCancel || !cancelReason.trim()) return;

    try {
      setIsCancelling(true);
      const res = await cancelSaleAction({
        saleId: selectedSaleToCancel.id,
        reason: cancelReason.trim(),
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: `Sale ${selectedSaleToCancel.saleNumber} has been cancelled and batch stock was restored.`,
        });
        setCancelModalOpen(false);
        setSelectedSaleToCancel(null);
        setCancelReason("");
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to cancel sale." });
      }
    } catch {
      setFeedback({ type: "error", message: "Unexpected error during cancellation." });
    } finally {
      setIsCancelling(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* 1. Header Section */}
      <PageHeader
        title="Wholesale Sales & Invoicing"
        description="B2B sales orders, FEFO automated batch allocation, wholesale tax invoicing, and credit controls."
      >
        <Button
          asChild
          className="bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm rounded-xl font-medium px-4 h-10 transition-all active:scale-95"
        >
          <Link href="/sales/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New Wholesale Order
          </Link>
        </Button>
      </PageHeader>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-medium border animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline ml-4 hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards (Lightweight Colorful Aesthetic) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Total Sales Revenue</span>
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-700">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(data.totalRevenue)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Across {data.totalCount} wholesale orders</div>
        </div>

        {/* Total Collected */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Collected at Booking</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.totalPaid)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Total cash/bank receipts logged</div>
        </div>

        {/* Total Remaining Due */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Accounts Receivable Due</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(data.totalDue)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Pending customer pharmacy dues</div>
        </div>

        {/* Realized Gross Profit */}
        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Gross Margin Profit</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(data.totalGrossProfit)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Historical batch COGS subtracted</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by order number (SO-...), invoice number, pharmacy name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9.5 pr-20 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm focus-visible:ring-1"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  applyFilters({ search: null });
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 text-xs font-medium text-[#0071E3]"
            >
              Search
            </Button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Customer Filter */}
            <Select
              value={customerFilter}
              onValueChange={(val) => {
                setCustomerFilter(val);
                applyFilters({ customer: val });
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl w-[160px] bg-background">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Customers</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.tradeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select
              value={paymentFilter}
              onValueChange={(val) => {
                setPaymentFilter(val);
                applyFilters({ payment: val });
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl w-[130px] bg-background">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Payments</SelectItem>
                <SelectItem value="PAID">Fully Paid</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Partial Paid</SelectItem>
                <SelectItem value="UNPAID">Unpaid / Due</SelectItem>
              </SelectContent>
            </Select>

            {/* Sale Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                applyFilters({ status: val });
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl w-[130px] bg-background">
                <SelectValue placeholder="Sale Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. Sales Orders Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order & Invoice #</th>
                <th className="px-4 py-3.5">Customer Pharmacy</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Items</th>
                <th className="px-4 py-3.5 text-right">Grand Total</th>
                <th className="px-4 py-3.5 text-right">Paid / Due</th>
                <th className="px-4 py-3.5 text-center">Payment</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">No sales orders found</p>
                    <p className="text-xs mt-1">Book a new wholesale order or adjust search parameters.</p>
                    <Button asChild size="sm" variant="outline" className="mt-4 rounded-xl">
                      <Link href="/sales/new">
                        <Plus className="h-3.5 w-3.5 mr-1" /> New Wholesale Order
                      </Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                data.sales.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                    {/* Order & Invoice # */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <Link
                          href={`/sales/${s.id}`}
                          className="font-mono font-bold text-foreground hover:text-[#0071E3] transition-colors"
                        >
                          {s.saleNumber}
                        </Link>
                        {s.invoiceNumber && (
                          <div className="text-[11px] text-muted-foreground font-mono">
                            Inv:{" "}
                            <Link
                              href={`/invoices/${s.invoiceNumber}`}
                              className="text-foreground/80 hover:underline"
                            >
                              {s.invoiceNumber}
                            </Link>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <Link
                          href={`/customers/${s.customerId}`}
                          className="font-semibold text-foreground hover:underline"
                        >
                          {s.customerName}
                        </Link>
                        <div className="text-[11px] text-muted-foreground">
                          {s.customerCode && <span className="font-mono">{s.customerCode} • </span>}
                          {s.customerPhone}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(s.saleDate)}
                    </td>

                    {/* Items */}
                    <td className="px-4 py-4 text-xs font-medium">
                      {s.itemsCount} lines
                    </td>

                    {/* Grand Total */}
                    <td className="px-4 py-4 text-right">
                      <div className="font-mono font-bold text-xs text-foreground">
                        {formatCurrency(s.grandTotal)}
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Profit: <strong>{formatCurrency(s.grossProfit)}</strong>
                      </div>
                    </td>

                    {/* Paid vs Due */}
                    <td className="px-4 py-4 text-right">
                      <div className="text-xs font-mono text-emerald-700">
                        Paid: <strong>{formatCurrency(s.paidAmount)}</strong>
                      </div>
                      <div className="text-xs font-mono font-semibold text-amber-700">
                        Due: <strong>{formatCurrency(s.dueAmount)}</strong>
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-4 text-center">
                      {s.paymentStatus === "PAID" && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">
                          Paid
                        </Badge>
                      )}
                      {s.paymentStatus === "PARTIALLY_PAID" && (
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-medium">
                          Partial
                        </Badge>
                      )}
                      {s.paymentStatus === "UNPAID" && (
                        <Badge variant="outline" className="text-rose-600 border-rose-200 text-[10px] font-medium">
                          Unpaid
                        </Badge>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      {s.status === "CONFIRMED" && (
                        <Badge className="bg-sky-50 text-[#0071E3] border-sky-200 text-[10px] font-medium">
                          Confirmed
                        </Badge>
                      )}
                      {s.status === "CANCELLED" && (
                        <Badge variant="destructive" className="text-[10px] font-medium">
                          Cancelled
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-[#0071E3] hover:bg-sky-50 rounded-lg"
                        >
                          <Link href={`/sales/${s.id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Link>
                        </Button>

                        {s.invoiceNumber && (
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                          >
                            <Link href={`/invoices/${s.invoiceNumber}`}>
                              <FileText className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}

                        {s.status === "CONFIRMED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSaleToCancel(s);
                              setCancelModalOpen(true);
                            }}
                            title="Cancel Wholesale Sale & Restore Batch Inventory"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600 rounded-lg"
                          >
                            <Ban className="h-3.5 w-3.5 text-rose-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 bg-muted/20 border-t border-border/80 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-semibold text-foreground">{(data.page - 1) * data.pageSize + 1}</span> to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(data.page * data.pageSize, data.totalCount)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{data.totalCount}</span> orders
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => applyFilters({ page: String(data.page - 1) })}
                className="h-8 px-2.5 rounded-lg text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
              </Button>

              <span className="px-2 text-xs font-medium text-foreground">
                Page {data.page} of {data.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => applyFilters({ page: String(data.page + 1) })}
                className="h-8 px-2.5 rounded-lg text-xs"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Cancel Sale Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 text-base">
              <AlertCircle className="h-5 w-5" />
              Cancel Sale {selectedSaleToCancel?.saleNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Cancelling this order will automatically:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground bg-muted/30 p-3 rounded-xl">
              <li>Restore all deducted batch quantities to active inventory.</li>
              <li>Record a <code className="font-mono text-foreground font-semibold">SALE_RETURN</code> stock movement audit ledger.</li>
              <li>Reverse customer accounts receivable due of <strong className="text-foreground">{formatCurrency(selectedSaleToCancel?.dueAmount || 0)}</strong>.</li>
              <li>Mark wholesale tax invoice as <code className="font-mono text-rose-600">CANCELLED</code>.</li>
            </ul>

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-semibold text-foreground">
                Cancellation Reason <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                placeholder="e.g. Pharmacy customer rejected delivery or order booked in error..."
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
              {isCancelling ? "Processing Reversal..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
