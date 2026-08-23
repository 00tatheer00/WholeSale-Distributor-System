"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  CreditCard,
  Truck,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Printer,
  Receipt,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SupplierDetailRecord } from "@/types/models";
import { recordSupplierPaymentAction } from "@/server/actions/supplier.actions";
import { SupplierPaymentInput } from "@/validations/payment.schema";

interface SupplierDetailClientProps {
  supplier: SupplierDetailRecord;
}

export function SupplierDetailClient({ supplier }: SupplierDetailClientProps) {
  const router = useRouter();
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [paymentData, setPaymentData] = React.useState<SupplierPaymentInput>({
    supplierId: supplier.id,
    amount: supplier.currentPayable > 0 ? supplier.currentPayable : 0,
    paymentMethod: "BANK_TRANSFER",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNo: "",
    bankName: "",
    chequeNumber: "",
    notes: "",
  });

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await recordSupplierPaymentAction(paymentData);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Payment voucher logged successfully!" });
      setIsPaymentOpen(false);
      router.refresh();
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to record payment voucher." });
    }
  };

  const printStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-9 px-2">
            <Link href="/suppliers">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Suppliers
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {supplier.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Manufacturer & Primary Vendor Profile • Code: <span className="font-mono">{supplier.code || "SUP-MAIN"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={printStatement} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            Print Statement
          </Button>

          {supplier.currentPayable > 0 && (
            <Button
              size="sm"
              onClick={() => {
                setPaymentData({
                  ...paymentData,
                  amount: supplier.currentPayable,
                });
                setIsPaymentOpen(true);
              }}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              <Receipt className="h-3.5 w-3.5" />
              Record Payment
            </Button>
          )}

          <Button asChild size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 font-semibold shadow-sm">
            <Link href={`/purchases/new?supplierId=${supplier.id}`}>
              <Plus className="h-3.5 w-3.5" />
              New Purchase Order
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

      {/* Supplier Profile Info Header Card */}
      <Card className="bg-card border-border/60 shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={supplier.status === "ACTIVE" ? "default" : "secondary"}
                  className={`text-[11px] ${
                    supplier.status === "ACTIVE"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {supplier.status}
                </Badge>
                <Badge variant="outline" className="text-[11px] font-mono">
                  Net {supplier.creditDays} Days Credit
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {supplier.address ? `${supplier.address}, ${supplier.city || "Dhaka"}` : "Dhaka, Bangladesh"}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Contact Person</div>
              <div className="font-semibold text-foreground">{supplier.contactPerson || "HQ Supply Desk"}</div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{supplier.phone}</span>
              </div>
              {supplier.email && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{supplier.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Compliance & Licensing</div>
              <div>
                Drug License: <span className="font-mono font-medium text-foreground">{supplier.drugLicenseNo || "N/A"}</span>
              </div>
              <div>
                TIN / VAT: <span className="font-mono font-medium text-foreground">{supplier.taxIdTin || "N/A"}</span>
              </div>
              <div>
                Opening Due: <span className="font-mono font-medium text-foreground">{formatCurrency(supplier.openingBalance)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Purchases</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatCurrency(supplier.totalPurchases)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {supplier.recentPurchases.length} Purchase Consignments
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Truck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Paid</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(supplier.totalPaid)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {supplier.recentPayments.length} Payment Vouchers
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding Payable (AP)</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(supplier.currentPayable)}
              </p>
              <p className="text-[11px] text-rose-600/80 font-medium">
                {supplier.currentPayable > 0 ? "Pending Payment Due" : "All Accounts Cleared"}
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplied Products</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {supplier.suppliedMedicinesCount || 0}
              </p>
              <p className="text-[11px] text-muted-foreground">Registered SKUs in Catalog</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Ledger, Purchases, Payments */}
      <Tabs defaultValue="ledger" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="ledger" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Financial Ledger & Statement ({supplier.ledger.length})
          </TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            Purchase Consignments ({supplier.recentPurchases.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            Payment Vouchers ({supplier.recentPayments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ledger */}
        <TabsContent value="ledger" className="space-y-4">
          <Card className="bg-card border-border/60 shadow-sm">
            <CardHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Chronological Accounts Payable (AP) Ledger</CardTitle>
                <CardDescription className="text-xs">
                  Immutable double-entry transaction record for invoices, payment disbursements, and running payable balances.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border/50 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Transaction Type</th>
                      <th className="py-2.5 px-3 font-semibold">Reference #</th>
                      <th className="py-2.5 px-4 font-semibold">Description</th>
                      <th className="py-2.5 px-4 text-right font-semibold">Debit (Purchases ৳)</th>
                      <th className="py-2.5 px-4 text-right font-semibold">Credit (Paid ৳)</th>
                      <th className="py-2.5 px-4 text-right font-semibold">Running Balance (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {supplier.ledger.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                          No ledger transactions recorded yet for this supplier.
                        </td>
                      </tr>
                    ) : (
                      supplier.ledger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                            {formatDate(entry.date)}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                entry.type === "PURCHASE"
                                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                                  : entry.type === "PAYMENT"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                  : entry.type === "CANCELLATION_REVERSAL"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                  : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                              }`}
                            >
                              {entry.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-foreground">
                            {entry.referenceNumber}
                          </td>
                          <td className="py-3 px-4 text-foreground/80 max-w-md truncate">
                            {entry.description}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                            {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                            {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                            {formatCurrency(entry.runningBalance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Purchases */}
        <TabsContent value="purchases" className="space-y-4">
          <Card className="bg-card border-border/60 shadow-sm">
            <CardHeader className="p-4 border-b border-border/50">
              <CardTitle className="text-sm font-semibold">Purchase Consignments from {supplier.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border/50 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">PO Number</th>
                      <th className="py-2.5 px-3 font-semibold">Intake Date</th>
                      <th className="py-2.5 px-3 font-semibold">Supplier Inv #</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Grand Total</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Paid</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Due</th>
                      <th className="py-2.5 px-3 font-semibold">Payment Status</th>
                      <th className="py-2.5 px-3 font-semibold">PO Status</th>
                      <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {supplier.recentPurchases.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-muted-foreground text-xs">
                          No purchase orders recorded yet for this supplier.
                        </td>
                      </tr>
                    ) : (
                      supplier.recentPurchases.map((po) => (
                        <tr key={po.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-foreground">
                            {po.poNumber}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {formatDate(po.purchaseDate)}
                          </td>
                          <td className="py-3 px-3 font-mono text-muted-foreground">
                            {po.supplierInvoiceNo || "—"}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-foreground">
                            {formatCurrency(po.grandTotal)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(po.paidAmount)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400 font-medium">
                            {formatCurrency(po.dueAmount)}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                po.paymentStatus === "PAID"
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                                  : po.paymentStatus === "PARTIALLY_PAID"
                                  ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-700 border-rose-500/30"
                              }`}
                            >
                              {po.paymentStatus}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${
                                po.status === "CANCELLED"
                                  ? "bg-rose-500/10 text-rose-700 border-rose-500/30"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {po.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs">
                              <Link href={`/purchases/${po.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Payments */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="bg-card border-border/60 shadow-sm">
            <CardHeader className="p-4 border-b border-border/50">
              <CardTitle className="text-sm font-semibold">Payment Vouchers Issued to {supplier.name}</CardTitle>
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
                      <th className="py-2.5 px-4 font-semibold">Reference / Instrument</th>
                      <th className="py-2.5 px-4 font-semibold">Notes</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {supplier.recentPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                          No payment vouchers recorded yet for this supplier.
                        </td>
                      </tr>
                    ) : (
                      supplier.recentPayments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-foreground">
                            {pay.voucherNumber}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {formatDate(pay.paymentDate)}
                          </td>
                          <td className="py-3 px-3 font-medium">
                            {pay.paymentMethod}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(pay.amount)}
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-foreground">
                            {pay.referenceNumber || pay.chequeNumber || "—"}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                            {pay.notes || "—"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                pay.status === "CONFIRMED"
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-700 border-rose-500/30"
                              }`}
                            >
                              {pay.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleRecordPayment}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Record Supplier Payment Voucher
              </DialogTitle>
              <DialogDescription>
                Issue a payment settlement for <strong>{supplier.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4">
              <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Current Outstanding Due:</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {formatCurrency(supplier.currentPayable)}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payAmount" className="text-xs font-semibold">
                  Payment Amount (৳) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="payAmount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={supplier.currentPayable > 0 ? supplier.currentPayable : undefined}
                  required
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="payMethod" className="text-xs font-semibold">
                    Payment Instrument
                  </Label>
                  <Select
                    value={paymentData.paymentMethod}
                    onValueChange={(val: any) => setPaymentData({ ...paymentData, paymentMethod: val })}
                  >
                    <SelectTrigger id="payMethod" className="text-xs h-9">
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
                  <Label htmlFor="payDate" className="text-xs font-semibold">
                    Payment Date
                  </Label>
                  <Input
                    id="payDate"
                    type="date"
                    className="text-xs h-9"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="refNo" className="text-xs">
                  Reference / Cheque / Transaction #
                </Label>
                <Input
                  id="refNo"
                  placeholder="e.g., TXN-998822 or Cheque #01928"
                  className="text-xs"
                  value={paymentData.referenceNo || ""}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNo: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs">
                  Payment Notes / Memo
                </Label>
                <Input
                  id="notes"
                  placeholder="e.g., Settlement against batch consignments"
                  className="text-xs"
                  value={paymentData.notes || ""}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSubmitting ? "Recording..." : "Confirm & Post Voucher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
