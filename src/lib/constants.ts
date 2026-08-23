import { NavigationSection } from "@/types";

export const APP_NAME = "PharmaDist ERP";
export const APP_DESCRIPTION = "Web-Based Wholesale Medicine Distribution Management System";
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
        description: "Key distribution metrics, sales trends, and alerts",
      },
    ],
  },
  {
    title: "Catalog & Stock",
    items: [
      {
        title: "Medicines",
        href: "/medicines",
        iconName: "Pill",
        description: "Drug master catalog, dosage forms, generics & pricing",
      },
      {
        title: "Categories",
        href: "/categories",
        iconName: "Layers",
        description: "Therapeutic classifications and drug categories",
      },
      {
        title: "Inventory & FEFO",
        href: "/inventory",
        iconName: "Boxes",
        description: "Batch tracking, rack locations, expiry alerts & quarantine",
      },
      {
        title: "Stock Adjustments",
        href: "/inventory/adjustments",
        iconName: "SlidersHorizontal",
        description: "Physical count reconciliation, damage & expiry write-offs",
      },
      {
        title: "Movement Ledger",
        href: "/inventory/movements",
        iconName: "History",
        description: "Immutable stock audit trail and transaction log",
      },
    ],
  },
  {
    title: "Procurement & Vendors",
    items: [
      {
        title: "Suppliers",
        href: "/suppliers",
        iconName: "Truck",
        description: "Medicine manufacturers, vendors & purchase accounts",
      },
      {
        title: "Purchases & GRN",
        href: "/purchases",
        iconName: "ReceiptText",
        description: "Purchase orders, goods received notes & batch intake",
      },
    ],
  },
  {
    title: "Sales & Distribution",
    items: [
      {
        title: "Customer Pharmacies",
        href: "/customers",
        iconName: "Store",
        description: "Licensed pharmacies, clinics, credit limits & aging",
      },
      {
        title: "Sales Orders",
        href: "/sales",
        iconName: "ShoppingCart",
        description: "Field order booking, FEFO allocation & picking slips",
      },
      {
        title: "Wholesale Invoices",
        href: "/invoices",
        iconName: "FileSpreadsheet",
        description: "Tax billing, delivery challans, discounts & VAT",
      },
      {
        title: "Distributors & Salesmen",
        href: "/distributors",
        iconName: "Users2",
        description: "Territories, routes/beats, delivery & commissions",
      },
    ],
  },
  {
    title: "Finance & Accounts",
    items: [
      {
        title: "Payments & Dues",
        href: "/payments",
        iconName: "CreditCard",
        description: "AR/AP vouchers, cheque clearance & FIFO due settlement",
      },
      {
        title: "Operating Expenses",
        href: "/expenses",
        iconName: "Wallet",
        description: "Direct/indirect expenses, petty cash & cost centers",
      },
    ],
  },
  {
    title: "Analytics & System",
    items: [
      {
        title: "Reports & P&L",
        href: "/reports",
        iconName: "BarChart3",
        description: "COGS analysis, profit & loss, stock valuation & tax",
      },
      {
        title: "Settings & Audit",
        href: "/settings",
        iconName: "Settings",
        description: "Company config, users, roles & immutable audit logs",
      },
    ],
  },
];
