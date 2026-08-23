import { NavigationSection } from "@/types";

export const APP_NAME = "PharmaDist ERP";
export const APP_DESCRIPTION = "Web-Based Wholesale Medicine Distribution Management System";
export const APP_VERSION = "1.0.0";

/**
 * Enterprise Navigation Configuration for Wholesale Pharma Operations
 */
export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: "Core Operations",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        iconName: "LayoutDashboard",
        description: "Overview & key distribution metrics",
      },
      {
        title: "Medicines & Stock",
        href: "/medicines",
        iconName: "Pill",
        description: "Drug catalog, dosage forms, and batch stock",
      },
      {
        title: "Purchases & Intake",
        href: "/purchases",
        iconName: "ReceiptText",
        description: "Direct purchase intake & batch creation",
      },
      {
        title: "Suppliers & Accounts",
        href: "/suppliers",
        iconName: "Truck",
        description: "Manufacturers, vendors & AP balance ledger",
      },
      {
        title: "Wholesale Sales",
        href: "/sales",
        iconName: "ShoppingCart",
        description: "Wholesale orders, billing & FEFO stock allocation",
      },
      {
        title: "Tax Invoices",
        href: "/invoices",
        iconName: "FileSpreadsheet",
        description: "DGDA-compliant invoices & delivery challans",
      },
      {
        title: "Collections & Receipts",
        href: "/payments",
        iconName: "CreditCard",
        description: "Customer collections & FIFO invoice settlement",
      },
    ],
  },
  {
    title: "Field Force & Financials",
    items: [
      {
        title: "Field Sales Representatives",
        href: "/distributors",
        iconName: "Users2",
        description: "Medical representatives, route beats & targets",
      },
      {
        title: "Operating Expenses",
        href: "/expenses",
        iconName: "Wallet",
        description: "Warehouse, fuel, utilities & expense vouchers",
      },
      {
        title: "Profit & Financials",
        href: "/profit",
        iconName: "TrendingUp",
        description: "Historical batch COGS, gross margins & net profit",
      },
      {
        title: "Customer Pharmacies",
        href: "/customers",
        iconName: "Store",
        description: "Licensed pharmacies, clinics & credit limits",
      },
      {
        title: "Warehouse Inventory",
        href: "/inventory",
        iconName: "Boxes",
        description: "Batch FEFO tracking & stock adjustments",
      },
      {
        title: "Reports & Analytics",
        href: "/reports",
        iconName: "BarChart3",
        description: "Comprehensive business analytics & export center",
      },
      {
        title: "System Alerts",
        href: "/notifications",
        iconName: "Bell",
        description: "FEFO expiry watchdog & inventory depletion alerts",
      },
      {
        title: "System Settings",
        href: "/settings",
        iconName: "Settings",
        description: "Enterprise profile, users & licensing settings",
      },
      {
        title: "Security Audit Logs",
        href: "/audit-logs",
        iconName: "Shield",
        description: "Immutable forensic audit trail of all transactions",
      },
    ],
  },
];
