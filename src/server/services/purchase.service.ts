import { prisma } from "@/lib/prisma";
import {
  PurchaseRecord,
  PurchaseDetailRecord,
  PurchaseItemDetailRecord,
  SupplierPaymentRecord,
} from "@/types/models";
import { PurchaseOrderInput } from "@/validations/purchase.schema";
import { MOCK_PURCHASES } from "../actions/mock-data";

export interface PurchaseQueryParams {
  search?: string;
  supplierId?: string;
  paymentStatus?: "ALL" | "UNPAID" | "PARTIALLY_PAID" | "PAID";
  status?: "ALL" | "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
  sortBy?: "purchaseDate" | "grandTotal" | "purchaseNumber" | "paidAmount" | "dueAmount";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PurchaseQueryResult {
  purchases: PurchaseRecord[];
  totalCount: number;
  totalGrandTotal: number;
  totalPaidAmount: number;
  totalDueAmount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get purchases with server-side filtering, searching, sorting, and pagination
 */
export async function getPurchases(params: PurchaseQueryParams = {}): Promise<PurchaseQueryResult> {
  const {
    search = "",
    supplierId,
    paymentStatus = "ALL",
    status = "ALL",
    startDate,
    endDate,
    sortBy = "purchaseDate",
    sortOrder = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  try {
    const whereClause: any = {};

    if (search.trim()) {
      whereClause.OR = [
        { purchaseNumber: { contains: search.trim() } },
        { supplierInvoiceNumber: { contains: search.trim() } },
        { supplier: { name: { contains: search.trim() } } },
      ];
    }

    if (supplierId && supplierId !== "ALL") {
      whereClause.supplierId = supplierId;
    }

    if (paymentStatus !== "ALL") {
      whereClause.paymentStatus = paymentStatus;
    }

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.purchaseDate = {};
      if (startDate) whereClause.purchaseDate.gte = new Date(startDate);
      if (endDate) whereClause.purchaseDate.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const orderBy: any = {};
    if (sortBy === "purchaseDate") orderBy.purchaseDate = sortOrder;
    else if (sortBy === "grandTotal") orderBy.grandTotal = sortOrder;
    else if (sortBy === "purchaseNumber") orderBy.purchaseNumber = sortOrder;
    else if (sortBy === "paidAmount") orderBy.paidAmount = sortOrder;
    else if (sortBy === "dueAmount") orderBy.dueAmount = sortOrder;

    const [totalCount, purchases, allAggregates] = await Promise.all([
      prisma.purchase.count({ where: whereClause }),
      prisma.purchase.findMany({
        where: whereClause,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          supplier: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          purchaseItems: { select: { id: true } },
        },
      }),
      prisma.purchase.aggregate({
        where: whereClause,
        _sum: {
          grandTotal: true,
          paidAmount: true,
          dueAmount: true,
        },
      }),
    ]);

    const formatted: PurchaseRecord[] = purchases.map((p) => ({
      id: p.id,
      poNumber: p.purchaseNumber,
      supplierId: p.supplierId,
      supplierName: p.supplier?.name || "Direct Supplier",
      warehouseId: p.warehouseId,
      warehouseName: p.warehouse?.name || "Main Central Warehouse",
      purchaseDate: p.purchaseDate.toISOString().split("T")[0],
      expectedDeliveryDate: p.expectedDeliveryDate ? p.expectedDeliveryDate.toISOString().split("T")[0] : null,
      supplierInvoiceNo: p.supplierInvoiceNumber || undefined,
      subtotalAmount: Number(p.subtotalAmount),
      discountAmount: Number(p.discountAmount),
      taxAmount: Number(p.taxAmount),
      grandTotal: Number(p.grandTotal),
      paidAmount: Number(p.paidAmount),
      dueAmount: Number(p.dueAmount),
      paymentStatus: p.paymentStatus as any,
      status: p.status as any,
      itemsCount: p.purchaseItems.length,
      notes: p.notes,
      cancellationReason: p.cancellationReason,
      cancelledAt: p.cancelledAt ? p.cancelledAt.toISOString() : null,
      createdByName: p.createdBy?.name || "Admin",
      createdAt: p.createdAt.toISOString(),
    }));

    return {
      purchases: formatted,
      totalCount,
      totalGrandTotal: Number(allAggregates._sum.grandTotal || 0),
      totalPaidAmount: Number(allAggregates._sum.paidAmount || 0),
      totalDueAmount: Number(allAggregates._sum.dueAmount || 0),
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  } catch (error) {
    let filtered = [...MOCK_PURCHASES];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.poNumber.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          (p.supplierInvoiceNo && p.supplierInvoiceNo.toLowerCase().includes(q))
      );
    }

    if (supplierId && supplierId !== "ALL") {
      filtered = filtered.filter((p) => p.supplierId === supplierId);
    }

    if (status !== "ALL") {
      filtered = filtered.filter((p) => p.status === status);
    }

    const totalCount = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const formattedMock: PurchaseRecord[] = paginated.map((p) => ({
      id: p.id,
      poNumber: p.poNumber,
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      purchaseDate: p.purchaseDate,
      supplierInvoiceNo: p.supplierInvoiceNo,
      subtotalAmount: p.subtotalAmount,
      discountAmount: p.discountAmount,
      taxAmount: p.taxAmount,
      grandTotal: p.grandTotal,
      paidAmount: p.paidAmount,
      dueAmount: p.dueAmount,
      paymentStatus: p.paymentStatus,
      status: p.status,
      itemsCount: p.itemsCount,
    }));

    return {
      purchases: formattedMock,
      totalCount,
      totalGrandTotal: filtered.reduce((sum, p) => sum + p.grandTotal, 0),
      totalPaidAmount: filtered.reduce((sum, p) => sum + p.paidAmount, 0),
      totalDueAmount: filtered.reduce((sum, p) => sum + p.dueAmount, 0),
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  }
}

/**
 * Get comprehensive purchase details by ID
 */
export async function getPurchaseById(id: string): Promise<PurchaseDetailRecord | null> {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        warehouse: true,
        createdBy: { select: { name: true } },
        purchaseItems: {
          include: {
            medicine: {
              select: {
                id: true,
                brandName: true,
                genericName: true,
                dosageForm: true,
                strength: true,
              },
            },
          },
        },
        supplierPayments: {
          include: {
            createdBy: { select: { name: true } },
          },
        },
      },
    });

    if (!purchase) {
      // Mock fallback
      const mock = MOCK_PURCHASES.find((p) => p.id === id);
      if (!mock) return null;

      return {
        id: mock.id,
        poNumber: mock.poNumber,
        supplierId: mock.supplierId,
        supplierName: mock.supplierName,
        warehouseName: "Main Central Warehouse",
        purchaseDate: mock.purchaseDate,
        supplierInvoiceNo: mock.supplierInvoiceNo,
        subtotalAmount: mock.totalAmount,
        discountAmount: 0,
        taxAmount: 0,
        grandTotal: mock.totalAmount,
        paidAmount: mock.paidAmount,
        dueAmount: mock.dueAmount,
        paymentStatus: mock.dueAmount === 0 ? "PAID" : mock.paidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID",
        status: mock.status,
        itemsCount: mock.itemsCount,
        createdByName: "System Admin",
        items: [
          {
            id: "item-mock-1",
            medicineId: "med-1",
            medicineName: "Napa Extra 500mg/65mg",
            genericName: "Paracetamol + Caffeine",
            dosageForm: "TABLET",
            strength: "500mg+65mg",
            batchNumber: "BX-2026-09",
            expiryDate: "2027-12-31",
            quantity: 500,
            bonusQuantity: 25,
            unitPurchaseCost: 1.85,
            unitTradePrice: 2.20,
            unitMrp: 2.50,
            discountPercent: 0,
            taxPercent: 0,
            subtotal: 925,
            totalAmount: 925,
          },
        ],
        payments: [],
      };
    }

    const itemsFormatted: PurchaseItemDetailRecord[] = purchase.purchaseItems.map((item) => ({
      id: item.id,
      medicineId: item.medicineId,
      medicineName: item.medicine?.brandName || "Unknown Medicine",
      genericName: item.medicine?.genericName || "",
      dosageForm: item.medicine?.dosageForm || "",
      strength: item.medicine?.strength || "",
      batchNumber: item.batchNumber,
      mfgDate: item.mfgDate ? item.mfgDate.toISOString().split("T")[0] : null,
      expiryDate: item.expiryDate.toISOString().split("T")[0],
      quantity: item.quantity,
      bonusQuantity: item.bonusQuantity,
      unitPurchaseCost: Number(item.unitPurchaseCost),
      unitTradePrice: Number(item.unitTradePrice),
      unitMrp: Number(item.unitMrp),
      discountPercent: Number(item.discountPercent),
      taxPercent: Number(item.taxPercent),
      subtotal: Number(item.subtotal),
      totalAmount: Number(item.totalAmount),
      createdBatchId: item.createdBatchId,
    }));

    const paymentsFormatted: SupplierPaymentRecord[] = purchase.supplierPayments.map((pay) => ({
      id: pay.id,
      voucherNumber: pay.voucherNumber,
      supplierId: pay.supplierId,
      supplierName: purchase.supplier.name,
      purchaseId: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      amount: Number(pay.amount),
      paymentDate: pay.paymentDate.toISOString().split("T")[0],
      paymentMethod: pay.paymentMethod as string,
      referenceNumber: pay.referenceNumber,
      bankName: pay.bankName,
      chequeNumber: pay.chequeNumber,
      chequeDate: pay.chequeDate ? pay.chequeDate.toISOString().split("T")[0] : null,
      notes: pay.notes,
      status: pay.status as any,
      createdByName: pay.createdBy?.name || "Accounts Officer",
      createdAt: pay.createdAt.toISOString(),
    }));

    return {
      id: purchase.id,
      poNumber: purchase.purchaseNumber,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplier.name,
      warehouseId: purchase.warehouseId,
      warehouseName: purchase.warehouse?.name || "Central Distribution Hub",
      purchaseDate: purchase.purchaseDate.toISOString().split("T")[0],
      expectedDeliveryDate: purchase.expectedDeliveryDate ? purchase.expectedDeliveryDate.toISOString().split("T")[0] : null,
      supplierInvoiceNo: purchase.supplierInvoiceNumber || undefined,
      subtotalAmount: Number(purchase.subtotalAmount),
      discountAmount: Number(purchase.discountAmount),
      taxAmount: Number(purchase.taxAmount),
      grandTotal: Number(purchase.grandTotal),
      paidAmount: Number(purchase.paidAmount),
      dueAmount: Number(purchase.dueAmount),
      paymentStatus: purchase.paymentStatus as any,
      status: purchase.status as any,
      itemsCount: purchase.purchaseItems.length,
      notes: purchase.notes,
      cancellationReason: purchase.cancellationReason,
      cancelledAt: purchase.cancelledAt ? purchase.cancelledAt.toISOString() : null,
      createdByName: purchase.createdBy?.name || "Admin",
      createdAt: purchase.createdAt.toISOString(),
      supplierPhone: purchase.supplier.phone,
      supplierEmail: purchase.supplier.email || undefined,
      supplierAddress: purchase.supplier.address || undefined,
      items: itemsFormatted,
      payments: paymentsFormatted,
    };
  } catch (error) {
    const mock = MOCK_PURCHASES.find((p) => p.id === id);
    if (!mock) return null;
    return {
      id: mock.id,
      poNumber: mock.poNumber,
      supplierId: mock.supplierId,
      supplierName: mock.supplierName,
      purchaseDate: mock.purchaseDate,
      subtotalAmount: mock.totalAmount,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: mock.totalAmount,
      paidAmount: mock.paidAmount,
      dueAmount: mock.dueAmount,
      paymentStatus: "UNPAID",
      status: mock.status,
      itemsCount: mock.itemsCount,
      items: [],
      payments: [],
    };
  }
}

