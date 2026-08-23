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
        title: "Sales & Invoicing",
        href: "/sales",
        iconName: "ShoppingCart",
        description: "Wholesale orders, billing & deliveries",
      },
    ],
  },
  {
    title: "Management & Reports",
    items: [
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
        title: "Financial Reports",
        href: "/reports",
        iconName: "BarChart3",
        description: "Profit & loss, sales analysis & tax summaries",
      },
      {
        title: "System Settings",
        href: "/settings",
        iconName: "Settings",
        description: "Enterprise profile, users & security settings",
      },
    ],
  },
];
