"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Search,
  ArrowLeft,
  Eye,
  Lock,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  FileCode,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface AuditLogsClientProps {
  initialData?: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    logs: any[];
  };
}

export function AuditLogsClient({ initialData }: AuditLogsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [selectedAction, setSelectedAction] = React.useState(searchParams.get("action") || "ALL");
  const [selectedEntity, setSelectedEntity] = React.useState(searchParams.get("entity") || "ALL");

  const [activeDiffLog, setActiveDiffLog] = React.useState<any | null>(null);

  const data = initialData || {
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 30,
    logs: [],
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
    current.delete("page"); // Reset page when filtering
    router.push(`/audit-logs?${current.toString()}`);
  };

  const setPage = (p: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", String(p));
    router.push(`/audit-logs?${current.toString()}`);
  };

  const getActionBadge = (act: string) => {
    if (act.includes("CREATE") || act.includes("CONFIRMED")) {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">{act}</Badge>;
    }
    if (act.includes("CANCEL") || act.includes("DELETE") || act.includes("REJECTED")) {
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">{act}</Badge>;
    }
    if (act.includes("OVERRIDE") || act.includes("ADJUST")) {
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">{act}</Badge>;
    }
    return <Badge variant="outline" className="text-[10px] font-mono">{act}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Settings
          </Link>
        </Button>

        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 gap-1.5">
          <Lock className="h-3 w-3" /> Append-Only Immutable Security Ledger
        </Badge>
      </div>

      <PageHeader
        title="Security & System Audit Log Explorer"
        description="Comprehensive forensic audit trail of all transactions, authentication events, inventory adjustments, and administrative overrides."
      />

      {/* 2. Filters Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters({ search: search.trim() || null });
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action, entity ID, actor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5 pr-16 h-10 rounded-xl bg-muted/30 border-muted-foreground/20 text-sm"
          />
        </form>

        <Select
          value={selectedAction}
          onValueChange={(val) => {
            setSelectedAction(val);
            applyFilters({ action: val });
          }}
        >
          <SelectTrigger className="h-10 text-xs rounded-xl w-[180px] bg-background">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="CANCEL">Cancel / Void</SelectItem>
            <SelectItem value="STOCK_ADJUSTMENT">Stock Adjustment</SelectItem>
            <SelectItem value="CREDIT_OVERRIDE">Credit Override</SelectItem>
            <SelectItem value="UPDATE_COMPANY_SETTINGS">Settings Update</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedEntity}
          onValueChange={(val) => {
            setSelectedEntity(val);
            applyFilters({ entity: val });
          }}
        >
          <SelectTrigger className="h-10 text-xs rounded-xl w-[180px] bg-background">
            <SelectValue placeholder="Entity Domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Entities</SelectItem>
            <SelectItem value="Sale">Wholesale Sale</SelectItem>
            <SelectItem value="Purchase">Purchase Order</SelectItem>
            <SelectItem value="Medicine">Medicine Catalog</SelectItem>
            <SelectItem value="Customer">Customer Pharmacy</SelectItem>
            <SelectItem value="Supplier">Supplier Manufacturer</SelectItem>
            <SelectItem value="BusinessExpense">Business Expense</SelectItem>
            <SelectItem value="CompanySettings">Company Settings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 3. Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Entity & ID</th>
                <th className="px-4 py-3.5">Actor / User</th>
                <th className="px-4 py-3.5">Client & IP</th>
                <th className="px-5 py-3.5 text-right">Payload Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    No security audit logs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                data.logs.map((l: any) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-muted-foreground whitespace-nowrap">
                      {formatDate(l.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">{getActionBadge(l.action)}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">{l.entityName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">
                        {l.entityId}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">{l.userName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{l.userEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-mono text-[11px]">
                      {l.ipAddress}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {l.oldValues || l.newValues ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveDiffLog(l)}
                          className="h-7 text-xs text-[#0071E3] hover:bg-sky-50 rounded-lg"
                        >
                          <Eye className="h-3 w-3 mr-1" /> Inspect Diff
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">No state diff</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data.totalPages > 1 && (
          <div className="px-6 py-3.5 border-t border-border/60 flex items-center justify-between bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Showing page {data.currentPage} of {data.totalPages} ({data.totalCount} total audit records)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(data.currentPage - 1)}
                disabled={data.currentPage <= 1}
                className="h-8 text-xs rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(data.currentPage + 1)}
                disabled={data.currentPage >= data.totalPages}
                className="h-8 text-xs rounded-xl"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Structured Payload Diff Inspection Modal */}
      {activeDiffLog && (
        <Dialog open={!!activeDiffLog} onOpenChange={() => setActiveDiffLog(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <FileCode className="h-4 w-4 text-[#0071E3]" />
                Audit Record Payload Diff: {activeDiffLog.action}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {activeDiffLog.entityName} ID: {activeDiffLog.entityId} • Modified by {activeDiffLog.userName} on {formatDate(activeDiffLog.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mt-2">
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-700 font-sans block">Previous State (Before)</span>
                <pre className="p-3 bg-muted/50 rounded-xl border text-[11px] overflow-x-auto max-h-64">
                  {activeDiffLog.oldValues
                    ? JSON.stringify(activeDiffLog.oldValues, null, 2)
                    : "// Initial Record Creation (No previous state)"}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 font-sans block">New State (After)</span>
                <pre className="p-3 bg-muted/50 rounded-xl border text-[11px] overflow-x-auto max-h-64">
                  {activeDiffLog.newValues
                    ? JSON.stringify(activeDiffLog.newValues, null, 2)
                    : "// Record Cancelled / Removed"}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
