import * as React from "react";
import { Badge } from "@/components/ui/badge";

type StatusType =
  | "ACTIVE"
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "NEAR_EXPIRY"
  | "QUARANTINED"
  | "PAID"
  | "PARTIALLY_PAID"
  | "UNPAID"
  | "OVERDUE";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  const displayLabel = label || normalized.replace(/_/g, " ");

  switch (normalized) {
    case "ACTIVE":
    case "PAID":
    case "COMPLETED":
    case "HEALTHY":
      return (
        <Badge variant="success" className="font-semibold text-[11px]">
          {displayLabel}
        </Badge>
      );

    case "PENDING":
    case "PARTIALLY_PAID":
    case "NEAR_EXPIRY":
      return (
        <Badge variant="warning" className="font-semibold text-[11px]">
          {displayLabel}
        </Badge>
      );

    case "EXPIRED":
    case "CANCELLED":
    case "OVERDUE":
    case "QUARANTINED":
      return (
        <Badge variant="destructive" className="font-semibold text-[11px]">
          {displayLabel}
        </Badge>
      );

    case "UNPAID":
    default:
      return (
        <Badge variant="outline" className="font-semibold text-[11px]">
          {displayLabel}
        </Badge>
      );
  }
}
