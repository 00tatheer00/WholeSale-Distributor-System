"use client";

import * as React from "react";
import Link from "next/link";
import { DollarSign, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ProfitSummaryData } from "@/types/dashboard";

interface ProfitSummaryCardProps {
  data: ProfitSummaryData;
}

export function ProfitSummaryCard({ data }: ProfitSummaryCardProps) {
  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Profit &amp; Loss Waterfall (P&amp;L)
            </CardTitle>
            <CardDescription className="text-xs">
              Based on exact historical batch cost (COGS) and operational overhead
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href="/reports">
              Reports <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2.5 text-xs font-mono">
        <div className="flex justify-between py-1 border-b text-muted-foreground font-sans">
          <span>Gross Billed Revenue</span>
          <span className="font-semibold text-foreground">{formatCurrency(data.grossRevenue)}</span>
        </div>

        <div className="flex justify-between py-0.5 text-emerald-600 pl-3">
          <span>Less: Trade Discounts</span>
          <span>-{formatCurrency(data.tradeDiscounts)}</span>
        </div>

        <div className="flex justify-between py-1 border-y bg-muted/30 px-2 font-bold font-sans">
          <span>Net Billed Revenue</span>
          <span>{formatCurrency(data.netRevenue)}</span>
        </div>

        <div className="flex justify-between py-0.5 text-rose-600 pl-3">
          <span>Less: Cost of Goods Sold (COGS)</span>
          <span>-{formatCurrency(data.cogsTotal)}</span>
        </div>

        <div className="flex justify-between py-1.5 border-y bg-primary/10 px-2 font-bold text-primary font-sans">
          <span>Gross Profit</span>
          <span>
            {formatCurrency(data.grossProfit)} ({data.grossMarginPercent.toFixed(1)}%)
          </span>
        </div>

        <div className="flex justify-between py-0.5 text-amber-600 pl-3">
          <span>Less: Operating Expenses (Fuel/Power/Admin)</span>
          <span>-{formatCurrency(data.operatingExpenses)}</span>
        </div>

        <div className="flex justify-between py-2 border-y-2 border-primary bg-primary/20 px-2 font-extrabold text-foreground font-sans text-sm">
          <span>Net Operating Profit</span>
          <span className="text-emerald-700 dark:text-emerald-400">
            {formatCurrency(data.netProfit)} ({data.netMarginPercent.toFixed(1)}%)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
