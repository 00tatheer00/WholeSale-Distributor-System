"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TrendingUp,
  DollarSign,
  Package,
  Receipt,
  Award,
  Calendar,
  Layers,
  Users,
  Pill,
  PieChart,
  BarChart3,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProfitOverviewData } from "@/types/models";

interface ProfitClientProps {
  initialData?: ProfitOverviewData;
}

export function ProfitClient({ initialData }: ProfitClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPreset = initialData?.preset || "this_month";
  const [activeTab, setActiveTab] = React.useState<"MEDICINES" | "SALESMEN">("MEDICINES");

  const [isCustomOpen, setIsCustomOpen] = React.useState(false);
  const [customStart, setCustomStart] = React.useState(initialData?.startDate || "");
  const [customEnd, setCustomEnd] = React.useState(initialData?.endDate || "");

  const data = initialData || {
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    preset: "this_month",
    salesRevenue: 0,
    historicalCogs: 0,
    grossProfit: 0,
    grossMarginPercent: 0,
    operatingExpenses: 0,
    distributorExpenses: 0,
    totalExpenses: 0,
    netProfit: 0,
    netMarginPercent: 0,
    totalSalesCount: 0,
    dailyTrends: [],
    medicineBreakdown: [],
    distributorBreakdown: [],
  };

  const handleSelectPreset = (preset: string) => {
    if (preset === "custom") {
      setIsCustomOpen(true);
      return;
    }
    router.push(`/profit?preset=${preset}`);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    setIsCustomOpen(false);
    router.push(`/profit?preset=custom&start=${customStart}&end=${customEnd}`);
  };

  const presets = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
    { label: "Last Month", value: "last_month" },
    { label: "Custom Range", value: "custom" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* 1. Header Section */}
      <PageHeader
        title="Profit Management & Financial Intelligence"
        description="Authoritative COGS derived strictly from historical batch costs, operating expenses, and net profit margins."
      >
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/80">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => handleSelectPreset(p.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                currentPreset === p.value
                  ? "bg-white dark:bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Date Span Subheader */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-[#0071E3]" />
          <span>
            Accounting Period:{" "}
            <strong className="text-foreground font-mono">
              {formatDate(data.startDate)}
            </strong>{" "}
            to{" "}
            <strong className="text-foreground font-mono">
              {formatDate(data.endDate)}
            </strong>
          </span>
        </div>
        <div className="text-[11px] bg-sky-50 text-[#0071E3] font-mono px-2 py-0.5 rounded-md border border-sky-200">
          {data.totalSalesCount} Confirmed Sales Analyzed
        </div>
      </div>

      {/* 2. Top 6 Pastel KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Gross Sales Revenue */}
        <div className="bg-sky-50/70 border border-sky-100/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-800">Gross Revenue</span>
            <div className="h-6 w-6 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-sky-950 font-mono">
            {formatCurrency(data.salesRevenue)}
          </div>
          <div className="text-[10px] text-sky-600 mt-1">Wholesale invoice totals</div>
        </div>

        {/* Card 2: Historical COGS */}
        <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-800">Historical COGS</span>
            <div className="h-6 w-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-700">
              <Package className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-rose-950 font-mono">
            {formatCurrency(data.historicalCogs)}
          </div>
          <div className="text-[10px] text-rose-600 mt-1">
            {data.salesRevenue > 0
              ? `${Math.round((data.historicalCogs / data.salesRevenue) * 100)}% of revenue`
              : "0%"}
          </div>
        </div>

        {/* Card 3: Gross Profit Realized */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800">Gross Profit</span>
            <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-950 font-mono">
            {formatCurrency(data.grossProfit)}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1">Revenue minus COGS</div>
        </div>

        {/* Card 4: Gross Margin % */}
        <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-800">Gross Margin</span>
            <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-700">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-indigo-950 font-mono">
            {data.grossMarginPercent.toFixed(1)}%
          </div>
          <div className="text-[10px] text-indigo-600 mt-1">Wholesale trading markup</div>
        </div>

        {/* Card 5: Operating Expenses */}
        <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800">Total Expenses</span>
            <div className="h-6 w-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Receipt className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-amber-950 font-mono">
            {formatCurrency(data.totalExpenses)}
          </div>
          <div className="text-[10px] text-amber-600 mt-1">Business + field costs</div>
        </div>

        {/* Card 6: Net Profit Realized */}
        <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-800">Net Profit</span>
            <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-700">
              <Award className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-purple-950 font-mono">
            {formatCurrency(data.netProfit)}
          </div>
          <div className="text-[10px] text-purple-600 mt-1">
            Net Margin: {data.netMarginPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 2.5 Financial Formula Intelligence Bar */}
      <div className="bg-muted/30 border border-border/80 rounded-2xl p-3.5 px-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-foreground">
            Profit Calculation Engine:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-mono text-[11px]">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="font-bold">Gross Profit (Without Expenses)</span> = Revenue (After Discounts) − COGS
          </div>
          <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200">
            <span className="font-bold">Net Profit (With Expenses)</span> = Gross Profit − Total Expenses
          </div>
        </div>
      </div>

      {/* 3. Trend Visualizations Section */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#0071E3]" />
              Financial Trend Trajectory
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Daily revenue, cost of goods sold, operating overheads, and resulting net profit.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#0071E3]" />
              <span className="text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-muted-foreground">COGS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Gross Profit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Net Profit</span>
            </div>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          {data.dailyTrends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No transactions recorded during this date window.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071E3" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0071E3" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0071E3" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="grossProfit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorGross)" name="Gross Profit" />
                <Area type="monotone" dataKey="netProfit" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" name="Net Profit" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Tabbed Detailed Financial Breakdown */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-border/60 bg-muted/20 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("MEDICINES")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "MEDICINES"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            Medicine-wise Profit Intelligence ({data.medicineBreakdown.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SALESMEN")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "SALESMEN"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Salesman / Representative Contribution ({data.distributorBreakdown.length})
          </button>
        </div>

        {/* Tab 1: Medicine-wise Profit */}
        {activeTab === "MEDICINES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Medicine Product</th>
                  <th className="px-4 py-3.5">Therapeutic Category</th>
                  <th className="px-4 py-3.5 text-right">Units Sold</th>
                  <th className="px-4 py-3.5 text-right">Sales Revenue</th>
                  <th className="px-4 py-3.5 text-right">Historical COGS</th>
                  <th className="px-4 py-3.5 text-right">Gross Profit</th>
                  <th className="px-5 py-3.5 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.medicineBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                      No medicine sales recorded during this window.
                    </td>
                  </tr>
                ) : (
                  data.medicineBreakdown.map((m) => (
                    <tr key={m.medicineId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">{m.brandName}</div>
                        <div className="text-[10px] text-muted-foreground">{m.genericName}</div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{m.categoryName}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-foreground">
                        {m.quantitySold} units
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sky-800">
                        {formatCurrency(m.salesRevenue)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-rose-700">
                        {formatCurrency(m.historicalCogs)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(m.grossProfit)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-foreground">
                        {m.marginPercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Salesman / Distributor Contribution */}
        {activeTab === "SALESMEN" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Representative</th>
                  <th className="px-4 py-3.5">Territory</th>
                  <th className="px-4 py-3.5 text-right">Sales Booked</th>
                  <th className="px-4 py-3.5 text-right">Collections Recovered</th>
                  <th className="px-4 py-3.5 text-right">Gross Profit Contrib</th>
                  <th className="px-4 py-3.5 text-right">Field Expenses</th>
                  <th className="px-5 py-3.5 text-right">Net Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.distributorBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                      No sales representatives active during this window.
                    </td>
                  </tr>
                ) : (
                  data.distributorBreakdown.map((d) => (
                    <tr key={d.distributorId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-foreground">{d.name}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{d.territory}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sky-800">
                        {formatCurrency(d.salesRevenue)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-emerald-700 font-semibold">
                        {formatCurrency(d.collectionsAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(d.grossProfitContribution)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-rose-600">
                        {formatCurrency(d.distributorExpenses)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-purple-700">
                        {formatCurrency(d.netContribution)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Custom Date Range Dialog */}
      <Dialog open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Calendar className="h-5 w-5 text-[#0071E3]" />
              Select Custom Accounting Window
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleApplyCustom} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Start Date</Label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-9 rounded-xl bg-muted/20 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">End Date</Label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-9 rounded-xl bg-muted/20 text-xs"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCustomOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs font-medium"
              >
                Apply Date Range
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
