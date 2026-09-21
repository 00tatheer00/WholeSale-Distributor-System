import { prisma } from "@/lib/prisma";
import { StockTransferInput } from "@/validations/transfer.schema";

export interface StockTransferResult {
  id: string;
  transferNumber: string;
  quantity: number;
  sourceWarehouseName: string;
  destWarehouseName: string;
  medicineName: string;
  batchNumber: string;
  createdAt: Date;
}

export async function executeStockTransfer(
  input: StockTransferInput,
  userId: string
): Promise<StockTransferResult> {
  if (input.sourceWarehouseId === input.destWarehouseId) {
    throw new Error("Source and destination warehouses cannot be the same.");
  }

  if (input.quantity <= 0) {
    throw new Error("Transfer quantity must be greater than zero.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch and validate source batch
    const sourceBatch = await tx.medicineBatch.findUnique({
      where: { id: input.batchId },
      include: {
        medicine: true,
        warehouse: true,
      },
    });

    if (!sourceBatch) {
      throw new Error("Source batch not found.");
    }

    if (sourceBatch.warehouseId !== input.sourceWarehouseId) {
      throw new Error("Selected batch does not belong to the source warehouse.");
    }

    if (sourceBatch.medicineId !== input.medicineId) {
      throw new Error("Selected batch does not match the chosen medicine.");
    }

    if (sourceBatch.status === "QUARANTINED") {
      throw new Error(`Batch ${sourceBatch.batchNumber} is quarantined and cannot be transferred.`);
    }

    if (sourceBatch.quantityAvailable < input.quantity) {
      throw new Error(
        `Insufficient available quantity in batch ${sourceBatch.batchNumber}. Available: ${sourceBatch.quantityAvailable}, Requested: ${input.quantity}`
      );
    }

    // 2. Fetch destination warehouse
    const destWarehouse = await tx.warehouse.findUnique({
      where: { id: input.destWarehouseId },
    });

    if (!destWarehouse) {
      throw new Error("Destination warehouse not found.");
    }

    if (!destWarehouse.isActive) {
      throw new Error("Destination warehouse is inactive.");
    }

    // 3. Generate sequential transfer number (ST-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const count = await tx.stockTransfer.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    });
    const transferNumber = `ST-${year}-${String(count + 1).padStart(5, "0")}`;

    // 4. Update or create batch in destination warehouse
    const existingDestBatch = await tx.medicineBatch.findUnique({
      where: {
        medicineId_warehouseId_batchNumber: {
          medicineId: sourceBatch.medicineId,
          warehouseId: input.destWarehouseId,
          batchNumber: sourceBatch.batchNumber,
        },
      },
    });

    let destBatchId: string;

    if (existingDestBatch) {
      destBatchId = existingDestBatch.id;
      await tx.medicineBatch.update({
        where: { id: existingDestBatch.id },
        data: {
          quantityOnHand: existingDestBatch.quantityOnHand + input.quantity,
          quantityAvailable: existingDestBatch.quantityAvailable + input.quantity,
          status: existingDestBatch.status === "EXHAUSTED" ? "ACTIVE" : existingDestBatch.status,
          location: input.destinationLocation || existingDestBatch.location,
        },
      });
    } else {
      const newDestBatch = await tx.medicineBatch.create({
        data: {
          medicineId: sourceBatch.medicineId,
          warehouseId: input.destWarehouseId,
          batchNumber: sourceBatch.batchNumber,
          expiryDate: sourceBatch.expiryDate,
          purchaseCostPrice: sourceBatch.purchaseCostPrice,
          mrp: sourceBatch.mrp,
          tradePrice: sourceBatch.tradePrice,
          quantityOnHand: input.quantity,
          quantityReserved: 0,
          quantityAvailable: input.quantity,
          location: input.destinationLocation || null,
          status: "ACTIVE",
        },
      });
      destBatchId = newDestBatch.id;
    }

    // 5. Decrement source batch
    const sourceQtyBefore = sourceBatch.quantityOnHand;
    const sourceQtyAfter = sourceQtyBefore - input.quantity;
    const sourceAvailAfter = Math.max(0, sourceBatch.quantityAvailable - input.quantity);

    await tx.medicineBatch.update({
      where: { id: sourceBatch.id },
      data: {
        quantityOnHand: sourceQtyAfter,
        quantityAvailable: sourceAvailAfter,
        status: sourceQtyAfter === 0 ? "EXHAUSTED" : sourceBatch.status,
      },
    });

    // 6. Record immutable StockTransfer document
    const transfer = await tx.stockTransfer.create({
      data: {
        transferNumber,
        sourceWarehouseId: input.sourceWarehouseId,
        destWarehouseId: input.destWarehouseId,
        medicineId: input.medicineId,
        batchId: sourceBatch.id,
        quantity: input.quantity,
        createdById: userId,
        notes: input.notes || null,
      },
    });

    // 7. Record TRANSFER_OUT on source warehouse
    await tx.stockMovement.create({
      data: {
        medicineId: sourceBatch.medicineId,
        batchId: sourceBatch.id,
        warehouseId: input.sourceWarehouseId,
        movementType: "TRANSFER_OUT" as any,
        quantityDelta: -input.quantity,
        quantityBefore: sourceQtyBefore,
        quantityAfter: sourceQtyAfter,
        unitCostPrice: sourceBatch.purchaseCostPrice,
        referenceNumber: transferNumber,
        reason: `Inter-warehouse transfer to ${destWarehouse.name}`,
        notes: input.notes || null,
        createdById: userId,
      },
    });

    // 8. Record TRANSFER_IN on destination warehouse
    const destQtyBefore = existingDestBatch ? existingDestBatch.quantityOnHand : 0;
    const destQtyAfter = destQtyBefore + input.quantity;

    await tx.stockMovement.create({
      data: {
        medicineId: sourceBatch.medicineId,
        batchId: destBatchId,
        warehouseId: input.destWarehouseId,
        movementType: "TRANSFER_IN" as any,
        quantityDelta: input.quantity,
        quantityBefore: destQtyBefore,
        quantityAfter: destQtyAfter,
        unitCostPrice: sourceBatch.purchaseCostPrice,
        referenceNumber: transferNumber,
        reason: `Inter-warehouse transfer from ${sourceBatch.warehouse.name}`,
        notes: input.notes || null,
        createdById: userId,
      },
    });

    return {
      id: transfer.id,
      transferNumber: transfer.transferNumber,
      quantity: transfer.quantity,
      sourceWarehouseName: sourceBatch.warehouse.name,
      destWarehouseName: destWarehouse.name,
      medicineName: sourceBatch.medicine.brandName,
      batchNumber: sourceBatch.batchNumber,
      createdAt: transfer.createdAt,
    };
  });
}

