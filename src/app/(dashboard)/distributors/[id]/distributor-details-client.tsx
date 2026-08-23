"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Route,
  Target,
  Plus,
  ShoppingCart,
  Receipt,
  FileText,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
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
import { DistributorDetailRecord, ExpenseCategoryRecord } from "@/types/models";
import { recordDistributorExpenseAction } from "@/server/actions/distributor.actions";
import { DistributorExpenseInput } from "@/validations/distributor.schema";

interface DistributorDetailsClientProps {
  distributor: DistributorDetailRecord;
  expenseCategories: ExpenseCategoryRecord[];
}

export function DistributorDetailsClient({
  distributor,
  expenseCategories,
}: DistributorDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"SALES" | "COLLECTIONS" | "EXPENSES">("SALES");

  const [isExpenseOpen, setIsExpenseOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [expenseForm, setExpenseForm] = React.useState<DistributorExpenseInput>({
    distributorId: distributor.id,
    categoryId: expenseCategories[0]?.id || "",
    amount: 1500,
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
    receiptUrl: "",
  });

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.categoryId || !expenseForm.amount || !expenseForm.description.trim()) {
      setFeedback({ type: "error", message: "Please fill in all expense fields." });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await recordDistributorExpenseAction(expenseForm);

      if (res.success) {
        setFeedback({ type: "success", message: "Representative expense voucher logged successfully." });
        setIsExpenseOpen(false);
        setExpenseForm({
          distributorId: distributor.id,
          categoryId: expenseCategories[0]?.id || "",
          amount: 1500,
          expenseDate: new Date().toISOString().split("T")[0],
          description: "",
          receiptUrl: "",
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to log expense." });
      }
    } catch {
      setFeedback({ type: "error", message: "Unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetAchievement =
    distributor.monthlySalesTarget > 0
      ? Math.round((distributor.totalSales / distributor.monthlySalesTarget) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-[1300px] mx-auto pb-20">
      {/* 1. Navigation Toolbar */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Link href="/distributors">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Representatives Directory
          </Link>
        </Button>

        <Button
          onClick={() => setIsExpenseOpen(true)}
          className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs h-9 px-4 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Log Representative Expense
        </Button>
      </div>

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
          <button onClick={() => setFeedback(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Profile Overview Header Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-[#0071E3] font-bold text-lg">
              {distributor.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {distributor.name}
                </h1>
                {distributor.status === "ACTIVE" ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                    Active Rep
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-xs font-semibold">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {distributor.employeeCode} • Joined {distributor.joiningDate ? formatDate(distributor.joiningDate) : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#0071E3]" />
              <span className="font-mono text-foreground font-medium">{distributor.phone}</span>
            </div>
            {distributor.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#0071E3]" />
                <span className="text-foreground">{distributor.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#0071E3]" />
              <span className="text-foreground">{distributor.assignedTerritory}</span>
            </div>
            {distributor.assignedRoute && (
              <div className="flex items-center gap-1.5">
                <Route className="h-3.5 w-3.5 text-[#0071E3]" />
                <span className="text-foreground">{distributor.assignedRoute}</span>
              </div>
            )}
          </div>
        </div>

        {/* Target Progress Box */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-1 min-w-[200px] text-right">
          <div className="text-muted-foreground">Monthly Target</div>
          <div className="font-mono font-bold text-sm text-foreground">
            {formatCurrency(distributor.monthlySalesTarget)}
          </div>
          <div className="font-bold text-xs text-[#0071E3]">
            {targetAchievement}% Performance
          </div>
        </div>
      </div>

      {/* 3. Top 4 Financial Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-sky-800">Gross Sales Booked</div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {formatCurrency(distributor.totalSales)}
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Across {distributor.salesCount || 0} wholesale orders</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-emerald-800">Collections Recovered</div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(distributor.totalCollected)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Recovered from pharmacies</div>
        </div>

        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-purple-800">Gross Profit Contribution</div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(distributor.grossProfitContribution)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Sales minus historical COGS</div>
        </div>

        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-medium text-amber-800">Net Contribution</div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(distributor.netContribution)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">
            Expenses: {formatCurrency(distributor.totalExpenses)} subtracted
          </div>
        </div>
      </div>

      {/* 4. Tabbed Performance Cockpit */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Tab Headers */}
        <div className="flex border-b border-border/60 bg-muted/20 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("SALES")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "SALES"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Wholesale Sales History ({distributor.sales.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("COLLECTIONS")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "COLLECTIONS"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Collections & Receipts ({distributor.collections.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("EXPENSES")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "EXPENSES"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Operating Expenses ({distributor.expenses.length})
          </button>
        </div>

        {/* Tab 1: Sales Orders */}
        {activeTab === "SALES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order & Invoice #</th>
                  <th className="px-4 py-3.5">Customer Pharmacy</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Grand Total</th>
                  <th className="px-4 py-3.5 text-right">Paid / Due</th>
                  <th className="px-4 py-3.5 text-right">Gross Profit</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {distributor.sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                      No sales orders booked under this representative yet.
                    </td>
                  </tr>
                ) : (
                  distributor.sales.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                        <Link href={`/sales/${s.id}`} className="hover:underline">
                          {s.saleNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-foreground">{s.customerName}</td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(s.saleDate)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                        {formatCurrency(s.grandTotal)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        <span className="text-emerald-700 font-bold">{formatCurrency(s.paidAmount)}</span> /{" "}
                        <span className="text-amber-700 font-bold">{formatCurrency(s.dueAmount)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(s.grossProfit)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[#0071E3]">
                          <Link href={`/sales/${s.id}`}>
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Collections */}
        {activeTab === "COLLECTIONS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Money Receipt #</th>
                  <th className="px-4 py-3.5">Customer Pharmacy</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Method</th>
                  <th className="px-5 py-3.5 text-right">Amount Recovered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {distributor.collections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                      No customer payment receipts logged by this representative yet.
                    </td>
                  </tr>
                ) : (
                  distributor.collections.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-foreground">{p.receiptNumber}</td>
                      <td className="px-4 py-3.5 font-medium text-foreground">{p.customerName}</td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="px-4 py-3.5 capitalize">{p.paymentMethod.replace(/_/g, " ").toLowerCase()}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Expenses */}
        {activeTab === "EXPENSES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5 text-right">Amount (AFN)</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {distributor.expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                      No field expenses recorded for this representative yet.
                    </td>
                  </tr>
                ) : (
                  distributor.expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(e.expenseDate)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-foreground">{e.categoryName}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{e.description}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600">
                        {formatCurrency(e.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          {e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Record Expense Modal */}
      <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Plus className="h-5 w-5 text-[#0071E3]" />
              Log Expense for {distributor.name}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRecordExpense} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Expense Category</Label>
              <Select
                value={expenseForm.categoryId}
                onValueChange={(val) => setExpenseForm({ ...expenseForm, categoryId: val })}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs bg-muted/20">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Amount (AFN / ؋)</Label>
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Date</Label>
                <Input
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Description / Purpose</Label>
              <Textarea
                placeholder="e.g. Fuel allowance for Dhanmondi morning route delivery..."
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
                onClick={() => setIsExpenseOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs font-medium"
              >
                {isSubmitting ? "Logging..." : "Record Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
