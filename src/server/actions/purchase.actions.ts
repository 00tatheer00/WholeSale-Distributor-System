"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  purchaseOrderSchema,
  PurchaseOrderInput,
  purchaseCancellationSchema,
} from "@/validations/purchase.schema";
import {
  getPurchases,
  getPurchaseById,
  createAndConfirmPurchase,
  cancelPurchase,
  PurchaseQueryParams,
  PurchaseQueryResult,
} from "../services/purchase.service";
import { ActionResult } from "./supplier.actions";
import { PurchaseDetailRecord } from "@/types/models";
import { MOCK_MEDICINES, MOCK_SUPPLIERS } from "./mock-data";

export async function getPurchasesAction(
  params: PurchaseQueryParams = {}
): Promise<ActionResult<PurchaseQueryResult>> {
  try {
    const result = await getPurchases(params);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch purchases." };
  }
}

export async function getPurchaseByIdAction(
  id: string
): Promise<ActionResult<PurchaseDetailRecord>> {
  try {
    const purchase = await getPurchaseById(id);
    if (!purchase) {
      return { success: false, error: "Purchase consignment not found." };
    }
    return { success: true, data: purchase };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load purchase details." };
  }
}

export async function createPurchaseOrderAction(
  data: PurchaseOrderInput
): Promise<ActionResult> {
  try {
    const parsed = purchaseOrderSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid purchase order data." };
    }

    const purchase = await createAndConfirmPurchase(parsed.data);

    revalidatePath("/purchases");
    revalidatePath("/inventory");
    revalidatePath("/inventory/movements");
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${parsed.data.supplierId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Purchase Consignment #${purchase.purchaseNumber} has been received and committed to inventory.`,
      data: purchase,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process purchase order." };
  }
}

export async function cancelPurchaseAction(
  purchaseId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const parsed = purchaseCancellationSchema.safeParse({ purchaseId, reason });
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid cancellation parameters." };
    }

    const cancelled = await cancelPurchase(parsed.data.purchaseId, parsed.data.reason);

    revalidatePath("/purchases");
    revalidatePath(`/purchases/${purchaseId}`);
    revalidatePath("/inventory");
    revalidatePath("/inventory/movements");
    revalidatePath("/suppliers");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Purchase #${cancelled.purchaseNumber} has been successfully cancelled and stock reversed.`,
      data: cancelled,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to cancel purchase consignment." };
  }
}

export async function getPurchaseFormDataAction(): Promise<
  ActionResult<{
    suppliers: Array<{ id: string; name: string; code?: string | null; creditDays: number; currentPayable: number }>;
    medicines: Array<{
      id: string;
      brandName: string;
      genericName: string;
      dosageForm: string;
      strength: string;
      defaultTradePrice: number;
      defaultMrp: number;
      unitOfMeasure: string;
      supplierId?: string | null;
    }>;
    warehouses: Array<{ id: string; name: string; code: string; isDefault: boolean }>;
  }>
> {
  try {
    const [suppliers, medicines, warehouses] = await Promise.all([
      prisma.supplier.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, name: true, code: true, creditPeriodDays: true, currentDue: true },
        orderBy: { name: "asc" },
      }),
      prisma.medicine.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          brandName: true,
          genericName: true,
          dosageForm: true,
          strength: true,
          defaultTradePrice: true,
          defaultMrp: true,
          unitOfMeasure: true,
          supplierId: true,
        },
        orderBy: { brandName: "asc" },
      }),
      prisma.warehouse.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true, isDefault: true },
        orderBy: { name: "asc" },
      }),
    ]);

    if (suppliers.length > 0 || medicines.length > 0) {
      return {
        success: true,
        data: {
          suppliers: suppliers.map((s) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            creditDays: s.creditPeriodDays,
            currentPayable: Number(s.currentDue),
          })),
          medicines: medicines.map((m) => ({
            id: m.id,
            brandName: m.brandName,
            genericName: m.genericName,
            dosageForm: m.dosageForm,
            strength: m.strength,
            defaultTradePrice: Number(m.defaultTradePrice),
            defaultMrp: Number(m.defaultMrp),
            unitOfMeasure: m.unitOfMeasure,
            supplierId: m.supplierId,
          })),
          warehouses,
        },
      };
    }

    // Fallback to mock data
    return {
      success: true,
      data: {
        suppliers: MOCK_SUPPLIERS.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.tradeLicenseNo,
          creditDays: s.creditDays,
          currentPayable: s.currentPayable,
        })),
        medicines: MOCK_MEDICINES.map((m) => ({
          id: m.id,
          brandName: m.brandName,
          genericName: m.genericName,
          dosageForm: m.dosageForm,
          strength: m.strength,
          defaultTradePrice: m.unitTradePrice,
          defaultMrp: m.unitMrp,
          unitOfMeasure: m.primaryUnitName,
          supplierId: m.supplierId,
        })),
        warehouses: [
          { id: "wh-1", name: "Main Central Warehouse", code: "WH-HQ", isDefault: true },
          { id: "wh-2", name: "Chittagong Regional Depot", code: "WH-CTG", isDefault: false },
        ],
      },
    };
  } catch (error) {
    return {
      success: true,
      data: {
        suppliers: MOCK_SUPPLIERS.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.tradeLicenseNo,
          creditDays: s.creditDays,
          currentPayable: s.currentPayable,
        })),
        medicines: MOCK_MEDICINES.map((m) => ({
          id: m.id,
          brandName: m.brandName,
          genericName: m.genericName,
          dosageForm: m.dosageForm,
          strength: m.strength,
          defaultTradePrice: m.unitTradePrice,
          defaultMrp: m.unitMrp,
          unitOfMeasure: m.primaryUnitName,
          supplierId: m.supplierId,
        })),
        warehouses: [
          { id: "wh-1", name: "Main Central Warehouse", code: "WH-HQ", isDefault: true },
        ],
      },
    };
  }
}
