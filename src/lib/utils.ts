import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names safely with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric currency amount with standardized Afghani (Afs. / AFN) representation.
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "AFN",
  locale: string = "en-US"
): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  return `Afs. ${num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Standard date formatting helper for enterprise tables and forms.
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  if (!date) return "-";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", options).format(d);
}

/**
 * Enterprise date + time formatting helper for invoices, challans, orders, and receipts.
 * Example output: "23 Sep 2026, 08:10 PM"
 */
export function formatDateTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }
): string {
  if (!date) return "-";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", options).format(d);
}
