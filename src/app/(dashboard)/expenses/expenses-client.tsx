"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Receipt, Plus, DollarSign, Tag, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createExpenseAction } from "@/server/actions/expense.actions";
import { ExpenseInput } from "@/validations/expense.schema";

interface ExpensesClientProps {
  initialExpenses: any[];
  categories: any[];
}

export function ExpensesClient({ initialExpenses, categories }: ExpensesClientProps) {
  const [expenses, setExpenses] = React.useState(initialExpenses);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = React.useState<ExpenseInput>({
    categoryId: categories[0]?.id || "",
    amount: 5000,
    expenseDate: new Date().toISOString().split("T")[0],
    payeeName: "",
    paymentMethod: "CASH",
    description: "",
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "voucherNo",
      header: "Voucher #",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground text-xs">
          {row.original.voucherNo}
        </span>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Expense Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[11px] font-normal">
          {row.original.categoryName}
        </Badge>
      ),
    },
    {
      accessorKey: "payeeName",
      header: "Payee / Purpose",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.original.payeeName}</div>
          <div className="text-[11px] text-muted-foreground">{row.original.description}</div>
        </div>
      ),
    },
    {
      accessorKey: "expenseDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.expenseDate)}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => (
        <span className="text-[11px] uppercase text-muted-foreground font-medium">
          {row.original.paymentMethod}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Voucher Amount",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Approval Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "APPROVED" ? "success" : "warning"} className="text-[10px]">
          {row.original.status}
        </Badge>
      ),
    },
  ];

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await createExpenseAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Expense saved." });
      const catObj = categories.find((c) => c.id === formData.categoryId);

      setExpenses((prev) => [
        {
          id: `exp-${Date.now()}`,
          voucherNo: `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          categoryName: catObj?.name || "General Operating Expense",
          amount: formData.amount,
          expenseDate: formData.expenseDate,
          payeeName: formData.payeeName,
          paymentMethod: formData.paymentMethod,
          description: formData.description,
          status: "APPROVED",
        },
        ...prev,
      ]);

      setTimeout(() => {
        setIsAddOpen(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to record expense." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense & Petty Cash Management"
        description="Track operational logistics expenses, cold-chain energy costs, vehicle maintenance, and operating overheads for accurate net profit computation."
        badge={<Badge variant="outline">Module M13</Badge>}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-9">
                <Plus className="h-3.5 w-3.5" />
                Record Expense Voucher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Record Operating Expense Voucher</DialogTitle>
              </DialogHeader>

              {feedback && (
                <div
                  className={`p-3 rounded-md text-xs font-medium ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Expense Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs font-medium">Amount (৳) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                      }
                      required
                      className="text-xs h-9 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Payment Method</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(val: any) =>
                        setFormData({ ...formData, paymentMethod: val })
                      }
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash / Petty Cash</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                        <SelectItem value="MFS_BKASH_NAGAD">MFS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="payeeName" className="text-xs font-medium">Payee / Vendor Name *</Label>
                    <Input
                      id="payeeName"
                      placeholder="e.g. DPDC Electricity, Meghna Fuel"
                      value={formData.payeeName}
                      onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="expenseDate" className="text-xs font-medium">Voucher Date *</Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      value={formData.expenseDate}
                      onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium">Purpose / Description *</Label>
                  <Input
                    id="description"
                    placeholder="e.g. Diesel fuel for delivery vans (Route 1 & 2)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Voucher"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={expenses}
        searchKey="payeeName"
        searchPlaceholder="Search payee or voucher #..."
      />
    </div>
  );
}
