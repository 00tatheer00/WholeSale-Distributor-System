"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingCart, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecentPurchaseRecord } from "@/types/dashboard";

interface RecentPurchasesTableProps {
  data: RecentPurchaseRecord[];
}

export function RecentPurchasesTable({ data }: RecentPurchasesTableProps) {
  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              Recent Procurement Orders (GRN)
            </CardTitle>
            <CardDescription className="text-xs">
              Latest factory consignment intakes and supplier accounts
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href="/purchases">
              All Purchases <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No purchase records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Manufacturer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Due</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((po) => (
                  <tr key={po.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground">
                      {po.purchaseNumber}
                    </td>
                    <td className="p-3 font-medium text-foreground max-w-[180px] truncate">
                      {po.supplierName}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(po.date)}
                    </td>
                    <td className="p-3 text-right font-bold text-foreground">
                      {formatCurrency(po.total)}
                    </td>
                    <td className="p-3 text-right text-emerald-600 font-medium">
                      {formatCurrency(po.paid)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      <span className={po.due > 0 ? "text-rose-600 font-bold" : "text-muted-foreground"}>
                        {formatCurrency(po.due)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={
                          po.status === "RECEIVED"
                            ? "success"
                            : po.status === "ORDERED"
                            ? "outline"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {po.status}
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
