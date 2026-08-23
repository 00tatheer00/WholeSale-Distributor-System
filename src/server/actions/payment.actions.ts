"use server";

import { revalidatePath } from "next/cache";
import { customerPaymentSchema, CustomerPaymentInput } from "@/validations/payment.schema";
import {
  getPayments,
  getPaymentById,
  recordCustomerPayment,
  PaymentQueryParams,
  PaymentQueryResult,
  PaymentDetailRecord,
} from "@/server/services/payment.service";
import { PaymentRecord } from "@/types/models";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getPaymentsAction(
  params?: PaymentQueryParams
): Promise<ActionResult<PaymentQueryResult>> {
  try {
    const result = await getPayments(params);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("getPaymentsAction error:", error);
    return { success: false, error: "Failed to fetch customer payment records." };
  }
}

export async function getPaymentByIdAction(
  id: string
): Promise<ActionResult<PaymentDetailRecord>> {
  try {
    if (!id) return { success: false, error: "Missing payment ID" };
    const payment = await getPaymentById(id);
    if (!payment) return { success: false, error: "Payment receipt not found." };
    return { success: true, data: payment };
  } catch (error: any) {
    console.error("getPaymentByIdAction error:", error);
    return { success: false, error: "Failed to fetch payment receipt details." };
  }
}

export async function recordCustomerPaymentAction(
  data: CustomerPaymentInput
): Promise<ActionResult<{ paymentId: string; receiptNumber: string }>> {
  try {
    const parsed = customerPaymentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid payment data" };
    }

    const result = await recordCustomerPayment(parsed.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/payments");
    revalidatePath("/customers");
    revalidatePath("/invoices");
    revalidatePath("/sales");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return {
      success: true,
      data: result.data,
      message: `Money Receipt ${result.data?.receiptNumber} recorded and allocated successfully.`,
    };
  } catch (error: any) {
    console.error("recordCustomerPaymentAction error:", error);
    return { success: false, error: "Failed to record customer payment receipt." };
  }
}
