import { NavigationSection } from "@/types";

export const APP_NAME = "PharmaDist ERP";
export const APP_DESCRIPTION = "Wholesale Medicine Distribution Management System";
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
        title: "Suppliers (+ Add Company)",
        href: "/suppliers",
        iconName: "Truck",
        description: "Wholesale vendors, factories & balance",
      },
      {
        title: "Customers (+ Add Pharmacy)",
        href: "/customers",
        iconName: "Store",
        description: "Medical stores, pharmacies & balance",
      },
      {
        title: "Sales Reps (Order Bookers)",
        href: "/distributors",
        iconName: "Users2",
        description: "Sales representatives & assigned beats",
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        title: "Warehouses (+ Add Godown)",
        href: "/warehouses",
        iconName: "Warehouse",
        description: "Storage facilities & godown locations",
      },
      {
        title: "Stock & Batches (Inventory)",
        href: "/inventory",
        iconName: "Boxes",
        description: "Available medicine stock & expiry dates",
      },
      {
        title: "Stock Correction (+ / -)",
        href: "/inventory/adjustments",
        iconName: "SlidersHorizontal",
        description: "Fix quantity or write-off expired stock",
      },
      {
        title: "Stock History (In / Out)",
        href: "/inventory/movements",
        iconName: "History",
        description: "Audit trail of every stock entry & sale",
      },
      {
        title: "Stock Transfers",
        href: "/inventory/transfers",
        iconName: "ArrowLeftRight",
        description: "Transfer stock between warehouses",
      },
    ],
  },
  {
    title: "Procurement (Stock In)",
    items: [
      {
        title: "Factory Purchase (+ Add Stock)",
        href: "/purchases/new",
        iconName: "PackagePlus",
        description: "Enter new medicine stock from factory",
      },
      {
        title: "Purchase Consignments",
        href: "/purchases",
        iconName: "ReceiptText",
        description: "Purchase bills & factory receiving history",
      },
    ],
  },
  {
    title: "Wholesale Sales",
    items: [
      {
        title: "New Sale Invoice (+ Create Bill)",
        href: "/sales/new",
        iconName: "ShoppingCart",
        description: "Sell medicines & print instant invoice",
      },
      {
        title: "Sales Orders",
        href: "/sales",
        iconName: "FileSpreadsheet",
        description: "Confirmed sales orders & delivery status",
      },
      {
        title: "Invoices & Challans",
        href: "/invoices",
        iconName: "FileSpreadsheet",
        description: "DRAP tax invoices & delivery challans",
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
        description: "Customer cash recovery & money receipts",
      },
      {
        title: "Daily Expenses (+ Add Kharcha)",
        href: "/expenses",
        iconName: "Wallet",
        description: "Record rent, bills, fuel, salaries & tea",
      },
      {
        title: "Profit & Financials",
        href: "/profit",
        iconName: "TrendingUp",
        description: "Net profit margins & gross profit reports",
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
