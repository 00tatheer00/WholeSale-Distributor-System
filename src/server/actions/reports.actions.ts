"use server";

import {
  getReportsHubSummary,
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getExpiryReport,
  getLowStockReport,
  getCustomerDueReport,
  getSupplierDueReport,
  getMedicinePerformanceReport,
  getPaymentReport,
  ReportFilterParams,
} from "@/server/services/report.service";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getReportsHubSummaryAction() {
  try {
    const data = await getReportsHubSummary();
    return { success: true, data };
  } catch (error: any) {
    console.error("getReportsHubSummaryAction error:", error);
    return { success: false, error: "Failed to generate reports overview." };
  }
}

export async function getSalesReportAction(params?: ReportFilterParams) {
  try {
    const data = await getSalesReport(params);
    return { success: true, data };
  } catch (error: any) {
    console.error("getSalesReportAction error:", error);
    return { success: false, error: "Failed to load sales report." };
  }
}

export async function getPurchaseReportAction(params?: ReportFilterParams) {
  try {
    const data = await getPurchaseReport(params);
    return { success: true, data };
  } catch (error: any) {
    console.error("getPurchaseReportAction error:", error);
    return { success: false, error: "Failed to load purchase report." };
  }
}

export async function getInventoryReportAction(params?: ReportFilterParams) {
  try {
    const data = await getInventoryReport(params);
    return { success: true, data };
  } catch (error: any) {
    console.error("getInventoryReportAction error:", error);
    return { success: false, error: "Failed to load inventory valuation report." };
  }
}

export async function getExpiryReportAction(warningDays?: number) {
  try {
    const data = await getExpiryReport(warningDays);
    return { success: true, data };
  } catch (error: any) {
    console.error("getExpiryReportAction error:", error);
    return { success: false, error: "Failed to load expiry report." };
  }
}

export async function getLowStockReportAction() {
  try {
    const data = await getLowStockReport();
    return { success: true, data };
  } catch (error: any) {
    console.error("getLowStockReportAction error:", error);
    return { success: false, error: "Failed to load low stock report." };
  }
}

export async function getCustomerDueReportAction() {
  try {
    const data = await getCustomerDueReport();
    return { success: true, data };
  } catch (error: any) {
    console.error("getCustomerDueReportAction error:", error);
    return { success: false, error: "Failed to load customer dues report." };
  }
}

export async function getSupplierDueReportAction() {
  try {
    const data = await getSupplierDueReport();
    return { success: true, data };
  } catch (error: any) {
    console.error("getSupplierDueReportAction error:", error);
    return { success: false, error: "Failed to load supplier dues report." };
  }
}

export async function getMedicinePerformanceReportAction(params?: ReportFilterParams) {
  try {
    const data = await getMedicinePerformanceReport(params);
    return { success: true, data };
  } catch (error: any) {
    console.error("getMedicinePerformanceReportAction error:", error);
    return { success: false, error: "Failed to load medicine performance report." };
  }
}

export async function getPaymentReportAction(params?: ReportFilterParams) {
  try {
    const data = await getPaymentReport(params);
    return { success: true, data };
  } catch (error: any) {
    console.error("getPaymentReportAction error:", error);
    return { success: false, error: "Failed to load payment reconciliation report." };
  }
}
