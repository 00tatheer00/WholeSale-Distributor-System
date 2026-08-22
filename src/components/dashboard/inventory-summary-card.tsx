"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { InventorySummaryData } from "@/types/dashboard";

interface InventorySummaryCardProps {
  data: InventorySummaryData;
}

export function InventorySummaryCard({ data }: InventorySummaryCardProps) {
  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Boxes className="h-4 w-4 text-violet-600" />
              Warehouse &amp; Inventory Valuation
            </CardTitle>
            <CardDescription className="text-xs">
              Batch asset tracking, stock levels, and FEFO quarantine indicators
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href="/inventory">
              Inventory <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center divide-x">
          <div className="space-y-1">
            <div className="text-[11px] text-muted-foreground font-medium">Active Drug SKUs</div>
            <div className="text-base font-bold text-foreground">
              {data.totalActiveMedicines}
            </div>
            <div className="text-[10px] text-muted-foreground">Master catalog</div>
          </div>

          <div className="space-y-1 pl-2">
            <div className="text-[11px] text-muted-foreground font-medium">Available Units</div>
            <div className="text-base font-bold text-foreground">
              {data.totalAvailableStockUnits.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">In Warehouse</div>
          </div>

          <div className="space-y-1 pl-2">
            <div className="text-[11px] text-muted-foreground font-medium">Asset Valuation</div>
            <div className="text-base font-bold text-violet-600">
              {formatCurrency(data.inventoryPurchaseValue)}
            </div>
            <div className="text-[10px] text-muted-foreground">Purchase cost</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs">
          <Link
            href="/inventory"
            className="p-2 rounded-md bg-muted/40 hover:bg-muted/80 transition-colors flex items-center justify-between"
          >
            <span className="text-muted-foreground text-[11px]">Low Stock</span>
            <Badge variant={data.lowStockCount > 0 ? "warning" : "outline"} className="text-[10px]">
              {data.lowStockCount}
            </Badge>
          </Link>

          <Link
            href="/inventory"
            className="p-2 rounded-md bg-muted/40 hover:bg-muted/80 transition-colors flex items-center justify-between"
          >
            <span className="text-muted-foreground text-[11px]">Out of Stock</span>
            <Badge variant={data.outOfStockCount > 0 ? "destructive" : "outline"} className="text-[10px]">
              {data.outOfStockCount}
            </Badge>
          </Link>

          <Link
            href="/inventory"
            className="p-2 rounded-md bg-muted/40 hover:bg-muted/80 transition-colors flex items-center justify-between"
          >
            <span className="text-muted-foreground text-[11px]">Near Expiry</span>
            <Badge variant={data.nearExpiryBatchesCount > 0 ? "warning" : "outline"} className="text-[10px]">
              {data.nearExpiryBatchesCount}
            </Badge>
          </Link>

          <Link
            href="/inventory"
            className="p-2 rounded-md bg-muted/40 hover:bg-muted/80 transition-colors flex items-center justify-between"
          >
            <span className="text-muted-foreground text-[11px]">Expired</span>
            <Badge variant={data.expiredBatchesCount > 0 ? "destructive" : "outline"} className="text-[10px]">
              {data.expiredBatchesCount}
            </Badge>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
