"use client";

import * as React from "react";
import Link from "next/link";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { SalesSummaryData } from "@/types/dashboard";

interface SalesSummaryCardProps {
  data: SalesSummaryData;
}

export function SalesSummaryCard({ data }: SalesSummaryCardProps) {
  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Wholesale Sales Summary
            </CardTitle>
            <CardDescription className="text-xs">
              B2B pharmacy order billing and dispatch velocity
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href="/sales">
              Sales <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center divide-x">
          <div className="space-y-1">
            <div className="text-[11px] text-muted-foreground font-medium">Today</div>
            <div className="text-base font-bold text-foreground">
              {formatCurrency(data.todaySales)}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">
              {data.todayInvoicesCount} Invoices
            </div>
          </div>

          <div className="space-y-1 pl-2">
            <div className="text-[11px] text-muted-foreground font-medium">This Week</div>
            <div className="text-base font-bold text-foreground">
              {formatCurrency(data.thisWeekSales)}
            </div>
            <div className="text-[10px] text-muted-foreground">Rolling 7d</div>
          </div>

          <div className="space-y-1 pl-2">
            <div className="text-[11px] text-muted-foreground font-medium">This Month</div>
            <div className="text-base font-bold text-foreground">
              {formatCurrency(data.thisMonthSales)}
            </div>
            <div className="text-[10px] text-muted-foreground">Month-to-Date</div>
          </div>
        </div>

        <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Delivery mode: Standard Route Beat</span>
          <Link href="/invoices" className="text-primary hover:underline font-medium">
            View Tax Invoices →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
