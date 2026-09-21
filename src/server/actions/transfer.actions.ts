"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { stockTransferSchema, StockTransferInput } from "@/validations/transfer.schema";
import {
  executeStockTransfer,
  getStockTransfersList,
  getTransferEligibleBatches,
} from "@/server/services/transfer.service";
import { recordAuditLog } from "@/server/services/audit.service";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getStockTransfersAction(params?: {
  warehouseId?: string;
  medicineId?: string;
}): Promise<ActionResult<any[]>> {
  try {
    const transfers = await getStockTransfersList(params);
    return { success: true, data: transfers };
  } catch (error: any) {
    console.error("getStockTransfersAction error:", error);
    return { success: false, error: error.message || "Failed to load stock transfers" };
  }
}

export async function getTransferEligibleBatchesAction(
  warehouseId: string
): Promise<ActionResult<any[]>> {
  try {
    if (!warehouseId) {
      return { success: true, data: [] };
    }
    const batches = await getTransferEligibleBatches(warehouseId);
    return { success: true, data: batches };
  } catch (error: any) {
    console.error("getTransferEligibleBatchesAction error:", error);
    return { success: false, error: error.message || "Failed to load batches" };
  }
}

export async function createStockTransferAction(
  input: StockTransferInput
): Promise<ActionResult<any>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const validated = stockTransferSchema.parse(input);

    const userId = user.profile?.id || user.authUser.id;
    const result = await executeStockTransfer(validated, userId);

    await recordAuditLog({
      userId,
      action: "STOCK_TRANSFER_CREATED",
      entityName: "StockTransfer",
      entityId: result.id,
      newValues: {
        transferNumber: result.transferNumber,
        sourceWarehouse: result.sourceWarehouseName,
        destWarehouse: result.destWarehouseName,
        quantity: result.quantity,
        batchNumber: result.batchNumber,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/inventory/transfers");
    revalidatePath("/warehouses");

    return {
      success: true,
      data: result,
      message: `Stock transfer ${result.transferNumber} completed successfully. ${result.quantity} units transferred.`,
    };
  } catch (error: any) {
    console.error("createStockTransferAction error:", error);
    return {
      success: false,
      error: error.message || "Failed to execute stock transfer",
    };
  }
}
