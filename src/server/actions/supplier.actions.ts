"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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
import { RecordStatus } from "@prisma/client";
import { SupplierDetailRecord } from "@/types/models";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  canDeactivate?: boolean;
}

export async function getSuppliersAction(
  params: SupplierQueryParams = {}
): Promise<ActionResult<SupplierQueryResult>> {
  try {
    const result = await getSuppliers(params);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("getSuppliersAction error:", error);
    return { success: false, error: "Failed to retrieve suppliers." };
  }
}

export async function getSuppliersListAction(): Promise<ActionResult<any[]>> {
  try {
    const result = await getSuppliers({ pageSize: 100 });
    return { success: true, data: result.suppliers };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch suppliers list." };
  }
}

export async function getSupplierByIdAction(
  id: string
): Promise<ActionResult<SupplierDetailRecord | null>> {
  try {
    if (!id) {
      return { success: false, error: "Invalid supplier ID" };
    }
    const supplier = await getSupplierById(id);
    if (!supplier) {
      return { success: false, error: "Supplier not found." };
    }
    return { success: true, data: supplier };
  } catch (error: any) {
    console.error("getSupplierByIdAction error:", error);
    return { success: false, error: "Failed to retrieve supplier details." };
  }
}

export async function createSupplierAction(
  data: SupplierInput
): Promise<ActionResult> {
  try {
    const parsed = supplierSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid supplier data",
      };
    }

    const supplier = await createSupplier(parsed.data);

    revalidatePath("/suppliers");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: supplier,
      message: `Supplier "${supplier.name}" added successfully.`,
    };
  } catch (error: any) {
    console.error("createSupplierAction error:", error);
    return { success: false, error: error.message || "Failed to add supplier." };
  }
}

export async function updateSupplierAction(
  id: string,
  data: Partial<SupplierInput>
): Promise<ActionResult> {
  try {
    if (!id) {
      return { success: false, error: "Missing supplier ID" };
    }

    const updated = await updateSupplier(id, data);

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: updated,
      message: `Supplier "${updated.name}" updated successfully.`,
    };
  } catch (error: any) {
    console.error("updateSupplierAction error:", error);
    return { success: false, error: error.message || "Failed to update supplier details." };
  }
}

export async function toggleSupplierStatusAction(
  id: string,
  newStatus: "ACTIVE" | "INACTIVE"
): Promise<ActionResult> {
  try {
    if (!id) {
      return { success: false, error: "Missing supplier ID" };
    }

    const updated = await toggleSupplierStatus(id, newStatus);

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${id}`);

    return {
      success: true,
      data: updated,
      message: `Supplier status changed to ${newStatus.toLowerCase()}.`,
    };
  } catch (error: any) {
    console.error("toggleSupplierStatusAction error:", error);
    return { success: false, error: error.message || "Failed to update supplier status." };
  }
}

export async function recordSupplierPaymentAction(
  data: SupplierPaymentInput
): Promise<ActionResult> {
  try {
    const parsed = supplierPaymentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid payment data",
      };
    }

    const payment = await recordSupplierPayment(parsed.data);

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${data.supplierId}`);
    revalidatePath("/purchases");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: payment,
      message: `Payment of Rs. ${data.amount.toLocaleString()} recorded successfully.`,
    };
  } catch (error: any) {
    console.error("recordSupplierPaymentAction error:", error);
    return { success: false, error: error.message || "Failed to record payment." };
  }
}

export async function deleteSupplierAction(id: string): Promise<ActionResult> {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchases: true,
            supplierPayments: true,
            batches: true,
            medicines: true,
          },
        },
      },
    });

    if (!supplier) {
      return { success: false, error: "Supplier not found." };
    }

    const currentBal = Number(supplier.currentDue);
    if (Math.abs(currentBal) > 0.01) {
      return {
        success: false,
        canDeactivate: true,
        error: `Cannot delete supplier "${supplier.name}" because they have an active outstanding AP balance of Rs. ${Math.abs(currentBal).toLocaleString()}. Clear outstanding payables before deleting, or deactivate this vendor instead.`,
      };
    }

    const { purchases, supplierPayments, batches, medicines } = supplier._count;
    if (purchases > 0 || supplierPayments > 0 || batches > 0 || medicines > 0) {
      const details = [
        purchases > 0 ? `${purchases} purchase intake(s)` : null,
        supplierPayments > 0 ? `${supplierPayments} payment voucher(s)` : null,
        batches > 0 ? `${batches} stock batch(es)` : null,
        medicines > 0 ? `${medicines} assigned medicine(s)` : null,
      ].filter(Boolean).join(", ");

      return {
        success: false,
        canDeactivate: true,
        error: `Cannot permanently delete supplier "${supplier.name}" because historical procurement and AP records exist (${details}). Deactivating this vendor will prevent new purchase orders while preserving double-entry accounting records.`,
      };
    }

    await prisma.supplier.delete({
      where: { id },
    });

    revalidatePath("/suppliers");
    revalidatePath("/purchases");

    return {
      success: true,
      message: `Supplier "${supplier.name}" removed successfully.`,
    };
  } catch (error: any) {
    console.error("deleteSupplierAction error:", error);
    return {
      success: false,
      canDeactivate: true,
      error: error.message || "Failed to delete supplier.",
    };
  }
}

export async function deactivateSupplierAction(id: string): Promise<ActionResult> {
  try {
    const updated = await prisma.supplier.update({
      where: { id },
      data: { status: RecordStatus.INACTIVE },
      select: { name: true },
    });

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${id}`);
    revalidatePath("/purchases");

    return {
      success: true,
      message: `Supplier "${updated.name}" deactivated. They are now disabled for new purchases.`,
    };
  } catch (error: any) {
    console.error("deactivateSupplierAction error:", error);
    return {
      success: false,
      error: error.message || "Failed to deactivate supplier.",
    };
  }
}
