"use client";

import * as React from "react";
import Link from "next/link";
import { CreditCard, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { DueSummaryData } from "@/types/dashboard";

interface DueSummaryCardProps {
  data: DueSummaryData;
}

export function DueSummaryCard({ data }: DueSummaryCardProps) {
  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" />
              Outstanding Dues &amp; Ledger Aging
            </CardTitle>
            <CardDescription className="text-xs">
              Accounts Receivable (AR) from pharmacies &amp; Accounts Payable (AP) to manufacturers
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
            <Link href="/payments">
              Payments <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="customers" className="space-y-3">
          <TabsList className="grid w-full grid-cols-2 h-8 text-xs">
            <TabsTrigger value="customers" className="text-xs">
              Customer Dues ({formatCurrency(data.customerDues.totalOutstanding)})
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs">
              Supplier Payables ({formatCurrency(data.supplierDues.totalOutstanding)})
            </TabsTrigger>
          </TabsList>

          {/* Customer Dues Tab */}
          <TabsContent value="customers" className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-md">
              <span>
                Pharmacies with dues: <strong>{data.customerDues.customersWithBalanceCount}</strong>
              </span>
              <span>
                Total AR: <strong className="text-foreground">{formatCurrency(data.customerDues.totalOutstanding)}</strong>
              </span>
            </div>

            {data.customerDues.topCustomers.length === 0 ? (
              <div className="text-center p-4 text-xs text-muted-foreground">
                No outstanding customer dues.
              </div>
            ) : (
              <div className="divide-y text-xs">
                {data.customerDues.topCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="py-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors px-1"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        {cust.name}
                        {cust.status === "BLOCKED_OVERDUE" && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                            Hold
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Credit Limit: {formatCurrency(cust.creditLimit)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(cust.due)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {Math.round((cust.due / (cust.creditLimit || 1)) * 100)}% Limit
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Supplier Dues Tab */}
          <TabsContent value="suppliers" className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-md">
              <span>
                Suppliers with payables: <strong>{data.supplierDues.suppliersWithBalanceCount}</strong>
              </span>
              <span>
                Total AP: <strong className="text-foreground">{formatCurrency(data.supplierDues.totalOutstanding)}</strong>
              </span>
            </div>

            {data.supplierDues.topSuppliers.length === 0 ? (
              <div className="text-center p-4 text-xs text-muted-foreground">
                No outstanding supplier payables.
              </div>
            ) : (
              <div className="divide-y text-xs">
                {data.supplierDues.topSuppliers.map((sup) => (
                  <div
                    key={sup.id}
                    className="py-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors px-1"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground">{sup.name}</div>
                      <div className="text-[11px] text-muted-foreground">{sup.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(sup.due)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Accounts Payable</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
