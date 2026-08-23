"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Plus,
  Search,
  Landmark,
  Smartphone,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  Building2,
  FileText,
  Calendar,
  AlertCircle,
  Receipt,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Store,
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
  DialogTrigger,
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
import { PaymentQueryResult, PaymentDetailRecord } from "@/server/services/payment.service";
import { recordCustomerPaymentAction, getPaymentByIdAction } from "@/server/actions/payment.actions";
import { CustomerPaymentInput } from "@/validations/payment.schema";
import { CustomerRecord, DistributorRecord, PaymentRecord } from "@/types/models";

interface PaymentsClientProps {
  initialPaymentsData?: PaymentQueryResult;
  customers: CustomerRecord[];
  distributors: DistributorRecord[];
}

export function PaymentsClient({
  initialPaymentsData,
  customers,
  distributors,
}: PaymentsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [customerFilter, setCustomerFilter] = React.useState(searchParams.get("customer") || "ALL");
  const [methodFilter, setMethodFilter] = React.useState(searchParams.get("method") || "ALL");

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Receipt modal state
  const [selectedReceipt, setSelectedReceipt] = React.useState<PaymentDetailRecord | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = React.useState(false);
  const [loadingReceipt, setLoadingReceipt] = React.useState(false);

  const [formData, setFormData] = React.useState<CustomerPaymentInput>({
    customerId: customers[0]?.id || "",
    amount: 10000,
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNo: "",
    bankName: "",
    chequeNumber: "",
    chequeMaturityDate: "",
    distributorId: "",
    notes: "",
  });

  const data = initialPaymentsData || {
    payments: [],
    totalCount: 0,
    totalCollected: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };

  const selectedCustomer = customers.find((c) => c.id === formData.customerId);
  const currentDue = selectedCustomer?.currentDue || 0;
  const paymentAmount = Number(formData.amount) || 0;
  const remainingDue = Math.max(0, currentDue - paymentAmount);

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
    router.push(`/payments?${current.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: search.trim() || null });
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.amount || formData.amount <= 0) {
      setFeedback({ type: "error", message: "Please select customer and enter a valid positive payment amount." });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await recordCustomerPaymentAction(formData);

      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "Payment receipt created and allocated successfully.",
        });
        setIsAddOpen(false);
        setFormData({
          customerId: customers[0]?.id || "",
          amount: 10000,
          paymentMethod: "CASH",
          paymentDate: new Date().toISOString().split("T")[0],
          referenceNo: "",
          bankName: "",
          chequeNumber: "",
          chequeMaturityDate: "",
          distributorId: "",
          notes: "",
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to record payment." });
      }
    } catch {
      setFeedback({ type: "error", message: "Unexpected error while recording payment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReceipt = async (paymentId: string) => {
    try {
      setLoadingReceipt(true);
      const res = await getPaymentByIdAction(paymentId);
      if (res.success && res.data) {
        setSelectedReceipt(res.data);
        setReceiptModalOpen(true);
      }
    } catch {
      console.error("Failed to load receipt details");
    } finally {
      setLoadingReceipt(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* 1. Header Section */}
      <PageHeader
        title="Customer Collections & Money Receipts"
        description="Record customer settlements against outstanding dues, manage cash/bank/cheque receipts, and perform FIFO invoice reconciliation."
      >
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm rounded-xl font-medium px-4 h-10 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Record Customer Payment
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

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Total Money Collected</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.totalCollected)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Across {data.totalCount} money receipts</div>
        </div>

        {/* Bank & MFS */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Bank & Digital Transfers</span>
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-700">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            Direct Clearing
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Verified with bank statement</div>
        </div>

        {/* Cheques */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Cheques in Holding</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            Awaiting Maturity
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Scheduled for clearance</div>
        </div>

        {/* Receipts Count */}
        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Receipts Issued</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-700">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {data.totalCount} Receipts
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Permanent ledger records</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by receipt # (RCT-...), cheque #, pharmacy name..."
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

            {/* Payment Method Filter */}
            <Select
              value={methodFilter}
              onValueChange={(val) => {
                setMethodFilter(val);
                applyFilters({ method: val });
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl w-[140px] bg-background">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
                <SelectItem value="MFS_BKASH_NAGAD">bKash / Nagad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. Payments Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Receipt #</th>
                <th className="px-4 py-3.5">Customer Pharmacy</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5">Bank / Cheque Ref</th>
                <th className="px-4 py-3.5 text-right">Amount Collected</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">No money receipts found</p>
                    <p className="text-xs mt-1">Record a customer payment against due balance.</p>
                  </td>
                </tr>
              ) : (
                data.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    {/* Receipt # */}
                    <td className="px-5 py-4 font-mono font-bold text-foreground text-xs">
                      {p.receiptNo}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">
                      <Link
                        href={`/customers/${p.customerId}`}
                        className="font-semibold text-foreground hover:underline"
                      >
                        {p.customerName}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">
                        Collector: {p.distributorName}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(p.paymentDate)}
                    </td>

                    {/* Method */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        {p.paymentMethod === "CASH" && <CreditCard className="h-3.5 w-3.5 text-emerald-600" />}
                        {p.paymentMethod === "BANK_TRANSFER" && <Landmark className="h-3.5 w-3.5 text-sky-600" />}
                        {p.paymentMethod === "CHEQUE" && <Clock className="h-3.5 w-3.5 text-amber-600" />}
                        {p.paymentMethod === "MFS_BKASH_NAGAD" && <Smartphone className="h-3.5 w-3.5 text-pink-600" />}
                        <span className="capitalize">{p.paymentMethod.replace(/_/g, " ").toLowerCase()}</span>
                      </div>
                    </td>

                    {/* Bank / Cheque */}
                    <td className="px-4 py-4 text-xs font-mono">
                      {p.bankName ? <span>{p.bankName}</span> : <span className="text-muted-foreground">—</span>}
                      {p.chequeNumber && (
                        <div className="text-[11px] text-muted-foreground">Chq: {p.chequeNumber}</div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4 text-right font-mono font-bold text-xs text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">
                        Confirmed
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReceipt(p.id)}
                        className="h-8 px-2.5 text-xs text-[#0071E3] hover:bg-sky-50 rounded-lg"
                      >
                        <Printer className="h-3.5 w-3.5 mr-1" /> Receipt
                      </Button>
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
              of <span className="font-semibold text-foreground">{data.totalCount}</span> receipts
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

      {/* 6. Record Payment Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Record Customer Payment & Money Receipt
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitPayment} className="space-y-4 pt-2">
            {/* Customer Pharmacy */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Customer Pharmacy <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(val) => setFormData({ ...formData, customerId: val })}
              >
                <SelectTrigger className="h-10 rounded-xl text-xs bg-muted/20">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="text-xs">
                        <span className="font-semibold">{c.tradeName}</span>
                        <span className="text-amber-700 ml-2 font-bold">• Due: {formatCurrency(c.currentDue)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Live Due Calculation Deck */}
            {selectedCustomer && (
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Current Due:</span>
                  <div className="font-mono font-bold text-amber-700 mt-0.5">
                    {formatCurrency(currentDue)}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Payment Amount:</span>
                  <div className="font-mono font-bold text-emerald-700 mt-0.5">
                    {formatCurrency(paymentAmount)}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Remaining Balance:</span>
                  <div className="font-mono font-bold text-foreground mt-0.5">
                    {formatCurrency(remainingDue)}
                  </div>
                </div>
              </div>
            )}

            {/* Amount & Method */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Payment Amount (৳ BDT) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="h-10 rounded-xl bg-muted/20 text-sm font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(val: any) => setFormData({ ...formData, paymentMethod: val })}
                >
                  <SelectTrigger className="h-10 rounded-xl text-xs bg-muted/20">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash Collection</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Online Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque / Demand Draft</SelectItem>
                    <SelectItem value="MFS_BKASH_NAGAD">bKash / Nagad / MFS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bank / Cheque Fields */}
            {formData.paymentMethod !== "CASH" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Bank Name / Wallet</Label>
                  <Input
                    placeholder="e.g. Dutch-Bangla Bank"
                    value={formData.bankName || ""}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="h-9 rounded-xl bg-muted/20 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Cheque # / Trx Reference</Label>
                  <Input
                    placeholder="e.g. CHQ-99120 / Trx-88192"
                    value={formData.chequeNumber || formData.referenceNo || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chequeNumber: e.target.value,
                        referenceNo: e.target.value,
                      })
                    }
                    className="h-9 rounded-xl bg-muted/20 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Date & Collector */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Collection Date</Label>
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Collecting Representative</Label>
                <Select
                  value={formData.distributorId || ""}
                  onValueChange={(val) => setFormData({ ...formData, distributorId: val })}
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-muted/20">
                    <SelectValue placeholder="Direct Cashier / HQ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Direct Cashier / HQ</SelectItem>
                    {distributors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.assignedTerritory})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Notes / Remarks</Label>
              <Textarea
                placeholder="Optional payment notes..."
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="rounded-xl bg-muted/20 text-xs resize-none"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium"
              >
                {isSubmitting ? "Generating Receipt..." : "Record & Allocate Receipt"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. Printable Money Receipt Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between border-b pb-3">
              <span className="text-base font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Customer Money Receipt
              </span>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-8 px-3 print:hidden"
              >
                <Printer className="h-3.5 w-3.5 mr-1" /> Print Receipt
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-6 pt-2 text-xs font-sans">
              {/* Receipt Header */}
              <div className="flex justify-between items-start pb-4 border-b">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{selectedReceipt.companyName}</h3>
                  <p className="text-muted-foreground text-[11px]">{selectedReceipt.companyAddress}</p>
                  <p className="text-muted-foreground text-[11px]">Phone: {selectedReceipt.companyPhone}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-extrabold text-sm text-[#0071E3]">
                    {selectedReceipt.receiptNo}
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    Date: <strong>{formatDate(selectedReceipt.paymentDate)}</strong>
                  </div>
                </div>
              </div>

              {/* Customer Block */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-muted/20 border border-border/60">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">Received From:</span>
                  <div className="font-bold text-foreground text-sm mt-0.5">{selectedReceipt.customerName}</div>
                  <div className="text-muted-foreground text-[11px]">{selectedReceipt.customerAddress}</div>
                  <div className="font-mono text-muted-foreground text-[11px]">DL: {selectedReceipt.customerDrugLicense}</div>
                </div>

                <div className="text-right">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">Payment Method:</span>
                  <div className="font-semibold text-foreground text-xs mt-0.5">
                    {selectedReceipt.paymentMethod.replace("_", " ")}
                  </div>
                  {selectedReceipt.bankName && <div className="text-[11px] text-muted-foreground">Bank: {selectedReceipt.bankName}</div>}
                  {selectedReceipt.chequeNumber && (
                    <div className="font-mono text-[11px] text-muted-foreground">Cheque: {selectedReceipt.chequeNumber}</div>
                  )}
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2 font-mono">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Previous Outstanding Balance:</span>
                  <span>{formatCurrency(selectedReceipt.previousBalance)}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-emerald-800 pt-1 border-t border-emerald-200">
                  <span>Amount Received:</span>
                  <span>{formatCurrency(selectedReceipt.amount)}</span>
                </div>

                <div className="flex justify-between text-xs text-amber-800 font-bold pt-1 border-t border-dashed border-emerald-200">
                  <span>New Outstanding Due:</span>
                  <span>{formatCurrency(selectedReceipt.newBalance)}</span>
                </div>
              </div>

              {/* Allocated Invoices */}
              {selectedReceipt.allocatedInvoices && selectedReceipt.allocatedInvoices.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Invoices Settled Under This Receipt:
                  </span>
                  <div className="space-y-1">
                    {selectedReceipt.allocatedInvoices.map((inv, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-muted/20 border border-border/40 flex justify-between font-mono text-[11px]"
                      >
                        <span>{inv.invoiceNumber} (Total: {formatCurrency(inv.invoiceTotal)})</span>
                        <span className="font-bold text-emerald-700">Allocated: {formatCurrency(inv.allocatedAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-muted-foreground">
                <div className="border-t border-border/80 pt-2">
                  <p className="font-semibold text-foreground">{selectedReceipt.recordedByName}</p>
                  <p className="text-[10px]">Authorized Cashier / Collector</p>
                </div>

                <div className="border-t border-border/80 pt-2">
                  <p className="font-semibold text-foreground">Customer Representative</p>
                  <p className="text-[10px]">Signature & Seal</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
