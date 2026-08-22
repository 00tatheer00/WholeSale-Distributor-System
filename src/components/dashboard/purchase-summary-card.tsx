"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingCart, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PurchaseSummaryData } from "@/types/dashboard";

interface PurchaseSummaryCardProps {
  data: PurchaseSummaryData;
}

export function PurchaseSummaryCard({ data }: PurchaseSummaryCardProps) {
  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              Procurement & GRN Summary
            </CardTitle>
            <CardDescription className="text-xs">
              Pharmaceutical manufacturer order intake & AP balances
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href="/purchases">
              Purchases <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center divide-x">
          <div className="space-y-1">
            <div className="text-[11px] text-muted-foreground font-medium">Today</div>
            <div className="text-base font-bold text-foreground">
              {formatCurrency(data.todayPurchases)}
            </div>
            <div className="text-[10px] text-blue-600 font-medium">Consignment GRN</div>
          </div>

          <div className="space-y-1 pl-2">
            <div className="text-[11px] text-muted-foreground font-medium">This Month</div>
            <div className="text-base font-bold text-foreground">
              {formatCurrency(data.thisMonthPurchases)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {data.purchaseTransactionsCount} Consignments
            </div>
          </div>

          <div className="space-y-1 pl-2">
            <div className="text-[11px] text-muted-foreground font-medium">Supplier Payables</div>
            <div className="text-base font-bold text-rose-600">
              {formatCurrency(data.outstandingSupplierAmount)}
            </div>
            <div className="text-[10px] text-muted-foreground">Due to Vendors</div>
          </div>
        </div>

        <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Suppliers: Square, Beximco, Incepta, Renata</span>
          <Link href="/suppliers" className="text-primary hover:underline font-medium">
            Vendor Directory →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
