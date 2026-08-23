"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  FileText,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  MoreVertical,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cancelPurchaseAction } from "@/server/actions/purchase.actions";
import { PurchaseRecord } from "@/types/models";
import { PurchaseQueryResult } from "@/server/services/purchase.service";

interface PurchasesClientProps {
  initialData: PurchaseQueryResult;
  suppliers: Array<{ id: string; name: string }>;
  currentParams: {
    search: string;
    supplierId: string;
    paymentStatus: string;
    status: string;
    startDate: string;
    endDate: string;
    sortBy: string;
    sortOrder: string;
    page: number;
  };
}

export function PurchasesClient({
  initialData,
  suppliers,
  currentParams,
}: PurchasesClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = React.useState(currentParams.search);
  const [supplierId, setSupplierId] = React.useState(currentParams.supplierId);
  const [paymentStatus, setPaymentStatus] = React.useState(currentParams.paymentStatus);
  const [status, setStatus] = React.useState(currentParams.status);

  // Cancellation Modal state
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [selectedPoForCancel, setSelectedPoForCancel] = React.useState<PurchaseRecord | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const applyFilters = React.useCallback(
    (newSearch = search, newSupplier = supplierId, newPay = paymentStatus, newStatus = status) => {
      const params = new URLSearchParams();
      if (newSearch.trim()) params.set("search", newSearch.trim());
      if (newSupplier !== "ALL") params.set("supplierId", newSupplier);
      if (newPay !== "ALL") params.set("paymentStatus", newPay);
      if (newStatus !== "ALL") params.set("status", newStatus);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [search, supplierId, paymentStatus, status, pathname, router]
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const handleCancelPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForCancel) return;
    setIsCancelling(true);
    setFeedback(null);

    const res = await cancelPurchaseAction(selectedPoForCancel.id, cancelReason);
    setIsCancelling(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Purchase consignment cancelled & stock reversed." });
      setIsCancelOpen(false);
      setSelectedPoForCancel(null);
      setCancelReason("");
      router.refresh();
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to cancel purchase." });
    }
  };

  const columns: ColumnDef<PurchaseRecord>[] = [
    {
      accessorKey: "poNumber",
      header: "PO & Consignment #",
      cell: ({ row }) => (
        <div className="space-y-0.5 font-mono">
          <Link
            href={`/purchases/${row.original.id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{row.original.poNumber}</span>
          </Link>
          <div className="text-[11px] text-muted-foreground font-sans">
            Inv: {row.original.supplierInvoiceNo || "Direct Intake"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "supplierName",
      header: "Supplier / Manufacturer",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Link
            href={`/suppliers/${row.original.supplierId}`}
            className="font-medium text-foreground hover:text-primary transition-colors text-xs flex items-center gap-1"
          >
            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
            <span>{row.original.supplierName}</span>
          </Link>
          <div className="text-[10px] text-muted-foreground">
            {row.original.itemsCount} Line Items Received
          </div>
        </div>
      ),
    },
    {
      accessorKey: "purchaseDate",
      header: "Intake Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.purchaseDate)}
        </span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Grand Total",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-bold text-xs text-foreground font-mono">
            {formatCurrency(row.original.grandTotal)}
          </div>
          {row.original.discountAmount > 0 && (
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
              Disc: -{formatCurrency(row.original.discountAmount)}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Paid (AFN)",
      cell: ({ row }) => (
        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
          {formatCurrency(row.original.paidAmount)}
        </div>
      ),
    },
    {
      accessorKey: "dueAmount",
      header: "Outstanding Due",
      cell: ({ row }) => {
        const due = row.original.dueAmount;
        return (
          <div
            className={`text-xs font-bold font-mono ${
              due > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
            }`}
          >
            {due > 0 ? formatCurrency(due) : "৳0.00"}
          </div>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        return (
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold ${
              status === "PAID"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : status === "PARTIALLY_PAID"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
            }`}
          >
            {status === "PAID" ? "Paid In Full" : status === "PARTIALLY_PAID" ? "Partial Paid" : "Unpaid (Due)"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={status === "RECEIVED" ? "default" : status === "CANCELLED" ? "destructive" : "secondary"}
            className={`text-[10px] ${
              status === "RECEIVED"
                ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : status === "CANCELLED"
                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                : "bg-muted text-foreground"
            }`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const po = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs font-medium">
              <Link href={`/purchases/${po.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Link>
            </Button>
            {po.status !== "CANCELLED" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link href={`/purchases/${po.id}`} className="cursor-pointer">
                      <FileText className="h-3.5 w-3.5 mr-2 text-primary" />
                      View Full Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedPoForCancel(po);
                      setCancelReason("");
                      setIsCancelOpen(true);
                    }}
                    className="cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-2" />
                    Void & Cancel Intake
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Procurement & Purchase Consignments"
        description="Receive pharmaceutical shipments, assign manufacturer batches, verify trade prices, and manage supplier purchase orders."
      >
        <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm">
          <Link href="/purchases/new">
            <Plus className="h-4 w-4" />
            New Purchase Consignment
          </Link>
        </Button>
      </PageHeader>

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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Consignments</p>
              <p className="text-2xl font-bold text-foreground font-mono">{initialData.totalCount}</p>
              <p className="text-[11px] text-muted-foreground">Recorded intake orders</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Truck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Purchase Volume</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatCurrency(initialData.totalGrandTotal)}
              </p>
              <p className="text-[11px] text-muted-foreground">Gross supplier orders</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Settled Payments</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(initialData.totalPaidAmount)}
              </p>
              <p className="text-[11px] text-emerald-600/80 font-medium">Disbursed to suppliers</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding Dues (AP)</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(initialData.totalDueAmount)}
              </p>
              <p className="text-[11px] text-rose-600/80 font-medium">Payables on credit</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border/60">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search PO #, supplier invoice #, manufacturer..."
              className="pl-8 text-xs h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => applyFilters()} className="h-9 px-3 text-xs">
            Search
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={supplierId}
            onValueChange={(val: any) => {
              setSupplierId(val);
              applyFilters(search, val, paymentStatus, status);
            }}
          >
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Suppliers</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={paymentStatus}
            onValueChange={(val: any) => {
              setPaymentStatus(val);
              applyFilters(search, supplierId, val, status);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payments</SelectItem>
              <SelectItem value="PAID">Paid in Full</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
              <SelectItem value="UNPAID">Unpaid (Due)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(val: any) => {
              setStatus(val);
              applyFilters(search, supplierId, paymentStatus, val);
            }}
          >
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="PO Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="RECEIVED">Received</SelectItem>
              <SelectItem value="ORDERED">Ordered</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={initialData.purchases}
        searchKey="poNumber"
      />

      {/* Void / Cancel Purchase Dialog */}
      {selectedPoForCancel && (
        <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleCancelPurchase}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                  Void & Cancel Purchase Order
                </DialogTitle>
                <DialogDescription>
                  Cancelling PO <strong>#{selectedPoForCancel.poNumber}</strong> will reverse all received batch inventory and restore supplier payables.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg space-y-1 text-xs text-rose-700 dark:text-rose-300">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" />
                    Strict Inventory Safeguard
                  </p>
                  <p>
                    If any units of medicine batches received in this consignment have already been dispatched or sold, cancellation will be blocked to protect inventory ledger integrity.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cancelReason" className="text-xs font-semibold">
                    Mandatory Cancellation Reason <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="cancelReason"
                    required
                    placeholder="e.g., Wrong batch delivered / Damaged goods returned to vendor"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCancelOpen(false)}>
                  Keep Purchase
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
      )}
    </div>
  );
}
