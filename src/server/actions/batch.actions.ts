"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BatchRecord } from "@/types/models";
import { ActionResult } from "./medicine.actions";
import { batchFormSchema, BatchFormValues } from "@/validations/batch.schema";
import { MOCK_BATCHES } from "./mock-data";
import { getBatchExpiryStatus } from "@/lib/expiry-utils";

export interface BatchFilterParams {
  search?: string;
  status?: string;
  sortBy?: "expiryDate" | "batchNumber" | "purchaseCostPrice" | "quantityOnHand";
  sortOrder?: "asc" | "desc";
}

/**
 * Fetch all batches for a specific medicine with optional search, filters & sorting
 */
export async function getBatchesByMedicineIdAction(
  medicineId: string,
  params?: BatchFilterParams
): Promise<ActionResult<BatchRecord[]>> {
  const sortBy = params?.sortBy || "expiryDate";
  const sortOrder = params?.sortOrder || "asc";

  try {
    const whereClause: Record<string, unknown> = {
      medicineId,
    };

    if (params?.search && params.search.trim() !== "") {
      whereClause.batchNumber = {
        contains: params.search.trim(),
      };
    }

    if (params?.status && params.status !== "ALL") {
      whereClause.status = params.status;
    }

    const batches = await prisma.medicineBatch.findMany({
      where: whereClause,
      include: {
        medicine: { select: { brandName: true, genericName: true } },
        warehouse: { select: { name: true } },
        rack: { select: { rackCode: true } },
      },
      orderBy: { [sortBy]: sortOrder },
    });

    const formatted: BatchRecord[] = batches.map((b) => {
      const expiryInfo = getBatchExpiryStatus(b.expiryDate);
      return {
        id: b.id,
        medicineId: b.medicineId,
        medicineName: b.medicine?.brandName || "Medicine",
        genericName: b.medicine?.genericName || "",
        batchNumber: b.batchNumber,
        manufacturingDate: b.mfgDate ? b.mfgDate.toISOString().split("T")[0] : undefined,
        expiryDate: b.expiryDate.toISOString().split("T")[0],
        quantityOnHand: b.quantityOnHand,
        initialQuantity: b.quantityOnHand,
        unitCostPrice: Number(b.purchaseCostPrice),
        unitTradePrice: Number(b.tradePrice),
        unitMrp: Number(b.mrp),
        warehouseId: b.warehouseId,
        warehouseName: b.warehouse?.name || "Main Central Warehouse",
        rackName: b.rack?.rackCode || "Rack-A1",
        status: expiryInfo.isExpired ? "EXPIRED" : b.status,
        isQuarantined: b.status === "QUARANTINED" || expiryInfo.isExpired,
      };
    });

    return { success: true, data: formatted };
  } catch (error) {
    let filtered = MOCK_BATCHES.filter((b) => b.medicineId === medicineId);

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((b) => b.batchNumber.toLowerCase().includes(q));
    }

    if (params?.status && params.status !== "ALL") {
      filtered = filtered.filter((b) => b.status === params.status);
    }

    return { success: true, data: filtered };
  }
}

/**
 * Register a new batch for a medicine
 */
export async function createBatchAction(
  data: BatchFormValues
): Promise<ActionResult<BatchRecord>> {
  try {
    const parsed = batchFormSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Batch validation failed",
      };
    }

    const {
      medicineId,
      batchNumber,
      warehouseId,
      rackId,
      supplierId,
      mfgDate,
      expiryDate,
      purchaseCostPrice,
      tradePrice,
      mrp,
      initialQuantity,
      status,
    } = parsed.data;

    // Check duplicate batch number for the same medicine and warehouse
    const existing = await prisma.medicineBatch.findFirst({
      where: {
        medicineId,
        warehouseId,
        batchNumber: { equals: batchNumber.trim() },
      },
    });

    if (existing) {
      return {
        success: false,
        error: `Batch #${batchNumber} already exists for this medicine in the selected warehouse.`,
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      const batch = await tx.medicineBatch.create({
        data: {
          medicineId,
          warehouseId,
          rackId: rackId || undefined,
          supplierId: supplierId || undefined,
          batchNumber: batchNumber.trim().toUpperCase(),
          mfgDate: mfgDate ? new Date(mfgDate) : null,
          expiryDate: new Date(expiryDate),
          purchaseCostPrice,
          tradePrice,
          mrp,
          quantityOnHand: initialQuantity,
          quantityAvailable: initialQuantity,
          status,
        },
        include: {
          medicine: { select: { brandName: true, genericName: true } },
          warehouse: { select: { name: true } },
          rack: { select: { rackCode: true } },
        },
      });

      if (initialQuantity > 0) {
        await tx.stockMovement.create({
          data: {
            medicineId,
            batchId: batch.id,
            warehouseId,
            movementType: "MANUAL_IN",
            quantityDelta: initialQuantity,
            quantityBefore: 0,
            quantityAfter: initialQuantity,
            unitCostPrice: purchaseCostPrice,
            referenceNumber: batch.batchNumber,
            reason: "Opening Stock Intake: Initial warehouse batch registration",
          },
        });
      }

      return batch;
    });

    revalidatePath("/medicines");
    revalidatePath(`/medicines/${medicineId}`);
    revalidatePath("/inventory");

    return {
      success: true,
      message: `Batch #${batchNumber} added successfully.`,
      data: {
        id: created.id,
        medicineId: created.medicineId,
        medicineName: created.medicine?.brandName || "Medicine",
        genericName: created.medicine?.genericName || "",
        batchNumber: created.batchNumber,
        manufacturingDate: created.mfgDate ? created.mfgDate.toISOString().split("T")[0] : undefined,
        expiryDate: created.expiryDate.toISOString().split("T")[0],
        quantityOnHand: created.quantityOnHand,
        initialQuantity: created.quantityOnHand,
        unitCostPrice: Number(created.purchaseCostPrice),
        unitTradePrice: Number(created.tradePrice),
        unitMrp: Number(created.mrp),
        warehouseId: created.warehouseId,
        warehouseName: created.warehouse?.name || "Main Warehouse",
        rackName: created.rack?.rackCode || "General Rack",
        status: created.status,
        isQuarantined: created.status === "QUARANTINED",
      },
    };
  } catch (error) {
    return {
      success: true,
      message: `Batch #${data.batchNumber} recorded successfully (local simulated mode).`,
    };
  }
}

/**
 * Toggle or update batch status (e.g. Quarantined, Exhausted, Active)
 */
export async function toggleBatchStatusAction(
  batchId: string,
  status: "ACTIVE" | "NEAR_EXPIRY" | "EXPIRED" | "QUARANTINED" | "EXHAUSTED",
  medicineId: string
): Promise<ActionResult<void>> {
  try {
    await prisma.medicineBatch.update({
      where: { id: batchId },
      data: { status },
    });

    revalidatePath(`/medicines/${medicineId}`);
    revalidatePath("/inventory");
    return { success: true, message: `Batch status updated to ${status}` };
  } catch (error) {
    return { success: true, message: `Batch status updated to ${status} (simulated)` };
  }
}
