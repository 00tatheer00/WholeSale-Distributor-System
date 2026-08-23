"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Truck,
  Plus,
  Phone,
  Mail,
  Building2,
  Search,
  DollarSign,
  CreditCard,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  XCircle,
  MoreVertical,
  Receipt,
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
import { formatCurrency } from "@/lib/utils";
import {
  createSupplierAction,
  recordSupplierPaymentAction,
  toggleSupplierStatusAction,
} from "@/server/actions/supplier.actions";
import { SupplierRecord } from "@/types/models";
import { SupplierQueryResult } from "@/server/services/supplier.service";
import { SupplierInput } from "@/validations/supplier.schema";
import { SupplierPaymentInput } from "@/validations/payment.schema";

interface SuppliersClientProps {
  initialData: SupplierQueryResult;
  currentParams: {
    search: string;
    status: string;
    due: string;
    sortBy: string;
    sortOrder: string;
    page: number;
  };
}

export function SuppliersClient({ initialData, currentParams }: SuppliersClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = React.useState(currentParams.search);
  const [statusFilter, setStatusFilter] = React.useState(currentParams.status);
  const [dueFilter, setDueFilter] = React.useState(currentParams.due);

  // Modals state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = React.useState<SupplierRecord | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states
  const [formData, setFormData] = React.useState<SupplierInput>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "Dhaka",
    country: "Bangladesh",
    drugLicenseNo: "",
    tradeLicenseNo: "",
    taxIdTin: "",
    creditDays: 30,
    creditLimit: 5000000,
    openingBalance: 0,
    status: "ACTIVE",
    notes: "",
  });

  const [paymentData, setPaymentData] = React.useState<SupplierPaymentInput>({
    supplierId: "",
    amount: 0,
    paymentMethod: "BANK_TRANSFER",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNo: "",
    bankName: "",
    chequeNumber: "",
    notes: "",
  });

  // Apply filters to URL
  const applyFilters = React.useCallback(
    (newSearch = search, newStatus = statusFilter, newDue = dueFilter) => {
      const params = new URLSearchParams();
      if (newSearch.trim()) params.set("search", newSearch.trim());
      if (newStatus !== "ALL") params.set("status", newStatus);
      if (newDue !== "ALL") params.set("due", newDue);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [search, statusFilter, dueFilter, pathname, router]
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  // Submit new supplier
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await createSupplierAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Supplier created successfully!" });
      setIsAddOpen(false);
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        city: "Dhaka",
        country: "Bangladesh",
        drugLicenseNo: "",
        tradeLicenseNo: "",
        taxIdTin: "",
        creditDays: 30,
        creditLimit: 5000000,
        openingBalance: 0,
        status: "ACTIVE",
        notes: "",
      });
      router.refresh();
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to create supplier." });
    }
  };

  // Submit payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment) return;
    setIsSubmitting(true);
    setFeedback(null);

    const res = await recordSupplierPaymentAction({
      ...paymentData,
      supplierId: selectedSupplierForPayment.id,
    });
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Payment voucher logged successfully!" });
      setIsPaymentOpen(false);
      setSelectedSupplierForPayment(null);
      router.refresh();
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to record payment." });
    }
  };

  // Status toggle
  const handleToggleStatus = async (supplier: SupplierRecord) => {
    const newStatus = supplier.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await toggleSupplierStatusAction(supplier.id, newStatus);
    if (res.success) {
      setFeedback({ type: "success", message: `Status updated for ${supplier.name}.` });
      router.refresh();
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to update status." });
    }
  };

  const columns: ColumnDef<SupplierRecord>[] = [
    {
      accessorKey: "name",
      header: "Supplier / Manufacturer",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Link
            href={`/suppliers/${row.original.id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{row.original.name}</span>
          </Link>
          <div className="text-[11px] text-muted-foreground">
            Contact: <strong>{row.original.contactPerson || "HQ Representative"}</strong>
            {row.original.code && <span className="ml-2 font-mono">({row.original.code})</span>}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Contact & Location",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1 text-foreground">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.phone}</span>
          </div>
          {row.original.email && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate max-w-[160px]">
              <Mail className="h-3 w-3" />
              <span>{row.original.email}</span>
            </div>
          )}
          {row.original.city && (
            <div className="text-[10px] text-muted-foreground">
              {row.original.city}, Bangladesh
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "creditDays",
      header: "Payment Terms",
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge variant="outline" className="text-[11px] font-mono">
            Net {row.original.creditDays} Days
          </Badge>
          {row.original.drugLicenseNo && (
            <div className="text-[10px] text-muted-foreground">
              DL: <span className="font-mono">{row.original.drugLicenseNo}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "totalPurchases",
      header: "Total Purchased",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-xs text-foreground">
            {formatCurrency(row.original.totalPurchases)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {row.original.purchasesCount || 0} Consignments
          </div>
        </div>
      ),
    },
    {
      accessorKey: "totalPaid",
      header: "Total Paid",
      cell: ({ row }) => (
        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {formatCurrency(row.original.totalPaid)}
        </div>
      ),
    },
    {
      accessorKey: "currentPayable",
      header: "Outstanding Payable",
      cell: ({ row }) => {
        const due = row.original.currentPayable;
        return (
          <div className="space-y-0.5">
            <div
              className={`font-bold text-xs ${
                due > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatCurrency(due)}
            </div>
            {due > 0 ? (
              <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                Due Payable
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 text-muted-foreground">
                All Cleared
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "ACTIVE" ? "default" : "secondary"}
          className={`text-[10px] ${
            row.original.status === "ACTIVE"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs font-medium"
            >
              <Link href={`/suppliers/${supplier.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                Ledger
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">Supplier Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/suppliers/${supplier.id}`} className="cursor-pointer">
                    <FileText className="h-3.5 w-3.5 mr-2 text-primary" />
                    View Details & Ledger
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/purchases/new?supplierId=${supplier.id}`} className="cursor-pointer">
                    <Truck className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                    New Purchase Order
                  </Link>
                </DropdownMenuItem>
                {supplier.currentPayable > 0 && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedSupplierForPayment(supplier);
                      setPaymentData({
                        supplierId: supplier.id,
                        amount: supplier.currentPayable,
                        paymentMethod: "BANK_TRANSFER",
                        paymentDate: new Date().toISOString().split("T")[0],
                        referenceNo: "",
                        bankName: "",
                        chequeNumber: "",
                        notes: "",
                      });
                      setIsPaymentOpen(true);
                    }}
                    className="cursor-pointer text-amber-600 dark:text-amber-400"
                  >
                    <Receipt className="h-3.5 w-3.5 mr-2" />
                    Record Payment Voucher
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleToggleStatus(supplier)}
                  className="cursor-pointer text-muted-foreground"
                >
                  {supplier.status === "ACTIVE" ? (
                    <>
                      <XCircle className="h-3.5 w-3.5 mr-2 text-rose-500" />
                      Deactivate Supplier
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                      Activate Supplier
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Supplier & Manufacturer Management"
        description="Manage pharmaceutical manufacturers, trade payment terms, accounts payable (AP) ledgers, and purchase history."
      >
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/purchases/new">
              <Truck className="h-4 w-4 text-primary" />
              New Purchase Intake
            </Link>
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleCreateSupplier}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    Register New Pharmaceutical Supplier
                  </DialogTitle>
                  <DialogDescription>
                    Enter manufacturer or primary vendor profile details, regulatory licenses, and trade credit terms.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="name" className="text-xs font-semibold">
                      Company / Manufacturer Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      required
                      placeholder="e.g., Square Pharmaceuticals PLC"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contactPerson" className="text-xs">
                      Contact Person / Representative
                    </Label>
                    <Input
                      id="contactPerson"
                      placeholder="e.g., Kazi Farhan (Sales Rep)"
                      value={formData.contactPerson || ""}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      Official Phone / Mobile <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      required
                      placeholder="e.g., +880 1711 000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., supply@squarepharma.com"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs">
                      City / Region
                    </Label>
                    <Input
                      id="city"
                      placeholder="e.g., Dhaka"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address" className="text-xs">
                      Factory / Warehouse Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="e.g., Square Centre, 48 Mohakhali C/A, Dhaka 1212"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drugLicenseNo" className="text-xs">
                      Drug License No (DGDA)
                    </Label>
                    <Input
                      id="drugLicenseNo"
                      placeholder="e.g., DGDA-MFG-1092"
                      value={formData.drugLicenseNo || ""}
                      onChange={(e) => setFormData({ ...formData, drugLicenseNo: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="taxIdTin" className="text-xs">
                      Tax TIN / VAT ID
                    </Label>
                    <Input
                      id="taxIdTin"
                      placeholder="e.g., TIN-8829-1928"
                      value={formData.taxIdTin || ""}
                      onChange={(e) => setFormData({ ...formData, taxIdTin: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="creditDays" className="text-xs font-semibold">
                      Credit Period (Days)
                    </Label>
                    <Input
                      id="creditDays"
                      type="number"
                      min={0}
                      value={formData.creditDays}
                      onChange={(e) => setFormData({ ...formData, creditDays: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="openingBalance" className="text-xs font-semibold">
                      Opening Due / Balance (৳)
                    </Label>
                    <Input
                      id="openingBalance"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={formData.openingBalance}
                      onChange={(e) =>
                        setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="font-semibold">
                    {isSubmitting ? "Registering..." : "Save Supplier"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Feedback Toast Banner */}
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Suppliers</p>
              <p className="text-2xl font-bold text-foreground">{initialData.totalCount}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {initialData.activeCount} Active Vendors
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Purchases (Volume)</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatCurrency(initialData.totalPurchasedAmount)}
              </p>
              <p className="text-[11px] text-muted-foreground">Historical procurement volume</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding Payables</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(initialData.totalPayableAmount)}
              </p>
              <p className="text-[11px] text-rose-600/80 font-medium">Total supplier dues</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payments Made</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(Math.max(0, initialData.totalPurchasedAmount - initialData.totalPayableAmount))}
              </p>
              <p className="text-[11px] text-muted-foreground">Settled AP settlements</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border/60">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by supplier name, contact, phone, email..."
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

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val: any) => {
              setStatusFilter(val);
              applyFilters(search, val, dueFilter);
            }}
          >
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={dueFilter}
            onValueChange={(val: any) => {
              setDueFilter(val);
              applyFilters(search, statusFilter, val);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Due Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Accounts</SelectItem>
              <SelectItem value="HAS_DUE">Has Dues (AP)</SelectItem>
              <SelectItem value="NO_DUE">Clear (Zero Due)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={initialData.suppliers}
        searchKey="name"
      />

      {/* Record Payment Voucher Modal */}
      {selectedSupplierForPayment && (
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleRecordPayment}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="h-5 w-5 text-emerald-600" />
                  Record Supplier Payment Voucher
                </DialogTitle>
                <DialogDescription>
                  Issue a payment settlement for <strong>{selectedSupplierForPayment.name}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 py-4">
                <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Current Outstanding Due:</span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {formatCurrency(selectedSupplierForPayment.currentPayable)}
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
                    max={selectedSupplierForPayment.currentPayable}
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
      )}
    </div>
  );
}
