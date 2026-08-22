import * as React from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreditLimitGaugeProps {
  creditLimit: number;
  currentDue: number;
  maxDueDays: number;
  oldestOverdueDays?: number;
  className?: string;
  compact?: boolean;
}

export function CreditLimitGauge({
  creditLimit,
  currentDue,
  maxDueDays,
  oldestOverdueDays = 0,
  className,
  compact = false,
}: CreditLimitGaugeProps) {
  const utilization = creditLimit > 0 ? (currentDue / creditLimit) * 100 : 0;
  const clampedUtilization = Math.min(100, Math.max(0, utilization));
  const availableCredit = Math.max(0, creditLimit - currentDue);
  const isOverCredit = currentDue > creditLimit;
  const isOverdue = oldestOverdueDays > maxDueDays;

  // Determine status variant
  let status: "healthy" | "warning" | "danger" = "healthy";
  if (isOverCredit || isOverdue) {
    status = "danger";
  } else if (utilization > 80 || oldestOverdueDays > maxDueDays * 0.75) {
    status = "warning";
  }

  if (compact) {
    return (
      <div className={cn("space-y-1 text-xs", className)}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium">{formatCurrency(currentDue)}</span>
          <span className="text-muted-foreground">/ {formatCurrency(creditLimit)}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              status === "healthy" && "bg-emerald-500",
              status === "warning" && "bg-amber-500",
              status === "danger" && "bg-rose-500"
            )}
            style={{ width: `${clampedUtilization}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4 space-y-3 bg-card", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {status === "healthy" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          {status === "warning" && (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          )}
          {status === "danger" && (
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Credit Health
          </span>
        </div>
        <Badge
          variant={
            status === "healthy"
              ? "success"
              : status === "warning"
              ? "warning"
              : "destructive"
          }
          className="text-[10px]"
        >
          {status === "healthy"
            ? "Good Standing"
            : status === "warning"
            ? "Near Limit"
            : isOverdue
            ? "Overdue Hold"
            : "Credit Breach"}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Utilization</span>
          <span className="font-bold">{utilization.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              status === "healthy" && "bg-emerald-500",
              status === "warning" && "bg-amber-500",
              status === "danger" && "bg-rose-500"
            )}
            style={{ width: `${clampedUtilization}%` }}
          />
        </div>
      </div>

      {/* Key Numbers */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
        <div>
          <div className="text-muted-foreground text-[11px]">Current Dues</div>
          <div className="font-semibold text-foreground">
            {formatCurrency(currentDue)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-[11px]">Available Credit</div>
          <div
            className={cn(
              "font-semibold",
              availableCredit > 0 ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {formatCurrency(availableCredit)}
          </div>
        </div>
      </div>
    </div>
  );
}
