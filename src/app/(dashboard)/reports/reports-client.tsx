"use client";

import * as React from "react";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  DollarSign,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { FinancialSummary, MonthlyTrendData, AgingBucket } from "@/types/models";

interface ReportsClientProps {
  financials: FinancialSummary;
  monthlyTrends: MonthlyTrendData[];
  dueAging: AgingBucket[];
}

export function ReportsClient({
  financials,
  monthlyTrends,
  dueAging,
}: ReportsClientProps) {
  const [activeTab, setActiveTab] = React.useState("pnl");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial & BI Analytics Hub"
        description="Real-time Cost of Goods Sold (COGS), Gross vs Net Profit statements, customer accounts receivable aging matrices, and executive intelligence."
        badge={<Badge variant="outline">Module M14 & M15</Badge>}
      />

      {/* Top Level Financial KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Net Billed Revenue"
          value={formatCurrency(financials.netRevenue)}
          description={`Gross: ${formatCurrency(financials.grossRevenue)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Gross Profit"
          value={formatCurrency(financials.grossProfit)}
          description={`Margin: ${financials.grossProfitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          trend={{ value: financials.grossProfitMargin, isPositive: true, label: "Gross Margin" }}
        />
        <StatCard
          title="Operating Expenses"
          value={formatCurrency(financials.operatingExpenses)}
          description="Logistics, fuel & overhead"
          icon={Layers}
        />
        <StatCard
          title="Net Operating Profit"
          value={formatCurrency(financials.netProfit)}
          description={`Net Margin: ${financials.netProfitMargin.toFixed(1)}%`}
          icon={BarChart3}
          trend={{ value: financials.netProfitMargin, isPositive: true, label: "Net Margin" }}
        />
      </div>

      {/* Report Section Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="pnl">Profit & Loss (P&L)</TabsTrigger>
          <TabsTrigger value="aging">Customer Due Aging</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
        </TabsList>

        {/* Tab 1: P&L Statement */}
        <TabsContent value="pnl" className="space-y-4 pt-2">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Wholesale Profit & Loss (P&L) Statement
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time calculation based on exact batch acquisition costs and net billed invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs font-mono">
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b font-sans">
                  <span className="font-semibold text-foreground">1. Gross Revenue (Trade Price Value)</span>
                  <span className="font-bold text-foreground">{formatCurrency(financials.grossRevenue)}</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-600 pl-4">
                  <span>Less: Trade Discounts & Scheme Reductions</span>
                  <span>-{formatCurrency(financials.tradeDiscounts)}</span>
                </div>
                <div className="flex justify-between py-2 border-y bg-muted/30 px-2 font-bold font-sans">
                  <span>Net Billed Wholesale Revenue</span>
                  <span>{formatCurrency(financials.netRevenue)}</span>
                </div>

                <div className="flex justify-between py-1.5 text-rose-600 pl-4">
                  <span>Less: Cost of Goods Sold (COGS - Batch Acquisition Cost)</span>
                  <span>-{formatCurrency(financials.cogsTotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-y bg-primary/10 px-2 font-bold text-sm text-primary font-sans">
                  <span>Gross Profit</span>
                  <span>{formatCurrency(financials.grossProfit)} ({financials.grossProfitMargin.toFixed(2)}%)</span>
                </div>

                <div className="flex justify-between py-1.5 text-amber-600 pl-4">
                  <span>Less: Logistics, Fuel, Cold-Chain Power & Operating Expenses</span>
                  <span>-{formatCurrency(financials.operatingExpenses)}</span>
                </div>
                <div className="flex justify-between py-3 border-y-2 border-primary bg-primary/20 px-2 font-extrabold text-sm text-foreground font-sans">
                  <span>Net Operating Profit</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(financials.netProfit)} ({financials.netProfitMargin.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Customer Due Aging Matrix */}
        <TabsContent value="aging" className="space-y-4 pt-2">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                    Customer Accounts Receivable (AR) Aging Matrix
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Analysis of customer dues by payment maturity intervals
                  </CardDescription>
                </div>
                <div className="text-xs">
                  Total Outstanding: <strong className="text-foreground">{formatCurrency(financials.totalCustomerReceivables)}</strong>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Customer Pharmacy</th>
                      <th className="p-3 text-right">Current (0-30d)</th>
                      <th className="p-3 text-right">31-60 Days</th>
                      <th className="p-3 text-right">61-90 Days</th>
                      <th className="p-3 text-right">90+ Days</th>
                      <th className="p-3 text-right">Total Due</th>
                      <th className="p-3 text-center">Credit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dueAging.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-semibold text-foreground">{row.customerName}</td>
                        <td className="p-3 text-right">{formatCurrency(row.current)}</td>
                        <td className="p-3 text-right font-medium text-amber-600">
                          {row.days31To60 > 0 ? formatCurrency(row.days31To60) : "-"}
                        </td>
                        <td className="p-3 text-right text-rose-600">
                          {row.days61To90 > 0 ? formatCurrency(row.days61To90) : "-"}
                        </td>
                        <td className="p-3 text-right text-rose-700 font-bold">
                          {row.daysOver90 > 0 ? formatCurrency(row.daysOver90) : "-"}
                        </td>
                        <td className="p-3 text-right font-bold text-foreground">
                          {formatCurrency(row.totalDue)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant={row.status === "ACTIVE" ? "success" : "destructive"}
                            className="text-[10px]"
                          >
                            {row.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Monthly Trends */}
        <TabsContent value="trends" className="space-y-4 pt-2">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                Monthly Revenue & Profit Progression
              </CardTitle>
              <CardDescription className="text-xs">
                Historical monthly turnover, batch cost, and net margins
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {monthlyTrends.map((m, idx) => {
                  const marginPercent = Math.round((m.netProfit / m.revenue) * 100);
                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{m.month}</span>
                        <div className="space-x-4">
                          <span className="text-muted-foreground">Revenue: <strong>{formatCurrency(m.revenue)}</strong></span>
                          <span className="text-muted-foreground">COGS: <strong>{formatCurrency(m.cogs)}</strong></span>
                          <span className="text-emerald-600 font-bold">Net: +{formatCurrency(m.netProfit)} ({marginPercent}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(m.cogs / m.revenue) * 100}%` }}
                          title="COGS Portion"
                        />
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(m.netProfit / m.revenue) * 100}%` }}
                          title="Net Profit"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
