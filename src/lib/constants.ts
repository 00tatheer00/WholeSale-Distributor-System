import { NavigationSection } from "@/types";

export const APP_NAME = "PharmaDist ERP";
export const APP_DESCRIPTION = "Wholesale Medicine Distribution Management System (Pakistan Edition)";
export const APP_VERSION = "1.0.0";

/**
 * Enterprise Navigation Configuration for Wholesale Pharma Operations
 */
export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        iconName: "LayoutDashboard",
        description: "Overview & key distribution KPIs",
      },
    ],
  },
  {
    title: "Master Data",
    items: [
      {
        title: "Medicines",
        href: "/medicines",
        iconName: "Pill",
        description: "Drug catalog, dosage forms, and batch stock",
      },
      {
        title: "Categories",
        href: "/categories",
        iconName: "Layers",
        description: "Therapeutic drug categories & classes",
      },
      {
        title: "Manufacturers",
        href: "/manufacturers",
        iconName: "Factory",
        description: "Pharmaceutical manufacturing companies",
      },
      {
        title: "Suppliers & Vendors",
        href: "/suppliers",
        iconName: "Truck",
        description: "Wholesale vendors, stockists & AP balance",
      },
      {
        title: "Customer Pharmacies",
        href: "/customers",
        iconName: "Store",
        description: "Licensed pharmacies, clinics & credit limits",
      },
      {
        title: "Sales Representatives",
        href: "/distributors",
        iconName: "Users2",
        description: "Medical reps, assigned routes & sales targets",
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        title: "Warehouses",
        href: "/warehouses",
        iconName: "Warehouse",
        description: "Storage facilities & physical locations",
      },
      {
        title: "Stock & Batches",
        href: "/inventory",
        iconName: "Boxes",
        description: "Batch FEFO tracking & stock valuation",
      },
      {
        title: "Stock Adjustments",
        href: "/inventory/adjustments",
        iconName: "SlidersHorizontal",
        description: "Reconciliation vouchers & damage write-offs",
      },
      {
        title: "Stock Movements",
        href: "/inventory/movements",
        iconName: "History",
        description: "Immutable physical stock audit ledger",
      },
      {
        title: "Stock Transfers",
        href: "/inventory/transfers",
        iconName: "ArrowLeftRight",
        description: "Transfer batches between warehouses",
      },
    ],
  },
  {
    title: "Procurement",
    items: [
      {
        title: "Purchases",
        href: "/purchases",
        iconName: "ReceiptText",
        description: "Purchase orders & intake consignments",
      },
      {
        title: "Purchase Intake",
        href: "/purchases/new",
        iconName: "PackagePlus",
        description: "High-speed batch intake & GRN commit",
      },
    ],
  },
  {
    title: "Wholesale Sales",
    items: [
      {
        title: "New Sale Order",
        href: "/sales/new",
        iconName: "ShoppingCart",
        description: "Wholesale order booking & FEFO allocation",
      },
      {
        title: "Sales Orders",
        href: "/sales",
        iconName: "FileSpreadsheet",
        description: "Confirmed orders, delivery & credit status",
      },
      {
        title: "Tax Invoices",
        href: "/invoices",
        iconName: "FileSpreadsheet",
        description: "DRAP-compliant tax invoices & challans",
      },
    ],
  },
  {
    title: "Finance & Accounts",
    items: [
      {
        title: "Collections & Receipts",
        href: "/payments",
        iconName: "CreditCard",
        description: "Customer collections & FIFO settlement",
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
        description: "Historical batch COGS & net profit margins",
      },
    ],
  },
  {
    title: "Reports & Analytics",
    items: [
      {
        title: "Reports Hub",
        href: "/reports",
        iconName: "BarChart3",
        description: "Comprehensive business analytics & export",
      },
      {
        title: "System Alerts",
        href: "/notifications",
        iconName: "Bell",
        description: "FEFO expiry watchdog & inventory depletion",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "System Settings",
        href: "/settings",
        iconName: "Settings",
        description: "Company profile, policies & staff roles",
      },
      {
        title: "Security Audit Logs",
        href: "/audit-logs",
        iconName: "Shield",
        description: "Immutable forensic audit trail",
      },
      {
        title: "Operations Manual",
        href: "/help",
        iconName: "BookOpen",
        description: "Complete user guide & system manual",
      },
    ],
  },
];
