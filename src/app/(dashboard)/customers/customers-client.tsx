"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Store,
  Plus,
  Phone,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Search,
  SlidersHorizontal,
  Building2,
  CreditCard,
  AlertTriangle,
  ArrowUpDown,
  Eye,
  Edit,
  Power,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
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
import { CustomerRecord, CustomerQueryResult } from "@/types/models";
import { toggleCustomerStatusAction } from "@/server/actions/customer.actions";

interface CustomersClientProps {
  initialData?: CustomerQueryResult;
}

export function CustomersClient({ initialData }: CustomersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get("status") || "ALL");
  const [typeFilter, setTypeFilter] = React.useState(searchParams.get("type") || "ALL");
  const [dueFilter, setDueFilter] = React.useState(searchParams.get("due") || "ALL");
  const [sortBy, setSortBy] = React.useState(searchParams.get("sort") || "name");

  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const data = initialData || {
    customers: [],
    totalCount: 0,
    totalReceivableDue: 0,
    totalCreditLimit: 0,
    activeCount: 0,
    overdueBlockedCount: 0,
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
    // Reset to page 1 on filter changes
    if (!newParams.page) {
      current.delete("page");
    }
    router.push(`/customers?${current.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: search.trim() || null });
  };

  const handleToggleStatus = async (customer: CustomerRecord) => {
    try {
      setTogglingId(customer.id);
      const newStatus = customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await toggleCustomerStatusAction(customer.id, newStatus as any);
      if (res.success) {
        setFeedback({
          type: "success",
          message: `Customer "${customer.tradeName}" is now ${newStatus.toLowerCase()}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to update status." });
      }
    } catch {
      setFeedback({ type: "error", message: "Unexpected error changing status." });
    } finally {
      setTogglingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* 1. Header Section */}
      <PageHeader
        title="Customer Pharmacies & Clients"
        description="Wholesale B2B client directory, regulatory drug licensing, and credit barrier monitoring."
      >
        <Button
          asChild
          className="bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm rounded-xl font-medium px-4 h-10 transition-all active:scale-95"
        >
          <Link href="/customers/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Onboard New Pharmacy
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

      {/* 2. Top Metric Cards (Lightweight Colorful Pharmacy Aesthetic) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Active Clients */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Active Pharmacies</span>
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-700">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950">
            {data.activeCount}{" "}
            <span className="text-xs font-normal text-sky-700">/ {data.totalCount} total</span>
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Licensed retail & institutional buyers</div>
        </div>

        {/* Total Receivable Due */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Total Outstanding (AR)</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(data.totalReceivableDue)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Total pending customer collections</div>
        </div>

        {/* Total Credit Pool */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Total Approved Credit</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.totalCreditLimit)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Authorized wholesale credit pool</div>
        </div>

        {/* Overdue / High-Risk Accounts */}
        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Overdue / Blocked</span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950">
            {data.overdueBlockedCount}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Accounts on credit hold / dispatch locked</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by pharmacy name, proprietor, phone, email, drug license, code..."
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

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Classification Filter */}
            <Select
              value={typeFilter}
              onValueChange={(val) => {
                setTypeFilter(val);
                applyFilters({ type: val });
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl w-[150px] bg-background">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="RETAIL_PHARMACY">Retail Pharmacy</SelectItem>
                <SelectItem value="HOSPITAL_DISPENSARY">Hospital Dispensary</SelectItem>
                <SelectItem value="CLINIC_INSTITUTION">Clinic / Institution</SelectItem>
                <SelectItem value="SUB_DISTRIBUTOR">Sub-Distributor</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="BLOCKED_OVERDUE">Overdue Hold</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Due Balance Filter */}
            <Select
              value={dueFilter}
              onValueChange={(val) => {
                setDueFilter(val);
                applyFilters({ due: val });
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl w-[130px] bg-background">
                <SelectValue placeholder="Due Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Accounts</SelectItem>
                <SelectItem value="HAS_DUE">Has Due (&gt;0)</SelectItem>
                <SelectItem value="NO_DUE">No Due (৳0)</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                applyFilters({ sort: val });
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl w-[140px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Pharmacy Name</SelectItem>
                <SelectItem value="currentDue">Highest Due</SelectItem>
                <SelectItem value="creditLimit">Highest Credit</SelectItem>
                <SelectItem value="totalSales">Total Purchased</SelectItem>
                <SelectItem value="createdAt">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. Customer Directory Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Pharmacy / Business</th>
                <th className="px-4 py-3.5">Classification</th>
                <th className="px-4 py-3.5">Drug License</th>
                <th className="px-4 py-3.5">Contact & City</th>
                <th className="px-4 py-3.5 text-right">Credit & Outstanding Due</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <Store className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">No customer pharmacies found</p>
                    <p className="text-xs mt-1">Try adjusting your search criteria or onboard a new pharmacy.</p>
                    <Button asChild size="sm" variant="outline" className="mt-4 rounded-xl">
                      <Link href="/customers/new">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Onboard Pharmacy
                      </Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                data.customers.map((c: CustomerRecord) => {
                  const expDate = c.drugLicenseExpiry ? new Date(c.drugLicenseExpiry) : null;
                  const isExpiringSoon =
                    expDate && expDate.getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000;
                  const isExpired = expDate && expDate.getTime() < Date.now();

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Pharmacy & Code */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <Link
                            href={`/customers/${c.id}`}
                            className="font-semibold text-foreground hover:text-[#0071E3] transition-colors flex items-center gap-1.5"
                          >
                            {c.tradeName}
                            {c.creditStatus === "EXCEEDED" && (
                              <Badge variant="destructive" className="text-[9px] px-1 py-0 uppercase">
                                Credit Exceeded
                              </Badge>
                            )}
                          </Link>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                            <span>Code: <strong className="font-mono text-foreground/80">{c.customerCode || "N/A"}</strong></span>
                            {c.proprietorName && (
                              <span>• Prop: <strong>{c.proprietorName}</strong></span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Classification */}
                      <td className="px-4 py-4">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-normal bg-muted/60 text-foreground"
                        >
                          {c.customerType.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      {/* Drug License */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5 text-xs">
                          <div className="font-mono font-medium">{c.drugLicenseNo}</div>
                          <div
                            className={`text-[10px] flex items-center gap-1 ${
                              isExpired
                                ? "text-rose-600 font-bold"
                                : isExpiringSoon
                                ? "text-amber-600 font-semibold"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span>Exp: {c.drugLicenseExpiry ? formatDate(c.drugLicenseExpiry) : "N/A"}</span>
                            {isExpired && <span>(Expired)</span>}
                            {isExpiringSoon && !isExpired && <span>(Soon)</span>}
                          </div>
                        </div>
                      </td>

                      {/* Contact & City */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1 text-foreground/90">
                            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{c.city || "Dhaka"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Credit & Current Due */}
                      <td className="px-4 py-4 text-right">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-xs text-foreground">
                            {formatCurrency(c.currentDue)}
                            <span className="text-[10px] font-normal text-muted-foreground ml-1">due</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Limit: <span className="font-mono">{formatCurrency(c.creditLimit)}</span>
                          </div>
                          {/* Mini Progress Bar */}
                          {c.creditLimit > 0 && (
                            <div className="w-24 h-1.5 bg-muted rounded-full ml-auto overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  c.creditStatus === "EXCEEDED"
                                    ? "bg-rose-500"
                                    : c.creditStatus === "WARNING"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, c.creditUtilizationPercent)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        {c.status === "ACTIVE" && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">
                            Active
                          </Badge>
                        )}
                        {c.status === "BLOCKED_OVERDUE" && (
                          <Badge variant="destructive" className="text-[10px] font-medium">
                            Overdue Hold
                          </Badge>
                        )}
                        {c.status === "INACTIVE" && (
                          <Badge variant="outline" className="text-muted-foreground text-[10px]">
                            Inactive
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
                            <Link href={`/customers/${c.id}`}>
                              <Eye className="h-3.5 w-3.5 mr-1" /> View
                            </Link>
                          </Button>

                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                          >
                            <Link href={`/customers/${c.id}/ledger`}>
                              <FileText className="h-3.5 w-3.5 mr-1" /> Ledger
                            </Link>
                          </Button>

                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                          >
                            <Link href={`/customers/${c.id}/edit`}>
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={togglingId === c.id}
                            onClick={() => handleToggleStatus(c)}
                            title={c.status === "ACTIVE" ? "Deactivate Customer" : "Activate Customer"}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                          >
                            <Power
                              className={`h-3.5 w-3.5 ${
                                c.status === "ACTIVE" ? "text-rose-500" : "text-emerald-500"
                              }`}
                            />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 bg-muted/20 border-t border-border/80 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-semibold text-foreground">{(data.page - 1) * data.pageSize + 1}</span> to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(data.page * data.pageSize, data.totalCount)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{data.totalCount}</span> customers
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
