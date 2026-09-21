"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { warehouseSchema, WarehouseInput } from "@/validations/warehouse.schema";
import { recordAuditLog } from "@/server/services/audit.service";
import { getCurrentUser } from "@/lib/auth/session";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  canDeactivate?: boolean;
}

export async function getWarehousesAction(): Promise<ActionResult<any[]>> {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: {
            batches: true,
            purchases: true,
            stockMovements: true,
          },
        },
        batches: {
          select: {
            quantityOnHand: true,
            tradePrice: true,
            purchaseCostPrice: true,
          },
        },
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    const formatted = warehouses.map((w) => {
      const totalUnits = w.batches.reduce((sum, b) => sum + b.quantityOnHand, 0);
      const totalCostValue = w.batches.reduce(
        (sum, b) => sum + b.quantityOnHand * Number(b.purchaseCostPrice),
        0
      );
      const totalTradeValue = w.batches.reduce(
        (sum, b) => sum + b.quantityOnHand * Number(b.tradePrice),
        0
      );

      return {
        id: w.id,
        name: w.name,
        code: w.code,
        location: w.location || "Main Premises",
        isDefault: w.isDefault,
        isActive: w.isActive,
        batchesCount: w._count.batches,
        totalUnitsOnHand: totalUnits,
        totalCostValue,
        totalTradeValue,
        hasHistory: w._count.purchases > 0 || w._count.stockMovements > 0 || totalUnits > 0,
        createdAt: w.createdAt.toISOString().split("T")[0],
      };
    });

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error("getWarehousesAction error:", error);
    return { success: false, error: "Failed to retrieve warehouses." };
  }
}

export async function createWarehouseAction(data: WarehouseInput): Promise<ActionResult> {
  try {
    const parsed = warehouseSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: "Apex Pharma Distributors Ltd.", country: "Pakistan", currency: "PKR" },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault) {
        await tx.warehouse.updateMany({
          where: { companyId: company.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.warehouse.create({
        data: {
          companyId: company.id,
          name: parsed.data.name.trim(),
          code: parsed.data.code.trim().toUpperCase(),
          location: parsed.data.location?.trim() || null,
          isDefault: parsed.data.isDefault,
          isActive: parsed.data.isActive,
        },
      });
    });

    const userContext = await getCurrentUser();
    await recordAuditLog({
      action: "CREATE_WAREHOUSE",
      entityName: "Warehouse",
      entityId: result.id,
      newValues: JSON.stringify(result),
      userId: userContext?.authUser.id,
    });

    revalidatePath("/warehouses");
    revalidatePath("/inventory");
    revalidatePath("/purchases/new");
    return {
      success: true,
      message: `Warehouse "${result.name}" created successfully.`,
      data: result,
    };
  } catch (err: any) {
    console.error("createWarehouseAction error:", err);
    return { success: false, error: err.message || "Failed to create warehouse." };
  }
}

export async function updateWarehouseAction(
  id: string,
  data: WarehouseInput
): Promise<ActionResult> {
  try {
    const parsed = warehouseSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Warehouse not found." };
    }

    const result = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault && !existing.isDefault) {
        await tx.warehouse.updateMany({
          where: { companyId: existing.companyId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await tx.warehouse.update({
        where: { id },
        data: {
          name: parsed.data.name.trim(),
          code: parsed.data.code.trim().toUpperCase(),
          location: parsed.data.location?.trim() || null,
          isDefault: parsed.data.isDefault,
          isActive: parsed.data.isActive,
        },
      });
    });

    const userContext = await getCurrentUser();
    await recordAuditLog({
      action: "UPDATE_WAREHOUSE",
      entityName: "Warehouse",
      entityId: result.id,
      oldValues: JSON.stringify(existing),
      newValues: JSON.stringify(result),
      userId: userContext?.authUser.id,
    });

    revalidatePath("/warehouses");
    revalidatePath("/inventory");
    revalidatePath("/purchases/new");
    return {
      success: true,
      message: `Warehouse "${result.name}" updated successfully.`,
      data: result,
    };
  } catch (err: any) {
    console.error("updateWarehouseAction error:", err);
    return { success: false, error: err.message || "Failed to update warehouse." };
  }
}

export async function toggleWarehouseStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const updated = await prisma.warehouse.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/warehouses");
    revalidatePath("/inventory");
    return {
      success: true,
      message: `Warehouse status changed to ${isActive ? "Active" : "Inactive"}.`,
      data: updated,
    };
  } catch (err: any) {
    return { success: false, error: "Failed to update warehouse status." };
  }
}

export async function deleteWarehouseAction(id: string): Promise<ActionResult> {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            batches: true,
            purchases: true,
            stockMovements: true,
          },
        },
        batches: {
          where: { quantityOnHand: { gt: 0 } },
          select: { id: true },
        },
      },
    });

    if (!warehouse) {
      return { success: false, error: "Warehouse not found." };
    }

    if (warehouse.batches.length > 0) {
      return {
        success: false,
        canDeactivate: true,
        error: `Cannot delete warehouse "${warehouse.name}" because it currently holds active stock in ${warehouse.batches.length} batch(es). Transfer remaining stock or Deactivate the warehouse instead.`,
      };
    }

    if (warehouse._count.purchases > 0 || warehouse._count.stockMovements > 0) {
      return {
        success: false,
        canDeactivate: true,
        error: `Cannot permanently delete "${warehouse.name}" because historical purchase/stock ledgers reference it. Use "Deactivate" to archive this storage facility.`,
      };
    }

    await prisma.warehouse.delete({ where: { id } });

    const userContext = await getCurrentUser();
    await recordAuditLog({
      action: "DELETE_WAREHOUSE",
      entityName: "Warehouse",
      entityId: id,
      oldValues: JSON.stringify(warehouse),
      userId: userContext?.authUser.id,
    });

    revalidatePath("/warehouses");
    revalidatePath("/inventory");
    return {
      success: true,
      message: `Warehouse "${warehouse.name}" deleted successfully.`,
    };
  } catch (err: any) {
    return { success: false, error: "Failed to delete warehouse." };
  }
}
