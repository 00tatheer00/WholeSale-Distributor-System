/**
 * Wholesale Medicine Distribution Management System (WMDMS)
 * Core Type Definitions - Phase 1 Foundation
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "SALES_MANAGER"
  | "SALESMAN"
  | "WAREHOUSE_MANAGER"
  | "INVENTORY_OFFICER"
  | "ACCOUNTS_OFFICER"
  | "CASHIER";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  companyId?: string;
  avatarUrl?: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  iconName: string;
  description?: string;
  badge?: string;
  allowedRoles?: UserRole[];
  children?: {
    title: string;
    href: string;
    description?: string;
  }[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
  isCurrent?: boolean;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
