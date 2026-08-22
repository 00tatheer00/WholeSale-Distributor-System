"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Plus, CheckCircle2, Clock, Landmark, Smartphone, AlertCircle } from "lucide-react";
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
import { recordCustomerPaymentAction } from "@/server/actions/payment.actions";
import { CustomerPaymentInput } from "@/validations/payment.schema";

interface PaymentsClientProps {
  initialPayments: any[];
  customers: any[];
  distributors: any[];
}

export function PaymentsClient({
  initialPayments,
  customers,
  distributors,
}: PaymentsClientProps) {
  const [payments, setPayments] = React.useState(initialPayments);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = React.useState<CustomerPaymentInput>({
    customerId: customers[0]?.id || "",
    amount: 10000,
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNo: "",
    bankName: "",
    chequeNumber: "",
    chequeMaturityDate: "",
    distributorId: distributors[0]?.id || "",
    notes: "",
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "receiptNo",
      header: "Money Receipt (MR) #",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground text-xs">
          {row.original.receiptNo}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer Pharmacy",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.original.customerName}</div>
          <div className="text-[11px] text-muted-foreground">Collector: {row.original.distributorName}</div>
        </div>
      ),
    },
    {
      accessorKey: "paymentDate",
      header: "Collection Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.paymentDate)}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Mode",
      cell: ({ row }) => {
        const method = row.original.paymentMethod;
        return (
          <div className="space-y-0.5">
            <Badge variant="outline" className="text-[10px] uppercase">
              {method}
            </Badge>
            {method === "CHEQUE" && row.original.chequeNumber && (
              <div className="text-[10px] font-mono text-muted-foreground">
                CQ: {row.original.chequeNumber} ({row.original.bankName || "Bank"})
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Collected Amount",
      cell: ({ row }) => (
        <span className="font-bold text-emerald-600">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Reconciliation Status",
      cell: ({ row }) => {
        const cqStatus = row.original.chequeStatus;
        return (
          <div className="space-y-0.5">
            <Badge variant="success" className="text-[10px]">
              {row.original.status}
            </Badge>
            {cqStatus && cqStatus !== "NOT_APPLICABLE" && (
              <div className="text-[10px] text-muted-foreground font-medium">
                Cheque: {cqStatus}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await recordCustomerPaymentAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Payment recorded." });
      const custObj = customers.find((c) => c.id === formData.customerId);
      const distObj = distributors.find((d) => d.id === formData.distributorId);

      setPayments((prev) => [
        {
          id: `pay-${Date.now()}`,
          receiptNo: `MR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          customerId: formData.customerId,
          customerName: custObj?.tradeName || "Customer Pharmacy",
          amount: formData.amount,
          paymentMethod: formData.paymentMethod,
          paymentDate: formData.paymentDate,
          status: "CONFIRMED",
          chequeNumber: formData.chequeNumber,
          bankName: formData.bankName,
          chequeStatus: formData.paymentMethod === "CHEQUE" ? "HOLDING" : undefined,
          distributorName: distObj?.name || "Direct Cashier",
        },
        ...prev,
      ]);

      setTimeout(() => {
        setIsAddOpen(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: "error", message: res.error || "Payment recording failed." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer AR Collections & Cheque Register"
        description="Process customer money receipts, auto-reconcile outstanding invoices via FIFO debt clearance, and track post-dated cheque clearances."
        badge={<Badge variant="outline">Module M09</Badge>}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-9">
                <Plus className="h-3.5 w-3.5" />
                Record Money Receipt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Record Customer Payment Receipt</DialogTitle>
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

              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Customer Pharmacy *</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(val) => setFormData({ ...formData, customerId: val })}
                  >
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Select pharmacy" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.tradeName} (Due: {formatCurrency(c.currentDue)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs font-medium">Collected Amount (৳) *</Label>
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
                    <Label className="text-xs font-medium">Payment Instrument *</Label>
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
                        <SelectItem value="CASH">Cash Collection</SelectItem>
                        <SelectItem value="CHEQUE">Bank Cheque (Holding / Clearing)</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Direct Bank Transfer / BEFTN</SelectItem>
                        <SelectItem value="MFS_BKASH_NAGAD">MFS (bKash / Nagad)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.paymentMethod === "CHEQUE" && (
                  <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Cheque Number *</Label>
                      <Input
                        placeholder="CQ-882910"
                        value={formData.chequeNumber || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, chequeNumber: e.target.value })
                        }
                        className="text-xs h-8 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Drawee Bank</Label>
                      <Input
                        placeholder="e.g. DBBL, Islami Bank"
                        value={formData.bankName || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, bankName: e.target.value })
                        }
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Maturity Date</Label>
                      <Input
                        type="date"
                        value={formData.chequeMaturityDate || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, chequeMaturityDate: e.target.value })
                        }
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentDate" className="text-xs font-medium">Receipt Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Collecting Sales Rep</Label>
                    <Select
                      value={formData.distributorId || ""}
                      onValueChange={(val) => setFormData({ ...formData, distributorId: val })}
                    >
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select representative" />
                      </SelectTrigger>
                      <SelectContent>
                        {distributors.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    {isSubmitting ? "Issuing..." : "Issue Official Money Receipt"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={payments}
        searchKey="receiptNo"
        searchPlaceholder="Search money receipt # or customer..."
      />
    </div>
  );
}
