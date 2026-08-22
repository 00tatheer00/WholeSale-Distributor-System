"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, Clock, CreditCard, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardAlert } from "@/types/dashboard";

interface AlertsCardProps {
  alerts: DashboardAlert[];
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  const getAlertIcon = (type: DashboardAlert["type"]) => {
    switch (type) {
      case "EXPIRED":
      case "OUT_OF_STOCK":
        return <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />;
      case "NEAR_EXPIRY":
        return <Clock className="h-4 w-4 text-amber-600 shrink-0" />;
      case "HIGH_CUSTOMER_DUE":
        return <CreditCard className="h-4 w-4 text-rose-600 shrink-0" />;
      case "LOW_STOCK":
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />;
    }
  };

  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Actionable Business Alerts
            </CardTitle>
            <CardDescription className="text-xs">
              Automated triggers for FEFO prioritization, credit holds, and reorder thresholds
            </CardDescription>
          </div>
          <Badge variant={alerts.length > 0 ? "warning" : "success"} className="text-xs">
            {alerts.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mb-2" />
            <div className="font-semibold text-foreground">No operational alerts</div>
            <div className="text-[11px] mt-0.5">All batch expiration, stock, and credit barriers are within normal thresholds.</div>
          </div>
        ) : (
          <div className="divide-y text-xs">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {alert.title}
                      <Badge
                        variant={alert.severity === "critical" ? "destructive" : "warning"}
                        className="text-[9px] px-1 py-0 h-4"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">
                      {alert.description}
                    </div>
                  </div>
                </div>

                {alert.link && (
                  <Link
                    href={alert.link}
                    className="shrink-0 text-primary hover:underline text-xs flex items-center gap-0.5 font-medium mt-0.5"
                  >
                    Action <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
