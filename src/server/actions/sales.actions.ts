"use server";

import { revalidatePath } from "next/cache";
import { saleOrderSchema, cancelSaleSchema, SaleOrderInput, CancelSaleInput } from "@/validations/sales.schema";
import {
  getSales,
  getSaleById,
  createSale,
  cancelSale,
  SaleQueryParams,
  SaleQueryResult,
  SaleDetailRecord,
} from "@/server/services/sales.service";
import {
  getInvoices,
  getInvoiceById,
  InvoiceQueryParams,
  InvoiceQueryResult,
  InvoiceDetailRecord,
} from "@/server/services/invoice.service";
import { InvoiceRecord } from "@/types/models";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getSalesAction(
  params?: SaleQueryParams
): Promise<ActionResult<SaleQueryResult>> {
  try {
    const result = await getSales(params);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("getSalesAction error:", error);
    return { success: false, error: "Failed to fetch wholesale sales records." };
  }
}

export async function getSaleByIdAction(
  id: string
): Promise<ActionResult<SaleDetailRecord>> {
  try {
    if (!id) return { success: false, error: "Missing sale ID" };
    const sale = await getSaleById(id);
    if (!sale) return { success: false, error: "Sale order not found." };
    return { success: true, data: sale };
  } catch (error: any) {
    console.error("getSaleByIdAction error:", error);
    return { success: false, error: "Failed to fetch sale details." };
  }
}

export async function createSaleOrderAction(
  data: SaleOrderInput
): Promise<ActionResult<{ saleId: string; invoiceNumber: string }>> {
  try {
    const parsed = saleOrderSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid sale order data" };
    }

    const result = await createSale(parsed.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/sales");
    revalidatePath("/invoices");
    revalidatePath("/inventory");
    revalidatePath("/customers");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return {
      success: true,
      data: result.data,
      message: `Wholesale Order ${result.data?.saleNumber} and Tax Invoice ${result.data?.invoiceNumber} generated successfully.`,
    };
  } catch (error: any) {
    console.error("createSaleOrderAction error:", error);
    return { success: false, error: "Failed to process wholesale sale order." };
  }
}

export async function cancelSaleAction(
  data: CancelSaleInput
): Promise<ActionResult> {
  try {
    const parsed = cancelSaleSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid cancellation data" };
    }

    const result = await cancelSale(parsed.data.saleId, parsed.data.reason);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/sales");
    revalidatePath("/invoices");
    revalidatePath("/inventory");
    revalidatePath("/customers");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Sale cancelled, batch inventory restored, and customer account balance reversed.",
    };
  } catch (error: any) {
    console.error("cancelSaleAction error:", error);
    return { success: false, error: "Failed to cancel sale." };
  }
}

export async function getInvoicesAction(
  params?: InvoiceQueryParams
): Promise<ActionResult<InvoiceQueryResult>> {
  try {
    const result = await getInvoices(params);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("getInvoicesAction error:", error);
    return { success: false, error: "Failed to fetch wholesale tax invoices." };
  }
}

export async function getInvoiceByIdAction(
  id: string
): Promise<ActionResult<InvoiceDetailRecord>> {
  try {
    if (!id) return { success: false, error: "Missing invoice ID" };
    const invoice = await getInvoiceById(id);
    if (!invoice) return { success: false, error: "Tax invoice not found." };
    return { success: true, data: invoice };
  } catch (error: any) {
    console.error("getInvoiceByIdAction error:", error);
    return { success: false, error: "Failed to fetch tax invoice details." };
  }
}
