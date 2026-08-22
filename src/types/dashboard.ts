export type DateRangePreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_30_days"
  | "custom";

export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

export interface DashboardKpiData {
  todaySales: number;
  todayPurchases: number;
  todayGrossProfit: number;
  todayNetProfit: number;
  totalInventoryValue: number;
  customerOutstandingDues: number;
  supplierOutstandingDues: number;
  totalActiveMedicines: number;
  lowStockMedicinesCount: number;
  outOfStockMedicinesCount: number;
  expiredBatchesCount: number;
  nearExpiryBatchesCount: number;
}

export interface SalesSummaryData {
  todaySales: number;
  thisWeekSales: number;
  thisMonthSales: number;
  todayInvoicesCount: number;
}

export interface PurchaseSummaryData {
  todayPurchases: number;
  thisMonthPurchases: number;
  purchaseTransactionsCount: number;
  outstandingSupplierAmount: number;
}

export interface ProfitSummaryData {
  grossRevenue: number;
  tradeDiscounts: number;
  netRevenue: number;
  cogsTotal: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  netProfit: number;
  netMarginPercent: number;
}

export interface InventorySummaryData {
  totalActiveMedicines: number;
  totalAvailableStockUnits: number;
  inventoryPurchaseValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiredBatchesCount: number;
  nearExpiryBatchesCount: number;
}

export interface TrendDataPoint {
  date: string;
  salesAmount: number;
  purchaseAmount: number;
}

export interface TopSellingMedicine {
  id: string;
  name: string;
  genericName: string;
  dosageForm: string;
  quantitySold: number;
  salesAmount: number;
  currentStock: number;
}

export interface RecentSaleRecord {
  id: string;
  saleNumber: string;
  customerName: string;
  date: string;
  total: number;
  paid: number;
  due: number;
  status: string;
}

export interface RecentPurchaseRecord {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  date: string;
  total: number;
  paid: number;
  due: number;
  status: string;
}

export interface DueCustomerItem {
  id: string;
  name: string;
  due: number;
  creditLimit: number;
  status: string;
}

export interface DueSupplierItem {
  id: string;
  name: string;
  due: number;
  phone: string;
}

export interface DueSummaryData {
  customerDues: {
    totalOutstanding: number;
    customersWithBalanceCount: number;
    topCustomers: DueCustomerItem[];
  };
  supplierDues: {
    totalOutstanding: number;
    suppliersWithBalanceCount: number;
    topSuppliers: DueSupplierItem[];
  };
}

export interface DashboardAlert {
  id: string;
  type:
    | "EXPIRED"
    | "NEAR_EXPIRY"
    | "LOW_STOCK"
    | "OUT_OF_STOCK"
    | "HIGH_CUSTOMER_DUE"
    | "SUPPLIER_DUE";
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  link?: string;
}

export interface FullDashboardData {
  period: DateRangePreset;
  startDate: string;
  endDate: string;
  kpis: DashboardKpiData;
  salesSummary: SalesSummaryData;
  purchaseSummary: PurchaseSummaryData;
  profitSummary: ProfitSummaryData;
  inventorySummary: InventorySummaryData;
  salesTrend: TrendDataPoint[];
  purchaseTrend: TrendDataPoint[];
  topSellingMedicines: TopSellingMedicine[];
  recentSales: RecentSaleRecord[];
  recentPurchases: RecentPurchaseRecord[];
  dueSummary: DueSummaryData;
  alerts: DashboardAlert[];
}
