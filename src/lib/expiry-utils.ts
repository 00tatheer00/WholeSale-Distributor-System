export type ExpiryStatusType =
  | "ACTIVE"
  | "NEAR_EXPIRY_WARNING"
  | "NEAR_EXPIRY_CRITICAL"
  | "EXPIRED";

export interface ExpiryCalculationResult {
  status: ExpiryStatusType;
  daysRemaining: number;
  label: string;
  badgeVariant: "success" | "warning" | "destructive" | "outline";
  isExpired: boolean;
  isNearExpiry: boolean;
  isCritical: boolean;
}

/**
 * Calculates standardized FEFO expiry metrics for a pharmaceutical batch.
 * @param expiryDate - The batch expiration date
 * @param nearExpiryDays - Warning threshold in days (default: 90)
 * @param criticalExpiryDays - Critical warning threshold in days (default: 30)
 */
export function getBatchExpiryStatus(
  expiryDate: Date | string,
  nearExpiryDays: number = 90,
  criticalExpiryDays: number = 30
): ExpiryCalculationResult {
  const exp = new Date(expiryDate);
  const now = new Date();
  
  // Set to start of day for clean day comparison
  now.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      status: "EXPIRED",
      daysRemaining,
      label: daysRemaining === 0 ? "Expires Today" : `Expired (${Math.abs(daysRemaining)}d ago)`,
      badgeVariant: "destructive",
      isExpired: true,
      isNearExpiry: false,
      isCritical: true,
    };
  }

  if (daysRemaining <= criticalExpiryDays) {
    return {
      status: "NEAR_EXPIRY_CRITICAL",
      daysRemaining,
      label: `${daysRemaining}d left (Critical)`,
      badgeVariant: "destructive",
      isExpired: false,
      isNearExpiry: true,
      isCritical: true,
    };
  }

  if (daysRemaining <= nearExpiryDays) {
    return {
      status: "NEAR_EXPIRY_WARNING",
      daysRemaining,
      label: `${daysRemaining}d left (FEFO Alert)`,
      badgeVariant: "warning",
      isExpired: false,
      isNearExpiry: true,
      isCritical: false,
    };
  }

  return {
    status: "ACTIVE",
    daysRemaining,
    label: `${daysRemaining}d left`,
    badgeVariant: "success",
    isExpired: false,
    isNearExpiry: false,
    isCritical: false,
  };
}
