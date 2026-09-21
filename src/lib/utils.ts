import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names safely with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric currency amount with standardized Pakistani Rupee (PKR / Rs.) representation.
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "PKR",
  locale: string = "en-PK"
): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  return `Rs. ${num.toLocaleString(locale, {
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
  return new Intl.DateTimeFormat("en-US", options).format(d);
}
