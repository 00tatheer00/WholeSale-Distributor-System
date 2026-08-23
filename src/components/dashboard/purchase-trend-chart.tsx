"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShoppingCart, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendDataPoint } from "@/types/dashboard";

interface PurchaseTrendChartProps {
  data: TrendDataPoint[];
}

export function PurchaseTrendChart({ data }: PurchaseTrendChartProps) {
  const hasData = data.some((d) => d.purchaseAmount > 0);

  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              Procurement Spend Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Daily Goods Received Note (GRN) factory order intake expenditure
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {!hasData ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg bg-muted/20">
            <BarChart2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <div className="text-xs font-semibold text-foreground">No purchase records available</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Factory GRN intake consignments will reflect here dynamically.
            </div>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => `AFN ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2.5 shadow-md text-xs">
                          <div className="font-semibold text-foreground">{label}</div>
                          <div className="text-blue-600 font-bold mt-1">
                            Purchases: {formatCurrency(payload[0].value as number)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="purchaseAmount"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Procurement Spend"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
