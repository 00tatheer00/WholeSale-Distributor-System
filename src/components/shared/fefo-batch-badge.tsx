import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";

interface FefoBatchBadgeProps {
  expiryDate: string | Date;
  quantityOnHand?: number;
  batchNumber: string;
  className?: string;
  showDays?: boolean;
}

export function FefoBatchBadge({
  expiryDate,
  quantityOnHand,
  batchNumber,
  className,
  showDays = true,
}: FefoBatchBadgeProps) {
  const exp = new Date(expiryDate);
  const now = new Date();
  const diffTime = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "outline";
  let label = `Batch: ${batchNumber}`;
  let icon = <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
  let urgencyClass = "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";

  if (diffDays <= 0) {
    variant = "destructive";
    icon = <XCircle className="h-3 w-3" />;
    label = showDays ? `EXPIRED (${Math.abs(diffDays)}d ago)` : "EXPIRED";
    urgencyClass = "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
  } else if (diffDays <= 30) {
    variant = "destructive";
    icon = <AlertTriangle className="h-3 w-3" />;
    label = showDays ? `Critical: ${diffDays}d left` : "Near Expiry";
    urgencyClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800";
  } else if (diffDays <= 90) {
    variant = "warning";
    icon = <Clock className="h-3 w-3 text-amber-600" />;
    label = showDays ? `Near Expiry: ${diffDays}d left` : "Near Expiry";
    urgencyClass = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
  } else {
    variant = "outline";
    icon = <CheckCircle2 className="h-3 w-3 text-emerald-600" />;
    label = showDays ? `${diffDays}d shelf-life` : "Active";
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <Badge
        variant={variant}
        className={cn("gap-1 font-mono text-[11px] font-medium border", urgencyClass)}
      >
        {icon}
        <span>{batchNumber}</span>
        <span className="opacity-60">•</span>
        <span>{label}</span>
        {quantityOnHand !== undefined && (
          <>
            <span className="opacity-60">•</span>
            <span className="font-semibold">{quantityOnHand} units</span>
          </>
        )}
      </Badge>
    </div>
  );
}