export async function getStockTransfersList(params?: {
  warehouseId?: string;
  medicineId?: string;
  limit?: number;
}) {
  const where: any = {};
  if (params?.warehouseId) {
    where.OR = [
      { sourceWarehouseId: params.warehouseId },
      { destWarehouseId: params.warehouseId },
    ];
  }
  if (params?.medicineId) {
    where.medicineId = params.medicineId;
  }

  const transfers = await prisma.stockTransfer.findMany({
    where,
    include: {
      sourceWarehouse: { select: { id: true, name: true, code: true } },
      destWarehouse: { select: { id: true, name: true, code: true } },
      medicine: { select: { id: true, brandName: true, genericName: true, skuCode: true } },
      batch: { select: { id: true, batchNumber: true, expiryDate: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: params?.limit || 100,
  });

  return transfers;
}

export async function getTransferEligibleBatches(warehouseId: string) {
  return await prisma.medicineBatch.findMany({
    where: {
      warehouseId,
      quantityAvailable: { gt: 0 },
      status: "ACTIVE",
    },
    include: {
      medicine: {
        select: {
          id: true,
          brandName: true,
          genericName: true,
          strength: true,
          dosageForm: true,
        },
      },
    },
    orderBy: [{ medicine: { brandName: "asc" } }, { expiryDate: "asc" }],
  });
}