/**
 * Atomically creates a purchase, generates purchase items, creates or increments batch stock,
 * logs StockMovement (PURCHASE_IN), updates supplier payables, and logs payment vouchers if upfront payment was made.
 */
export async function createAndConfirmPurchase(data: PurchaseOrderInput, userId?: string) {
  if (!data.items || data.items.length === 0) {
    throw new Error("Cannot create a purchase consignment without items.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Verify supplier
    const supplier = await tx.supplier.findUnique({
      where: { id: data.supplierId },
    });
    if (!supplier) {
      throw new Error(`Supplier with ID ${data.supplierId} not found.`);
    }

    // 2. Resolve warehouse & user
    const defaultWarehouse = data.warehouseId
      ? await tx.warehouse.findUnique({ where: { id: data.warehouseId } })
      : await tx.warehouse.findFirst({ where: { isDefault: true } }) || await tx.warehouse.findFirst();

    if (!defaultWarehouse) {
      throw new Error("No warehouse location found in the system for stock allocation.");
    }

    const defaultUser = userId
      ? await tx.user.findUnique({ where: { id: userId } })
      : await tx.user.findFirst();

    // 3. Server-side recalculation of line items and totals
    let calculatedSubtotal = 0;
    let calculatedDiscount = 0;
    let calculatedTax = 0;

    const validatedItems = [];

    for (const item of data.items) {
      const medicine = await tx.medicine.findUnique({
        where: { id: item.medicineId },
      });
      if (!medicine) {
        throw new Error(`Medicine with ID ${item.medicineId} not found.`);
      }

      if (item.quantity <= 0) {
        throw new Error(`Quantity for ${medicine.brandName} must be at least 1.`);
      }
      if (item.unitCostPrice <= 0) {
        throw new Error(`Unit cost price for ${medicine.brandName} must be greater than 0.`);
      }

      const lineSubtotal = item.quantity * item.unitCostPrice;
      const lineDiscount = lineSubtotal * ((item.discountPercent || 0) / 100);
      const taxable = lineSubtotal - lineDiscount;
      const lineTax = taxable * ((item.taxPercent || 0) / 100);
      const lineTotal = taxable + lineTax;

      calculatedSubtotal += lineSubtotal;
      calculatedDiscount += lineDiscount;
      calculatedTax += lineTax;

      validatedItems.push({
        ...item,
        medicineName: medicine.brandName,
        lineSubtotal,
        lineDiscount,
        lineTax,
        lineTotal,
      });
    }

    const grandTotal = calculatedSubtotal - calculatedDiscount + calculatedTax;
    const paidAmount = Math.max(0, data.paidAmount || 0);

    if (paidAmount > grandTotal) {
      throw new Error(`Upfront payment (৳${paidAmount.toLocaleString()}) cannot exceed the grand total (৳${grandTotal.toLocaleString()}).`);
    }

    const dueAmount = grandTotal - paidAmount;
    const paymentStatus =
      paidAmount >= grandTotal ? "PAID" : paidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID";

    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 4. Create Purchase Record
    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber: poNumber,
        supplierId: data.supplierId,
        warehouseId: defaultWarehouse.id,
        createdById: defaultUser?.id || "",
        supplierInvoiceNumber: data.supplierInvoiceNo?.trim() || null,
        purchaseDate: new Date(data.purchaseDate),
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
        subtotalAmount: calculatedSubtotal,
        discountAmount: calculatedDiscount,
        taxAmount: calculatedTax,
        shippingCharges: 0,
        grandTotal,
        paidAmount,
        dueAmount,
        paymentStatus,
        status: "RECEIVED",
        notes: data.notes?.trim() || null,
      },
    });

    // 5. Process each item: Batch management & StockMovement
    for (const vItem of validatedItems) {
      const totalIntakeQty = vItem.quantity + (vItem.bonusQuantity || 0);
      const expDate = new Date(vItem.expiryDate);
      const mfgDate = vItem.manufacturingDate ? new Date(vItem.manufacturingDate) : null;

      // Find or create MedicineBatch
      const batch = await tx.medicineBatch.findFirst({
        where: {
          medicineId: vItem.medicineId,
          warehouseId: defaultWarehouse.id,
          batchNumber: vItem.batchNumber.trim(),
        },
      });

      let batchId: string;
      let quantityBefore = 0;

      if (batch) {
        quantityBefore = batch.quantityOnHand;
        const updatedBatch = await tx.medicineBatch.update({
          where: { id: batch.id },
          data: {
            quantityOnHand: { increment: totalIntakeQty },
            quantityAvailable: { increment: totalIntakeQty },
            purchaseCostPrice: vItem.unitCostPrice,
            tradePrice: vItem.unitTradePrice,
            mrp: vItem.unitMrp,
            status: batch.status === "EXHAUSTED" ? "ACTIVE" : batch.status,
          },
        });
        batchId = updatedBatch.id;
      } else {
        const newBatch = await tx.medicineBatch.create({
          data: {
            medicineId: vItem.medicineId,
            warehouseId: defaultWarehouse.id,
            rackId: vItem.rackId || null,
            supplierId: data.supplierId,
            batchNumber: vItem.batchNumber.trim(),
            mfgDate,
            expiryDate: expDate,
            purchaseCostPrice: vItem.unitCostPrice,
            tradePrice: vItem.unitTradePrice,
            mrp: vItem.unitMrp,
            quantityOnHand: totalIntakeQty,
            quantityAvailable: totalIntakeQty,
            quantityReserved: 0,
            status: "ACTIVE",
          },
        });
        batchId = newBatch.id;
      }

      // Create PurchaseItem
      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          medicineId: vItem.medicineId,
          batchNumber: vItem.batchNumber.trim(),
          expiryDate: expDate,
          mfgDate,
          quantity: vItem.quantity,
          bonusQuantity: vItem.bonusQuantity || 0,
          unitPurchaseCost: vItem.unitCostPrice,
          unitTradePrice: vItem.unitTradePrice,
          unitMrp: vItem.unitMrp,
          discountPercent: vItem.discountPercent || 0,
          taxPercent: vItem.taxPercent || 0,
          subtotal: vItem.lineSubtotal,
          totalAmount: vItem.lineTotal,
          createdBatchId: batchId,
        },
      });

      // Record immutable StockMovement ledger entry
      await tx.stockMovement.create({
        data: {
          medicineId: vItem.medicineId,
          batchId,
          warehouseId: defaultWarehouse.id,
          movementType: "PURCHASE_IN",
          quantityDelta: totalIntakeQty,
          quantityBefore,
          quantityAfter: quantityBefore + totalIntakeQty,
          unitCostPrice: vItem.unitCostPrice,
          referenceNumber: poNumber,
          notes: `Consignment intake #${poNumber} (Supplier: ${supplier.name})`,
          createdById: defaultUser?.id || null,
        },
      });
    }

    // 6. Update Supplier Financial Totals
    await tx.supplier.update({
      where: { id: data.supplierId },
      data: {
        totalPurchased: { increment: grandTotal },
        currentDue: { increment: dueAmount },
        totalPaid: { increment: paidAmount },
      },
    });

    // 7. Record payment voucher if upfront payment was made
    if (paidAmount > 0) {
      const voucherNumber = `PV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      await tx.supplierPayment.create({
        data: {
          voucherNumber,
          supplierId: data.supplierId,
          purchaseId: purchase.id,
          createdById: defaultUser?.id || "",
          amount: paidAmount,
          paymentDate: new Date(data.purchaseDate),
          paymentMethod: (data.paymentMethod as any) || "BANK_TRANSFER",
          referenceNumber: data.paymentReference || `Advance on ${poNumber}`,
          notes: `Upfront payment for PO #${poNumber}`,
          status: "CONFIRMED",
        },
      });
    }

    // 8. Audit Log
    await tx.auditLog.create({
      data: {
        userId: defaultUser?.id || null,
        action: "PURCHASE_CONFIRMED",
        entityName: "Purchase",
        entityId: purchase.id,
        newValues: JSON.stringify({
          poNumber,
          supplierName: supplier.name,
          grandTotal,
          paidAmount,
          itemsCount: validatedItems.length,
        }),
      },
    });

    return purchase;
  });
}

