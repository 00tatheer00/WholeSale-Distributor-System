"use client";

import * as React from "react";
import Link from "next/link";
import { Trophy, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { TopSellingMedicine } from "@/types/dashboard";

interface TopSellingMedicinesProps {
  data: TopSellingMedicine[];
}

export function TopSellingMedicines({ data }: TopSellingMedicinesProps) {
  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top 5 Selling Medicines
            </CardTitle>
            <CardDescription className="text-xs">
              Ranked by quantity sold and gross revenue contribution
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href="/medicines">
              Catalog <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No sales data available.
          </div>
        ) : (
          <div className="divide-y text-xs">
            {data.map((med, index) => (
              <div
                key={med.id}
                className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-bold text-xs text-muted-foreground shrink-0">
                    #{index + 1}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {med.name}
                      <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 h-4">
                        {med.dosageForm}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                      {med.genericName}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-bold text-foreground">
                    {med.quantitySold.toLocaleString()} units sold
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold">
                    {formatCurrency(med.salesAmount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Stock: {med.currentStock} units
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
