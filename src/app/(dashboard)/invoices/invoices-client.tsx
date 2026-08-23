"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Search,
  SlidersHorizontal,
  Printer,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Truck,
  Plus,
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceQueryResult } from "@/server/services/invoice.service";
import { CustomerRecord } from "@/types/models";

interface InvoicesClientProps {
  initialInvoicesData?: InvoiceQueryResult;
  customers: CustomerRecord[];
}

export function InvoicesClient({ initialInvoicesData, customers }: InvoicesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [customerFilter, setCustomerFilter] = React.useState(searchParams.get("customer") || "ALL");
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get("status") || "ALL");
  const [paymentFilter, setPaymentFilter] = React.useState(searchParams.get("payment") || "ALL");

  const data = initialInvoicesData || {
    invoices: [],
    totalCount: 0,
    totalInvoiced: 0,
    totalPaid: 0,
    totalDue: 0,
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
    router.push(`/invoices?${current.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: search.trim() || null });
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* 1. Header Section */}
      <PageHeader
        title="Wholesale Tax Invoices & Delivery Challans"
        description="Formal DGDA-compliant wholesale tax invoices, delivery challans, and customer accounts receivable settlement."
      >
        <Button
          asChild
          className="bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm rounded-xl font-medium px-4 h-10 transition-all active:scale-95"
        >
          <Link href="/sales/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Issue New Invoice
          </Link>
        </Button>
      </PageHeader>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Total Billed Invoices</span>
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-700">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(data.totalInvoiced)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Across {data.totalCount} tax invoices</div>
        </div>

        {/* Total Collected */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Settled & Collected</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.totalPaid)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Customer collections allocated</div>
        </div>

        {/* Accounts Receivable Due */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Pending Receivables (AR)</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(data.totalDue)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Outstanding pharmacy dues</div>
        </div>

        {/* Active Challans */}
        <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-800">Delivery Challans</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-950 font-mono">
            {data.totalCount} Issued
          </div>
          <div className="text-[11px] text-indigo-600 mt-1">Dispatched with logistics track</div>
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
              placeholder="Search by invoice # (INV-...), challan #, pharmacy name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-20 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm focus-visible:ring-1"
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
            {/* Customer */}
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

            {/* Payment Filter */}
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
                <SelectItem value="PARTIALLY_PAID">Partial</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
              </SelectContent>
            </Select>

            {/* Invoice Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                applyFilters({ status: val });
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl w-[130px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ISSUED">Issued</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. Invoices Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Invoice # & Challan</th>
                <th className="px-4 py-3.5">Customer Pharmacy</th>
                <th className="px-4 py-3.5">Issue Date</th>
                <th className="px-4 py-3.5">Due Date</th>
                <th className="px-4 py-3.5 text-right">Grand Total</th>
                <th className="px-4 py-3.5 text-right">Paid / Due</th>
                <th className="px-4 py-3.5 text-center">Payment</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">No invoices found</p>
                    <p className="text-xs mt-1">Issue a new wholesale order or adjust search parameters.</p>
                  </td>
                </tr>
              ) : (
                data.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    {/* Invoice & Challan # */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <Link
                          href={`/invoices/${inv.invoiceNumber}`}
                          className="font-mono font-bold text-foreground hover:text-[#0071E3] transition-colors"
                        >
                          {inv.invoiceNumber}
                        </Link>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Challan: {inv.challanNumber}
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">
                      <Link
                        href={`/customers/${inv.customerId}`}
                        className="font-semibold text-foreground hover:underline"
                      >
                        {inv.customerName}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">
                        {inv.salesmanName}
                      </div>
                    </td>

                    {/* Issue Date */}
                    <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(inv.issueDate)}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(inv.dueDate)}
                    </td>

                    {/* Grand Total */}
                    <td className="px-4 py-4 text-right font-mono font-bold text-xs text-foreground">
                      {formatCurrency(inv.grandTotal)}
                    </td>

                    {/* Paid / Due */}
                    <td className="px-4 py-4 text-right">
                      <div className="text-xs font-mono text-emerald-700">
                        Paid: {formatCurrency(inv.paidAmount)}
                      </div>
                      <div className="text-xs font-mono font-semibold text-amber-700">
                        Due: {formatCurrency(inv.dueAmount)}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-4 text-center">
                      {inv.paymentStatus === "PAID" && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">
                          Paid
                        </Badge>
                      )}
                      {inv.paymentStatus === "PARTIALLY_PAID" && (
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-medium">
                          Partial
                        </Badge>
                      )}
                      {inv.paymentStatus === "UNPAID" && (
                        <Badge variant="outline" className="text-rose-600 border-rose-200 text-[10px] font-medium">
                          Unpaid
                        </Badge>
                      )}
                    </td>

                    {/* Invoice Status */}
                    <td className="px-4 py-4 text-center">
                      {inv.status === "ISSUED" && (
                        <Badge className="bg-sky-50 text-[#0071E3] border-sky-200 text-[10px] font-medium">
                          Issued
                        </Badge>
                      )}
                      {inv.status === "PAID" && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">
                          Paid
                        </Badge>
                      )}
                      {inv.status === "CANCELLED" && (
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
                          <Link href={`/invoices/${inv.invoiceNumber}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View & Print
                          </Link>
                        </Button>
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
              of <span className="font-semibold text-foreground">{data.totalCount}</span> invoices
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
    </div>
  );
}