/**
 * Safely cancel a confirmed purchase:
 * - Checks that stock has not already been consumed/sold
 * - Reverses batch inventory atomically
 * - Logs PURCHASE_CANCEL_RETURN stock movements
 * - Reverses supplier totalPurchased, currentDue, totalPaid
 * - Marks purchase as CANCELLED
 */
export async function cancelPurchase(purchaseId: string, reason: string, userId?: string) {
  if (!reason || reason.trim().length < 3) {
    throw new Error("A valid cancellation reason is required.");
  }

  return await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        purchaseItems: {
          include: { medicine: true },
        },
        supplier: true,
        supplierPayments: true,
      },
    });

    if (!purchase) {
      throw new Error("Purchase order not found.");
    }

    if (purchase.status === "CANCELLED") {
      throw new Error(`Purchase #${purchase.purchaseNumber} has already been cancelled.`);
    }

    // 1. Validate inventory availability before reversing
    for (const item of purchase.purchaseItems) {
      const totalIntakeQty = item.quantity + item.bonusQuantity;
      const batch = await tx.medicineBatch.findFirst({
        where: {
          medicineId: item.medicineId,
          batchNumber: item.batchNumber,
          warehouseId: purchase.warehouseId || undefined,
        },
      });

      if (!batch) {
        throw new Error(
          `Cannot cancel purchase #${purchase.purchaseNumber}: Batch record for ${item.medicine.brandName} (#${item.batchNumber}) was not found.`
        );
      }

      if (batch.quantityOnHand < totalIntakeQty) {
        throw new Error(
          `Cannot cancel purchase #${purchase.purchaseNumber}: Stock for ${item.medicine.brandName} (Batch #${item.batchNumber}) has already been dispensed or sold. (Available: ${batch.quantityOnHand}, Required to reverse: ${totalIntakeQty}).`
        );
      }
    }

    // 2. Perform Stock Reversal
    for (const item of purchase.purchaseItems) {
      const totalIntakeQty = item.quantity + item.bonusQuantity;
      const batch = await tx.medicineBatch.findFirst({
        where: {
          medicineId: item.medicineId,
          batchNumber: item.batchNumber,
          warehouseId: purchase.warehouseId || undefined,
        },
      });

      if (batch) {
        const qtyBefore = batch.quantityOnHand;
        const qtyAfter = qtyBefore - totalIntakeQty;

        await tx.medicineBatch.update({
          where: { id: batch.id },
          data: {
            quantityOnHand: qtyAfter,
            quantityAvailable: Math.max(0, batch.quantityAvailable - totalIntakeQty),
            status: qtyAfter === 0 ? "EXHAUSTED" : batch.status,
          },
        });

        // Immutable Stock Movement reversal ledger
        await tx.stockMovement.create({
          data: {
            medicineId: item.medicineId,
            batchId: batch.id,
            warehouseId: purchase.warehouseId,
            movementType: "PURCHASE_CANCEL_RETURN",
            quantityDelta: -totalIntakeQty,
            quantityBefore: qtyBefore,
            quantityAfter: qtyAfter,
            unitCostPrice: item.unitPurchaseCost,
            referenceNumber: `REV-${purchase.purchaseNumber}`,
            reason: reason.trim(),
            notes: `Purchase cancellation reversal for PO #${purchase.purchaseNumber}`,
            createdById: userId || null,
          },
        });
      }
    }

    // 3. Revert Supplier Financial Balances
    const grandTotal = Number(purchase.grandTotal);
    const dueAmount = Number(purchase.dueAmount);
    const paidAmount = Number(purchase.paidAmount);

    await tx.supplier.update({
      where: { id: purchase.supplierId },
      data: {
        totalPurchased: { decrement: grandTotal },
        currentDue: { decrement: dueAmount },
        totalPaid: { decrement: paidAmount },
      },
    });

    // 4. Void linked supplier payment vouchers if any
    if (purchase.supplierPayments.length > 0) {
      await tx.supplierPayment.updateMany({
        where: { purchaseId: purchase.id },
        data: {
          status: "VOIDED",
          notes: `Voided due to cancellation of PO #${purchase.purchaseNumber}`,
        },
      });
    }

    // 5. Update purchase status
    const cancelledPurchase = await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        status: "CANCELLED",
        cancellationReason: reason.trim(),
        cancelledAt: new Date(),
        cancelledById: userId || null,
      },
    });

    // 6. Create Audit Log
    await tx.auditLog.create({
      data: {
        userId: userId || null,
        action: "PURCHASE_CANCELLED",
        entityName: "Purchase",
        entityId: purchaseId,
        newValues: JSON.stringify({
          purchaseNumber: purchase.purchaseNumber,
          supplierName: purchase.supplier.name,
          reversedAmount: grandTotal,
          cancellationReason: reason.trim(),
        }),
      },
    });

    return cancelledPurchase;
  });
}
