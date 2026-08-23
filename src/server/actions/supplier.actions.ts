"use server";

import { revalidatePath } from "next/cache";
import { supplierSchema, SupplierInput } from "@/validations/supplier.schema";
import { supplierPaymentSchema, SupplierPaymentInput } from "@/validations/payment.schema";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  toggleSupplierStatus,
  recordSupplierPayment,
  SupplierQueryParams,
  SupplierQueryResult,
} from "../services/supplier.service";
import { SupplierDetailRecord } from "@/types/models";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getSuppliersAction(
  params: SupplierQueryParams = {}
): Promise<ActionResult<SupplierQueryResult>> {
  try {
    const result = await getSuppliers(params);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch suppliers." };
  }
}

export async function getSupplierByIdAction(
  id: string
): Promise<ActionResult<SupplierDetailRecord>> {
  try {
    const supplier = await getSupplierById(id);
    if (!supplier) {
      return { success: false, error: "Supplier not found." };
    }
    return { success: true, data: supplier };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load supplier details." };
  }
}

export async function createSupplierAction(data: SupplierInput): Promise<ActionResult> {
  try {
    const parsed = supplierSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid supplier data." };
    }

    const supplier = await createSupplier(parsed.data);

    revalidatePath("/suppliers");
    revalidatePath("/purchases");
    revalidatePath("/purchases/new");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Supplier "${supplier.name}" has been registered successfully.`,
      data: supplier,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save supplier." };
  }
}

export async function updateSupplierAction(
  id: string,
  data: Partial<SupplierInput>
): Promise<ActionResult> {
  try {
    const updated = await updateSupplier(id, data);

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${id}`);
    revalidatePath("/purchases");

    return {
      success: true,
      message: `Supplier "${updated.name}" updated successfully.`,
      data: updated,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update supplier." };
  }
}

export async function toggleSupplierStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE"
): Promise<ActionResult> {
  try {
    const updated = await toggleSupplierStatus(id, status);

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${id}`);

    return {
      success: true,
      message: `Supplier status changed to ${status}.`,
      data: updated,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update supplier status." };
  }
}

export async function recordSupplierPaymentAction(
  data: SupplierPaymentInput
): Promise<ActionResult> {
  try {
    const parsed = supplierPaymentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid payment data." };
    }

    const payment = await recordSupplierPayment(parsed.data);

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${data.supplierId}`);
    revalidatePath("/purchases");
    revalidatePath("/payments");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Payment Voucher ${payment.voucherNumber} for ৳${payment.amount.toLocaleString()} recorded successfully.`,
      data: payment,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record payment voucher." };
  }
}
