"use client";

import * as React from "react";
import Link from "next/link";
import { FileSpreadsheet, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecentSaleRecord } from "@/types/dashboard";

interface RecentSalesTableProps {
  data: RecentSaleRecord[];
}

export function RecentSalesTable({ data }: RecentSalesTableProps) {
  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Recent Wholesale Invoices
            </CardTitle>
            <CardDescription className="text-xs">
              Latest B2B sales dispatches and invoice settlement status
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href="/invoices">
              All Invoices <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No sales recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Customer Pharmacy</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Due</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground">
                      {sale.saleNumber}
                    </td>
                    <td className="p-3 font-medium text-foreground max-w-[180px] truncate">
                      {sale.customerName}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(sale.date)}
                    </td>
                    <td className="p-3 text-right font-bold text-foreground">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="p-3 text-right text-emerald-600 font-medium">
                      {formatCurrency(sale.paid)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      <span className={sale.due > 0 ? "text-amber-600 font-bold" : "text-muted-foreground"}>
                        {formatCurrency(sale.due)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={
                          sale.status === "PAID"
                            ? "success"
                            : sale.status === "PARTIAL"
                            ? "warning"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {sale.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
