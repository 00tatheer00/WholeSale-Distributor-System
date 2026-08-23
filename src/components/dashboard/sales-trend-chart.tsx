"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendDataPoint } from "@/types/dashboard";

interface SalesTrendChartProps {
  data: TrendDataPoint[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const hasData = data.some((d) => d.salesAmount > 0);

  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Wholesale Revenue Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Daily net invoiced sales across pharmacy client routes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {!hasData ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg bg-muted/20">
            <BarChart2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <div className="text-xs font-semibold text-foreground">No sales recorded yet</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Sales transactions within the selected period will appear here automatically.
            </div>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                          <div className="text-emerald-600 font-bold mt-1">
                            Sales: {formatCurrency(payload[0].value as number)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="salesAmount"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                  name="Wholesale Sales"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
