"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Receipt,
  Plus,
  Search,
  SlidersHorizontal,
  FolderPlus,
  Tag,
  Building2,
  Truck,
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Ban,
  Filter,
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
import { ExpenseQueryResult } from "@/server/services/expense.service";
import {
  createExpenseAction,
  createExpenseCategoryAction,
  toggleExpenseCategoryStatusAction,
  cancelExpenseAction,
} from "@/server/actions/expense.actions";
import { ExpenseInput, ExpenseCategoryInput } from "@/validations/expense.schema";
import { ExpenseCategoryRecord, ExpenseRecord } from "@/types/models";

interface ExpensesClientProps {
  initialData?: ExpenseQueryResult;
  categories: ExpenseCategoryRecord[];
}

export function ExpensesClient({ initialData, categories }: ExpensesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get("category") || "ALL");
  const [selectedPayment, setSelectedPayment] = React.useState(searchParams.get("payment") || "ALL");

  const [isAddExpenseOpen, setIsAddExpenseOpen] = React.useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [cancellingExpense, setCancellingExpense] = React.useState<ExpenseRecord | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Expense Form State
  const [expenseForm, setExpenseForm] = React.useState<ExpenseInput>({
    categoryId: categories[0]?.id || "",
    amount: 2500,
    expenseDate: new Date().toISOString().split("T")[0],
    paidTo: "",
    paymentMethod: "CASH",
    description: "",
    referenceNumber: "",
    notes: "",
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = React.useState<ExpenseCategoryInput>({
    name: "",
    code: "",
    description: "",
    isDirectCost: false,
    isActive: true,
  });

  const data = initialData || {
    expenses: [],
    totalCount: 0,
    totalAmount: 0,
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
    router.push(`/expenses?${current.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: search.trim() || null });
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.categoryId || !expenseForm.amount || !expenseForm.paidTo.trim() || !expenseForm.description.trim()) {
      setFeedback({ type: "error", message: "Please fill in all mandatory fields." });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createExpenseAction(expenseForm);

      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Operating expense recorded successfully." });
        setIsAddExpenseOpen(false);
        setExpenseForm({
          categoryId: categories[0]?.id || "",
          amount: 2500,
          expenseDate: new Date().toISOString().split("T")[0],
          paidTo: "",
          paymentMethod: "CASH",
          description: "",
          referenceNumber: "",
          notes: "",
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to record expense." });
      }
    } catch {
      setFeedback({ type: "error", message: "Unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setFeedback({ type: "error", message: "Category name is required." });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createExpenseCategoryAction(categoryForm);

      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Expense category created." });
        setCategoryForm({ name: "", code: "", description: "", isDirectCost: false, isActive: true });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to create category." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to create category." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCategory = async (c: ExpenseCategoryRecord) => {
    try {
      const res = await toggleExpenseCategoryStatusAction(c.id, !c.isActive);
      if (res.success) {
        setFeedback({ type: "success", message: `Category "${c.name}" status updated.` });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update category status." });
    }
  };

  const handleCancelExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingExpense || !cancelReason.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await cancelExpenseAction({
        expenseId: cancellingExpense.id,
        reason: cancelReason.trim(),
      });

      if (res.success) {
        setFeedback({ type: "success", message: "Expense voucher voided / cancelled." });
        setIsCancelModalOpen(false);
        setCancellingExpense(null);
        setCancelReason("");
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to cancel expense." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to cancel voucher." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* 1. Header */}
      <PageHeader
        title="Business Operating Expenses"
        description="Warehouse rent, delivery fuel, utilities, employee allowances, and administrative overheads."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            className="rounded-xl text-xs h-10 border-border/80 hover:bg-muted/40"
          >
            <Tag className="h-4 w-4 mr-1.5 text-muted-foreground" />
            Manage Categories ({categories.length})
          </Button>

          <Button
            onClick={() => setIsAddExpenseOpen(true)}
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm rounded-xl font-medium px-4 h-10 transition-all active:scale-95 text-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Record Expense Voucher
          </Button>
        </div>
      </PageHeader>

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
          <button onClick={() => setFeedback(null)} className="text-xs underline ml-4 hover:opacity-75">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Top Pastel Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Total Operating Expenses</span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-950 font-mono">
            {formatCurrency(data.totalAmount)}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Across {data.totalCount} expense vouchers</div>
        </div>

        {/* Direct Logistics Cost */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Direct Logistics & Fuel</span>
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(
              categories.filter((c) => c.isDirectCost).reduce((sum, c) => sum + (c.totalAmount || 0), 0)
            )}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Route beats & delivery expenses</div>
        </div>

        {/* Office & Rent */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Office & Utilities</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(
              categories.filter((c) => !c.isDirectCost).reduce((sum, c) => sum + (c.totalAmount || 0), 0)
            )}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Rent, electricity & admin costs</div>
        </div>

        {/* Active Categories */}
        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Expense Heads</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-700">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {categories.filter((c) => c.isActive).length} Categories
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Accounting cost heads configured</div>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by voucher # (EXP-...), payee, description, reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-20 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm"
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

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val);
              applyFilters({ category: val });
            }}
          >
            <SelectTrigger className="h-10 text-xs rounded-xl w-[180px] bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Method Filter */}
          <Select
            value={selectedPayment}
            onValueChange={(val) => {
              setSelectedPayment(val);
              applyFilters({ payment: val });
            }}
          >
            <SelectTrigger className="h-10 text-xs rounded-xl w-[150px] bg-background">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Methods</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Online</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="MFS_BKASH_NAGAD">bKash / Nagad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. Expenses Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Voucher #</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Paid To / Payee</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5 text-right">Amount (AFN)</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {data.expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">No expense vouchers found</p>
                    <p className="text-xs mt-1">Record a business operating voucher to start tracking.</p>
                  </td>
                </tr>
              ) : (
                data.expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                    {/* Voucher */}
                    <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                      {e.voucherNumber}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDate(e.expenseDate)}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      {e.categoryName}
                    </td>

                    {/* Paid To */}
                    <td className="px-4 py-3.5 text-foreground font-medium">
                      {e.paidTo || "N/A"}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3.5 text-muted-foreground max-w-xs truncate">
                      {e.description}
                      {e.referenceNumber && (
                        <span className="text-[10px] block font-mono text-muted-foreground/80">
                          Ref: {e.referenceNumber}
                        </span>
                      )}
                    </td>

                    {/* Method */}
                    <td className="px-4 py-3.5 capitalize">
                      {e.paymentMethod.replace(/_/g, " ").toLowerCase()}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600">
                      {formatCurrency(e.amount)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      {e.status === "APPROVED" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          Approved
                        </Badge>
                      ) : e.status === "CANCELLED" ? (
                        <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 text-[10px]">
                          Cancelled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-[10px]">
                          Pending
                        </Badge>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      {e.status === "APPROVED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCancellingExpense(e);
                            setIsCancelModalOpen(true);
                          }}
                          className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          <Ban className="h-3 w-3 mr-1" /> Void
                        </Button>
                      )}
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
              of <span className="font-semibold text-foreground">{data.totalCount}</span> vouchers
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

      {/* 6. Record Expense Modal */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Receipt className="h-5 w-5 text-[#0071E3]" />
              Record Operating Expense Voucher
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateExpense} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Expense Category <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={expenseForm.categoryId}
                  onValueChange={(val) => setExpenseForm({ ...expenseForm, categoryId: val })}
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-muted/20">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c.isActive).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Amount (AFN / ؋) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="h-9 rounded-xl bg-muted/20 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Payee / Vendor Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Dhaka Power Distribution (DPDC)"
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Expense Date</Label>
                <Input
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Payment Method</Label>
                <Select
                  value={expenseForm.paymentMethod}
                  onValueChange={(val: any) => setExpenseForm({ ...expenseForm, paymentMethod: val })}
                >
                  <SelectTrigger className="h-9 rounded-xl text-xs bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash Payment</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Online Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="MFS_BKASH_NAGAD">bKash / Nagad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Bill / Ref Number</Label>
                <Input
                  placeholder="e.g. BILL-82910"
                  value={expenseForm.referenceNumber || ""}
                  onChange={(e) => setExpenseForm({ ...expenseForm, referenceNumber: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Description / Purpose <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                placeholder="e.g. Electricity bill payment for Tejgaon main warehouse for August 2026..."
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                rows={2}
                className="rounded-xl bg-muted/20 text-xs resize-none"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddExpenseOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs font-medium"
              >
                {isSubmitting ? "Recording..." : "Record Expense Voucher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. Manage Categories Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Tag className="h-5 w-5 text-[#0071E3]" />
              Manage Expense Categories
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Add New Category Head</span>
                <span className="text-[10px] text-muted-foreground">Click a template below or type custom</span>
              </div>

              {/* Quick Template Chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5 pb-1">
                {[
                  { name: "Office Monthly Rent", desc: "Monthly office & warehouse facility rent", isDirect: false },
                  { name: "Daily Expense", desc: "Daily refreshments, tea & petty cash", isDirect: false },
                  { name: "Salesman Expense", desc: "Field salesman conveyance & daily allowances", isDirect: true },
                  { name: "Visitor Expense", desc: "Medical rep / Field visitor tour expenses", isDirect: true },
                  { name: "Expense on Doctor for Marketing", desc: "Doctor promotional visits & marketing gifts", isDirect: true },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setCategoryForm({
                      name: item.name,
                      code: item.name.toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 15),
                      description: item.desc,
                      isDirectCost: item.isDirect,
                      isActive: true,
                    })}
                    className="text-[10px] font-medium bg-background hover:bg-sky-50 hover:text-[#0071E3] hover:border-sky-300 border border-border/80 px-2 py-0.5 rounded-md transition-all text-muted-foreground"
                  >
                    + {item.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Category Name</Label>
                  <Input
                    placeholder="e.g. Cold Chain Generator Fuel"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Description</Label>
                  <Input
                    placeholder="e.g. Backup power costs"
                    value={categoryForm.description || ""}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryForm.isDirectCost}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isDirectCost: e.target.checked })}
                    className="rounded text-[#0071E3]"
                  />
                  <span>Is Direct Logistics / Delivery Cost</span>
                </label>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs h-8 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
                </Button>
              </div>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <div className="text-xs font-bold text-muted-foreground uppercase">Existing Category Heads</div>
              <div className="divide-y divide-border/60 border rounded-xl overflow-hidden">
                {categories.map((c) => (
                  <div key={c.id} className="p-3 flex items-center justify-between text-xs bg-card hover:bg-muted/20">
                    <div>
                      <div className="font-semibold text-foreground">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.description || "General Operating Cost"} • {c.expensesCount || 0} vouchers
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.isDirectCost && (
                        <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[10px]">
                          Direct Cost
                        </Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleCategory(c)}
                        className="text-[11px] font-semibold text-[#0071E3] hover:underline"
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 8. Cancel Expense Dialog */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <Ban className="h-5 w-5" />
              Void Expense Voucher {cancellingExpense?.voucherNumber}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCancelExpense} className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Are you sure you want to void this expense voucher for{" "}
              <strong className="text-foreground">{formatCurrency(cancellingExpense?.amount || 0)}</strong> paid to{" "}
              <strong className="text-foreground">{cancellingExpense?.paidTo}</strong>?
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Cancellation Reason <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                placeholder="e.g. Duplicate entry made by mistake or wrong amount..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                className="rounded-xl bg-muted/20 text-xs resize-none"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCancelModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Keep Active
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !cancelReason.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium"
              >
                {isSubmitting ? "Voiding..." : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
