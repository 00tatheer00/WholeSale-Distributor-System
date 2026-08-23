"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Printer,
  Download,
  Store,
  CreditCard,
  Building2,
  TrendingDown,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomerRecord, CustomerLedgerEntry, CustomerFinancialSummary } from "@/types/models";

interface CustomerLedgerClientProps {
  customer: CustomerRecord;
  ledger: CustomerLedgerEntry[];
  summary: CustomerFinancialSummary | null;
}

export function CustomerLedgerClient({
  customer,
  ledger,
  summary,
}: CustomerLedgerClientProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalDebits = ledger.reduce((sum, item) => sum + item.debit, 0);
  const totalCredits = ledger.reduce((sum, item) => sum + item.credit, 0);
  const netDue = customer.currentDue;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-20 print:p-0 print:max-w-full">
      {/* 1. Header & Breadcrumb (Hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Link href={`/customers/${customer.id}`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Customer Profile
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            size="sm"
            variant="outline"
            className="rounded-xl text-xs h-9"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Statement
          </Button>
        </div>
      </div>

      {/* 2. Customer Statement Header Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0071E3] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                Customer Account Statement
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {customer.customerCode || "CUST-NO-CODE"}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-2 tracking-tight">
              {customer.tradeName}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Proprietor: <strong>{customer.proprietorName || "N/A"}</strong> • Phone:{" "}
              <strong>{customer.phone}</strong> • Drug Lic:{" "}
              <strong className="font-mono">{customer.drugLicenseNo}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Address: <strong>{customer.deliveryAddress}, {customer.city}</strong>
            </p>
          </div>

          <div className="text-left md:text-right space-y-1">
            <div className="text-xs text-muted-foreground">Statement Generated On:</div>
            <div className="font-mono font-bold text-sm text-foreground">
              {formatDate(new Date().toISOString())}
            </div>
            <div className="text-xs text-muted-foreground pt-1">
              Credit Limit:{" "}
              <strong className="font-mono text-foreground">{formatCurrency(customer.creditLimit)}</strong>
            </div>
          </div>
        </div>

        {/* 3. Statement Financial Overview Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Total Billed / Debits */}
          <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-muted-foreground">Total Invoiced (Debits)</span>
            <div className="text-lg font-bold text-foreground font-mono mt-1">
              {formatCurrency(totalDebits)}
            </div>
          </div>

          {/* Total Paid / Credits */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-emerald-800">Total Payments (Credits)</span>
            <div className="text-lg font-bold text-emerald-950 font-mono mt-1">
              {formatCurrency(totalCredits)}
            </div>
          </div>

          {/* Current Outstanding Balance */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-amber-800">Outstanding Receivable Due</span>
            <div className="text-lg font-bold text-amber-950 font-mono mt-1">
              {formatCurrency(netDue)}
            </div>
          </div>

          {/* Available Credit Remaining */}
          <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-sky-800">Available Credit Balance</span>
            <div className="text-lg font-bold text-sky-950 font-mono mt-1">
              {formatCurrency(customer.availableCredit)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Chronological Ledger Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">Transaction Entries & Running Balance</h3>
          <span className="text-xs text-muted-foreground">
            {ledger.length} total recorded accounting entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Transaction Type</th>
                <th className="px-4 py-3.5">Reference #</th>
                <th className="px-4 py-3.5">Particulars / Description</th>
                <th className="px-4 py-3.5 text-right text-rose-700">Debit (+)</th>
                <th className="px-4 py-3.5 text-right text-emerald-700">Credit (−)</th>
                <th className="px-5 py-3.5 text-right">Running Balance (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">No ledger transactions yet</p>
                    <p className="text-xs mt-0.5">
                      New wholesale orders, tax invoices, and customer payments will be automatically recorded here.
                    </p>
                  </td>
                </tr>
              ) : (
                ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/20">
                    {/* Date */}
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDate(entry.date)}
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          entry.type === "WHOLESALE_SALE"
                            ? "secondary"
                            : entry.type === "PAYMENT"
                            ? "default"
                            : "outline"
                        }
                        className={`text-[10px] font-medium ${
                          entry.type === "PAYMENT" ? "bg-emerald-600 text-white" : ""
                        }`}
                      >
                        {entry.type.replace(/_/g, " ")}
                      </Badge>
                    </td>

                    {/* Reference # */}
                    <td className="px-4 py-3.5 font-mono font-bold text-foreground whitespace-nowrap">
                      {entry.referenceNumber}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3.5 text-foreground/90 max-w-xs truncate">
                      {entry.description}
                    </td>

                    {/* Debit (Sale/Invoice) */}
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                    </td>

                    {/* Credit (Payment) */}
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                    </td>

                    {/* Running Balance */}
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap bg-muted/10">
                      {formatCurrency(entry.runningBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {ledger.length > 0 && (
              <tfoot className="bg-muted/40 border-t font-semibold text-xs text-foreground">
                <tr>
                  <td colSpan={4} className="px-4 py-3.5 text-right uppercase tracking-wider">
                    Total Statement Balances:
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-700">
                    {formatCurrency(totalDebits)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(totalCredits)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-extrabold text-foreground bg-muted/20">
                    {formatCurrency(netDue)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
