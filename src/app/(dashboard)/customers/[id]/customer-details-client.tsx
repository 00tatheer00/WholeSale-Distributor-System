"use client";

import * as React from "react";
import Link from "next/link";
import {
  Store,
  ArrowLeft,
  Edit,
  FileText,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  ShoppingCart,
  Clock,
  ShieldCheck,
  TrendingUp,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomerDetailRecord } from "@/types/models";

interface CustomerDetailsClientProps {
  customer: CustomerDetailRecord;
}

export function CustomerDetailsClient({ customer }: CustomerDetailsClientProps) {
  const [activeTab, setActiveTab] = React.useState<"profile" | "sales" | "payments" | "ledger">("profile");

  const expDate = customer.drugLicenseExpiry ? new Date(customer.drugLicenseExpiry) : null;
  const isExpiringSoon = expDate && expDate.getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000;
  const isExpired = expDate && expDate.getTime() < Date.now();

  const fin = customer.financialSummary;

  return (
    <div className="space-y-6 max-w-[1300px] mx-auto pb-20">
      {/* 1. Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Customers Directory
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs h-9"
          >
            <Link href={`/customers/${customer.id}/ledger`}>
              <FileText className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
              Customer Statement / Ledger
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 shadow-sm"
          >
            <Link href={`/customers/${customer.id}/edit`}>
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Customer Title & Identification Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-[#0071E3] shrink-0">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  {customer.tradeName}
                </h1>
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-semibold bg-muted/40"
                >
                  {customer.customerCode || "CUST-NO-CODE"}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-xs font-normal bg-muted/60 text-foreground"
                >
                  {customer.customerType.replace(/_/g, " ")}
                </Badge>
                {customer.status === "ACTIVE" && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium">
                    Active
                  </Badge>
                )}
                {customer.status === "BLOCKED_OVERDUE" && (
                  <Badge variant="destructive" className="text-xs font-medium">
                    Overdue Hold
                  </Badge>
                )}
                {customer.status === "INACTIVE" && (
                  <Badge variant="outline" className="text-muted-foreground text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Proprietor: <strong>{customer.proprietorName || "N/A"}</strong> • Route:{" "}
                <strong>{customer.assignedRoute || "Unassigned"}</strong> • City:{" "}
                <strong>{customer.city || "Dhaka"}</strong>
              </p>
            </div>
          </div>

          {/* Quick Action Placeholders */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Sales Order booking is scheduled in Phase 9"
              className="rounded-xl text-xs h-9 opacity-75"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              Book Sale (Phase 9)
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Top Financial Metrics Row (4 Pastel Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Outstanding Balance */}
        <div className="bg-amber-50/80 border border-amber-100/90 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Current Outstanding Due</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(fin.currentDue)}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            Receivable across {fin.invoicesCount} invoices
          </div>
        </div>

        {/* Credit Limit */}
        <div className="bg-sky-50/80 border border-sky-100/90 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Credit Limit</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <Building2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(fin.creditLimit)}
          </div>
          <div className="text-[11px] text-sky-700 mt-1">
            Max credit period: {customer.maxDueDays} days
          </div>
        </div>

        {/* Available Credit */}
        <div className="bg-emerald-50/80 border border-emerald-100/90 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Available Credit</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(fin.availableCredit)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Remaining credit room for new sales
          </div>
        </div>

        {/* Total Historical Purchases */}
        <div className="bg-purple-50/80 border border-purple-100/90 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Total Purchases</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-700">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(fin.totalSales)}
          </div>
          <div className="text-[11px] text-purple-700 mt-1">
            Paid: {formatCurrency(fin.totalPaid)}
          </div>
        </div>
      </div>

      {/* 4. Credit Risk Assessment Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            Credit Health & Risk Status:
            {customer.creditStatus === "NORMAL" && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                Normal Health
              </Badge>
            )}
            {customer.creditStatus === "WARNING" && (
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                Warning: &gt;85% Utilized
              </Badge>
            )}
            {customer.creditStatus === "EXCEEDED" && (
              <Badge variant="destructive" className="text-[10px]">
                Critical: Credit Limit Exceeded
              </Badge>
            )}
          </span>

          <span className="font-mono font-bold text-muted-foreground">
            {customer.creditUtilizationPercent}% Utilized ({formatCurrency(fin.currentDue)} /{" "}
            {formatCurrency(fin.creditLimit)})
          </span>
        </div>

        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              customer.creditStatus === "EXCEEDED"
                ? "bg-rose-500"
                : customer.creditStatus === "WARNING"
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, customer.creditUtilizationPercent)}%` }}
          />
        </div>
      </div>

      {/* 5. Tabbed Detail Sections */}
      <div className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === "profile"
                ? "bg-[#0071E3] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            Profile & Compliance
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === "sales"
                ? "bg-[#0071E3] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            Wholesale Sales History ({customer.recentSales.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === "payments"
                ? "bg-[#0071E3] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            Payment Receipts ({customer.recentPayments.length})
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === "ledger"
                ? "bg-[#0071E3] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            Ledger Preview ({customer.ledger.length})
          </button>
        </div>

        {/* Tab 1: Profile & Compliance */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regulatory & Licensing */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                <h3 className="font-semibold text-sm text-foreground">Regulatory Drug Licensing</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">DGDA Drug License No:</span>
                  <span className="font-mono font-bold text-foreground">{customer.drugLicenseNo}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40 items-center">
                  <span className="text-muted-foreground">Drug License Expiry:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-foreground">
                      {customer.drugLicenseExpiry ? formatDate(customer.drugLicenseExpiry) : "N/A"}
                    </span>
                    {isExpired && (
                      <Badge variant="destructive" className="text-[9px] px-1 py-0">
                        EXPIRED
                      </Badge>
                    )}
                    {isExpiringSoon && !isExpired && (
                      <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[9px] px-1 py-0">
                        EXPIRING SOON
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Trade License No:</span>
                  <span className="font-mono text-foreground">{customer.tradeLicenseNo || "N/A"}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Tax e-TIN:</span>
                  <span className="font-mono text-foreground">{customer.taxIdTin || "N/A"}</span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Initial Opening Due:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatCurrency(customer.openingBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & Dispatch Address */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <MapPin className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold text-sm text-foreground">Contact & Delivery Address</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Primary Phone:</span>
                  <span className="font-semibold text-foreground">{customer.phone}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Alternate Phone:</span>
                  <span className="text-foreground">{customer.alternatePhone || "None"}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Email Address:</span>
                  <span className="text-foreground">{customer.email || "None"}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Territory Route:</span>
                  <span className="font-semibold text-foreground">{customer.assignedRoute}</span>
                </div>

                <div className="flex flex-col gap-1 py-1.5">
                  <span className="text-muted-foreground">Delivery Destination:</span>
                  <span className="font-medium text-foreground bg-muted/30 p-2.5 rounded-xl">
                    {customer.deliveryAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Wholesale Sales History */}
        {activeTab === "sales" && (
          <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">Wholesale Sales & Tax Invoices</h3>
              <span className="text-xs text-muted-foreground">
                Showing all recorded dispatch orders for {customer.tradeName}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Order / Invoice #</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Due</th>
                    <th className="px-4 py-3 text-center">Payment</th>
                    <th className="px-4 py-3 text-center">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customer.recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                        <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                        <p className="font-medium text-foreground">No sales recorded yet</p>
                        <p className="text-[11px] mt-0.5">
                          Wholesale order booking engine will be activated in Phase 9.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    customer.recentSales.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-foreground">{s.orderNumber}</div>
                          {s.invoiceNumber && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              Inv: {s.invoiceNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(s.orderDate)}</td>
                        <td className="px-4 py-3 font-medium">{s.itemsCount} lines</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                          {formatCurrency(s.grandTotal)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700">
                          {formatCurrency(s.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-amber-700">
                          {formatCurrency(s.dueAmount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={s.paymentStatus === "PAID" ? "default" : "outline"}
                            className="text-[10px]"
                          >
                            {s.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="secondary" className="text-[10px]">
                            {s.deliveryStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Payment Receipts */}
        {activeTab === "payments" && (
          <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">Customer Payment Receipts</h3>
              <span className="text-xs text-muted-foreground">
                Settled money receipts and collections
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Receipt #</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Bank / Cheque Details</th>
                    <th className="px-4 py-3 text-right">Amount (AFN)</th>
                    <th className="px-4 py-3">Recorded By</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customer.recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                        <Receipt className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                        <p className="font-medium text-foreground">No payments recorded yet</p>
                        <p className="text-[11px] mt-0.5">
                          Accounts receivable collections will be logged in Phase 11.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    customer.recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">
                          {p.receiptNumber}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(p.paymentDate)}</td>
                        <td className="px-4 py-3 font-medium">
                          <Badge variant="outline" className="text-[10px]">
                            {p.paymentMethod.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground">{p.bankName || "Cash / Direct"}</div>
                          {p.chequeNumber && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              Cheque #{p.chequeNumber} ({p.chequeStatus})
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.recordedByName}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Ledger Preview */}
        {activeTab === "ledger" && (
          <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Chronological Ledger Activity</h3>
                <p className="text-xs text-muted-foreground">
                  Debits (Sales/Orders) vs Credits (Payments) with running receivable balance.
                </p>
              </div>
              <Button asChild size="sm" className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs">
                <Link href={`/customers/${customer.id}/ledger`}>
                  <FileText className="h-3.5 w-3.5 mr-1" /> View Full Statement
                </Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3 text-right">Debit (৳)</th>
                    <th className="px-4 py-3 text-right">Credit (৳)</th>
                    <th className="px-4 py-3 text-right">Running Balance (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customer.ledger.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                        <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                        <p className="font-medium text-foreground">No ledger transactions yet</p>
                      </td>
                    </tr>
                  ) : (
                    customer.ledger.slice(0, 10).map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.date)}</td>
                        <td className="px-4 py-3 font-semibold">
                          <Badge variant="outline" className="text-[10px]">
                            {entry.type.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium">{entry.referenceNumber}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-rose-700">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                          {formatCurrency(entry.runningBalance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
