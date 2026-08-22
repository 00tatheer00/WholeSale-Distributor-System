"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Users, Plus, Phone, MapPin, Target, Award } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import { createDistributorAction } from "@/server/actions/distributor.actions";
import { DistributorInput } from "@/validations/distributor.schema";

interface DistributorsClientProps {
  initialDistributors: any[];
}

export function DistributorsClient({
  initialDistributors,
}: DistributorsClientProps) {
  const [distributors, setDistributors] = React.useState(initialDistributors);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = React.useState<DistributorInput>({
    name: "",
    phone: "",
    email: "",
    assignedTerritory: "",
    dailyRouteBeat: "",
    monthlySalesTarget: 500000,
    commissionRatePercent: 2.5,
    status: "ACTIVE",
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Medical Representative (MR)",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.original.name}</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" /> {row.original.phone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "assignedTerritory",
      header: "Territory & Beat",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-medium text-foreground">{row.original.assignedTerritory}</div>
          <div className="text-[11px] text-muted-foreground">{row.original.dailyRouteBeat}</div>
        </div>
      ),
    },
    {
      accessorKey: "monthlySalesTarget",
      header: "Monthly Target & Sales",
      cell: ({ row }) => {
        const target = row.original.monthlySalesTarget;
        const sales = row.original.currentMonthSales;
        const percent = target > 0 ? Math.min(100, Math.round((sales / target) * 100)) : 0;
        return (
          <div className="w-40 space-y-1 text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="font-semibold">{formatCurrency(sales)}</span>
              <span className="text-muted-foreground">/ {formatCurrency(target)}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="text-[10px] text-right text-muted-foreground">{percent}% Target Reached</div>
          </div>
        );
      },
    },
    {
      accessorKey: "recoveryAmount",
      header: "Cash Recovered",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.recoveryAmount)}
        </span>
      ),
    },
    {
      accessorKey: "earnedCommission",
      header: "Commission Earned",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-bold text-emerald-600">
            {formatCurrency(row.original.earnedCommission)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Rate: {row.original.commissionRatePercent}%
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
          {row.original.status}
        </Badge>
      ),
    },
  ];

  const handleCreateDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await createDistributorAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Salesman enrolled." });
      setDistributors((prev) => [
        {
          ...formData,
          id: `dist-${Date.now()}`,
          currentMonthSales: 0,
          recoveryAmount: 0,
          earnedCommission: 0,
        },
        ...prev,
      ]);
      setTimeout(() => {
        setIsAddOpen(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: "error", message: res.error || "Failed to add representative." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distributor & Salesman Operations"
        description="Field sales force territory management, daily route beat schedules, recovery-based commissions, and performance targets."
        badge={<Badge variant="outline">Module M11</Badge>}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs h-9">
                <Plus className="h-3.5 w-3.5" />
                Add Sales Representative
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Enroll Medical Sales Representative</DialogTitle>
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

              <form onSubmit={handleCreateDistributor} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">Representative Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Tariqul Islam"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+880 1718..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="rep@pharmadist.com"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="assignedTerritory" className="text-xs font-medium">Assigned Territory *</Label>
                  <Input
                    id="assignedTerritory"
                    placeholder="e.g. Dhaka North - Mirpur / Pallabi"
                    value={formData.assignedTerritory}
                    onChange={(e) => setFormData({ ...formData, assignedTerritory: e.target.value })}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dailyRouteBeat" className="text-xs font-medium">Daily Route Beat</Label>
                  <Input
                    id="dailyRouteBeat"
                    placeholder="e.g. Route 1: Mirpur 1, 2, 10, 14"
                    value={formData.dailyRouteBeat || ""}
                    onChange={(e) => setFormData({ ...formData, dailyRouteBeat: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="monthlySalesTarget" className="text-xs font-medium">Monthly Target (৳)</Label>
                    <Input
                      id="monthlySalesTarget"
                      type="number"
                      value={formData.monthlySalesTarget}
                      onChange={(e) => setFormData({ ...formData, monthlySalesTarget: parseFloat(e.target.value) || 0 })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="commissionRatePercent" className="text-xs font-medium">Commission Rate (%)</Label>
                    <Input
                      id="commissionRatePercent"
                      type="number"
                      step="0.1"
                      value={formData.commissionRatePercent}
                      onChange={(e) => setFormData({ ...formData, commissionRatePercent: parseFloat(e.target.value) || 0 })}
                      className="text-xs h-9"
                    />
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
                    {isSubmitting ? "Enrolling..." : "Enroll Representative"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={distributors}
        searchKey="name"
        searchPlaceholder="Search salesman name or territory..."
      />
    </div>
  );
}
