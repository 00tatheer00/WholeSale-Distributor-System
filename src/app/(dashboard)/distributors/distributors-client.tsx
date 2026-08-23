"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  CreditCard,
  Target,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Route,
  Award,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatCurrency } from "@/lib/utils";
import { DistributorQueryResult } from "@/server/services/distributor.service";
import {
  createDistributorAction,
  toggleDistributorStatusAction,
} from "@/server/actions/distributor.actions";
import { DistributorInput } from "@/validations/distributor.schema";
import { DistributorRecord } from "@/types/models";

interface DistributorsClientProps {
  initialData?: DistributorQueryResult;
}

export function DistributorsClient({ initialData }: DistributorsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get("status") || "ALL");

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = React.useState<DistributorInput>({
    name: "",
    phone: "",
    email: "",
    address: "",
    assignedTerritory: "Dhanmondi & Green Road",
    assignedRoute: "Morning Beat 1",
    monthlySalesTarget: 500000,
    commissionRatePercent: 2.5,
    status: "ACTIVE",
    notes: "",
  });

  const data = initialData || {
    distributors: [],
    totalCount: 0,
    totalTeamSales: 0,
    totalTeamCollections: 0,
    totalTeamExpenses: 0,
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
    router.push(`/distributors?${current.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: search.trim() || null });
  };

  const handleCreateDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.assignedTerritory.trim()) {
      setFeedback({ type: "error", message: "Please fill in all mandatory fields (Name, Phone, Territory)." });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createDistributorAction(formData);

      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Sales representative enrolled successfully." });
        setIsAddOpen(false);
        setFormData({
          name: "",
          phone: "",
          email: "",
          address: "",
          assignedTerritory: "Dhanmondi & Green Road",
          assignedRoute: "Morning Beat 1",
          monthlySalesTarget: 500000,
          commissionRatePercent: 2.5,
          status: "ACTIVE",
          notes: "",
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to create sales representative." });
      }
    } catch {
      setFeedback({ type: "error", message: "Unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (d: DistributorRecord) => {
    const newStatus = d.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await toggleDistributorStatusAction(d.id, newStatus as any);
      if (res.success) {
        setFeedback({
          type: "success",
          message: `Representative "${d.name}" status changed to ${newStatus}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to toggle status." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update status." });
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* 1. Header Section */}
      <PageHeader
        title="Distributors & Field Sales Representatives"
        description="Medical representatives (MR), assigned routes, field booking performance, collection recovery, and net contribution."
      >
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm rounded-xl font-medium px-4 h-10 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Sales Representative
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

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Representatives */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Field Sales Team</span>
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950 font-mono">
            {data.totalCount} Active Reps
          </div>
          <div className="text-[11px] text-sky-600 mt-1">Covering assigned routes</div>
        </div>

        {/* Total Sales Generated */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Team Sales Generated</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.totalTeamSales)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Wholesale orders booked</div>
        </div>

        {/* Collections Recovered */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Collections Recovered</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950 font-mono">
            {formatCurrency(data.totalTeamCollections)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Customer payment receipts</div>
        </div>

        {/* Field Operating Expenses */}
        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Field Expenses</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-700">
              <Route className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-950 font-mono">
            {formatCurrency(data.totalTeamExpenses)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">Fuel & travel allowances</div>
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
              placeholder="Search by representative name, code (EMP-...), phone, territory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9.5 pr-20 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm focus-visible:ring-1"
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

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                applyFilters({ status: val });
              }}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl w-[140px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active Reps</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. Distributors Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Representative</th>
                <th className="px-4 py-3.5">Territory & Route</th>
                <th className="px-4 py-3.5 text-right">Target</th>
                <th className="px-4 py-3.5 text-right">Sales Booked</th>
                <th className="px-4 py-3.5 text-right">Collections</th>
                <th className="px-4 py-3.5 text-right">Net Contribution</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.distributors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">No sales representatives found</p>
                    <p className="text-xs mt-1">Enroll a field medical representative to get started.</p>
                  </td>
                </tr>
              ) : (
                data.distributors.map((d) => {
                  const targetAchievement =
                    d.monthlySalesTarget > 0
                      ? Math.round((d.totalSales / d.monthlySalesTarget) * 100)
                      : 0;

                  return (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      {/* Name & Code */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <Link
                            href={`/distributors/${d.id}`}
                            className="font-semibold text-foreground hover:text-[#0071E3] transition-colors"
                          >
                            {d.name}
                          </Link>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {d.employeeCode} • {d.phone}
                          </div>
                        </div>
                      </td>

                      {/* Territory & Route */}
                      <td className="px-4 py-4">
                        <div className="text-xs font-medium text-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#0071E3] shrink-0" />
                          {d.assignedTerritory}
                        </div>
                        {d.assignedRoute && (
                          <div className="text-[11px] text-muted-foreground pl-4">
                            {d.assignedRoute}
                          </div>
                        )}
                      </td>

                      {/* Target */}
                      <td className="px-4 py-4 text-right font-mono text-xs text-muted-foreground">
                        {formatCurrency(d.monthlySalesTarget)}
                        <div className="text-[10px] text-muted-foreground font-sans">
                          {targetAchievement}% achieved
                        </div>
                      </td>

                      {/* Total Sales */}
                      <td className="px-4 py-4 text-right font-mono font-bold text-xs text-foreground">
                        {formatCurrency(d.totalSales)}
                      </td>

                      {/* Collections */}
                      <td className="px-4 py-4 text-right font-mono text-xs text-emerald-700 font-semibold">
                        {formatCurrency(d.totalCollected)}
                      </td>

                      {/* Net Contribution */}
                      <td className="px-4 py-4 text-right font-mono text-xs font-bold text-purple-700">
                        {formatCurrency(d.netContribution)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(d)}
                          className="inline-block"
                        >
                          {d.status === "ACTIVE" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium hover:bg-emerald-100">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px] font-medium hover:bg-muted">
                              Inactive
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-[#0071E3] hover:bg-sky-50 rounded-lg"
                        >
                          <Link href={`/distributors/${d.id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> 360° Profile
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
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
              of <span className="font-semibold text-foreground">{data.totalCount}</span> representatives
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

      {/* 6. Add Distributor Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Users className="h-5 w-5 text-[#0071E3]" />
              Enroll Field Sales Representative
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateDistributor} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Md. Tariqul Islam"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Phone Number <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. +880 1711 223344"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Assigned Territory <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Dhanmondi, Kalabagan & Green Road"
                  value={formData.assignedTerritory}
                  onChange={(e) => setFormData({ ...formData, assignedTerritory: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Daily Route / Beat</Label>
                <Input
                  placeholder="e.g. Beat 1: Green Rd -> Central Hospital"
                  value={formData.assignedRoute || ""}
                  onChange={(e) => setFormData({ ...formData, assignedRoute: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Monthly Sales Target (৳ BDT)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.monthlySalesTarget}
                  onChange={(e) => setFormData({ ...formData, monthlySalesTarget: parseFloat(e.target.value) || 0 })}
                  className="h-9 rounded-xl bg-muted/20 text-xs font-mono font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Commission Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={formData.commissionRatePercent}
                  onChange={(e) => setFormData({ ...formData, commissionRatePercent: parseFloat(e.target.value) || 0 })}
                  className="h-9 rounded-xl bg-muted/20 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Email Address</Label>
                <Input
                  type="email"
                  placeholder="e.g. tariqul@apexpharma.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Residential Address</Label>
                <Input
                  placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-9 rounded-xl bg-muted/20 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs font-medium"
              >
                {isSubmitting ? "Enrolling..." : "Enroll Sales Representative"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
