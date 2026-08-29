import { prisma } from "@/lib/prisma";
import {
  SaleStatus,
  PaymentStatus,
  DeliveryStatus,
  InvoiceStatus,
  StockMovementType,
  PaymentMethod,
} from "@prisma/client";
import { SaleOrderInput } from "@/validations/sales.schema";
import { MOCK_INVOICES } from "../actions/mock-data";

export interface SaleQueryParams {
  search?: string;
  customerId?: string;
  statusFilter?: "ALL" | "CONFIRMED" | "CANCELLED" | "DRAFT";
  paymentStatusFilter?: "ALL" | "PAID" | "PARTIALLY_PAID" | "UNPAID";
  deliveryStatusFilter?: "ALL" | "PENDING" | "DISPATCHED" | "DELIVERED" | "RETURNED";
  startDate?: string;
  endDate?: string;
  sortBy?: "saleDate" | "grandTotal" | "dueAmount" | "customerName";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface SaleSummaryItem {
  id: string;
  saleNumber: string;
  invoiceNumber: string | null;
  challanNumber: string | null;
  customerId: string;
  customerName: string;
  customerCode: string | null;
  customerPhone: string;
  salesmanName: string | null;
  saleDate: string;
  deliveryDate: string | null;
  itemsCount: number;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  deliveryCharge: number;
  grandTotal: number;
  totalCogs: number;
  grossProfit: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
  status: string;
  creditOverrideApproved: boolean;
  notes: string | null;
  createdAt: string;
}

export interface SaleQueryResult {
  sales: SaleSummaryItem[];
  totalCount: number;
  totalRevenue: number;
  totalPaid: number;
  totalDue: number;
  totalGrossProfit: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SaleDetailItem {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  dosageForm: string;
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  bonusQuantity: number;
  unitCostPrice: number;
  unitTradePrice: number;
  unitMrp: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineCogs: number;
  lineTotal: number;
  lineGrossProfit: number;
}

export interface SaleDetailRecord extends SaleSummaryItem {
  items: SaleDetailItem[];
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  cancelledByName?: string | null;
  createdByName?: string | null;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyDrugLicense?: string;
}

/**
 * Fetch wholesale sales with server-side search, filtering, pagination, and calculated metrics
 */
export async function getSales(params: SaleQueryParams = {}): Promise<SaleQueryResult> {
  const {
    search = "",
    customerId,
    statusFilter = "ALL",
    paymentStatusFilter = "ALL",
    deliveryStatusFilter = "ALL",
    startDate,
    endDate,
    sortBy = "saleDate",
    sortOrder = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  try {
    const whereClause: any = {};

    if (search.trim()) {
      whereClause.OR = [
        { saleNumber: { contains: search.trim() } },
        { customer: { pharmacyName: { contains: search.trim() } } },
        { customer: { customerCode: { contains: search.trim() } } },
        { invoice: { invoiceNumber: { contains: search.trim() } } },
      ];
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (statusFilter !== "ALL") {
      whereClause.status = statusFilter as SaleStatus;
    }

    if (paymentStatusFilter !== "ALL") {
      whereClause.paymentStatus = paymentStatusFilter as PaymentStatus;
    }

    if (deliveryStatusFilter !== "ALL") {
      whereClause.deliveryStatus = deliveryStatusFilter as DeliveryStatus;
    }

    if (startDate || endDate) {
      whereClause.saleDate = {};
      if (startDate) {
        whereClause.saleDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.saleDate.lte = end;
      }
    }

    let orderBy: any = { saleDate: sortOrder };
    if (sortBy === "grandTotal") {
      orderBy = { grandTotal: sortOrder };
    } else if (sortBy === "dueAmount") {
      orderBy = { dueAmount: sortOrder };
    } else if (sortBy === "customerName") {
      orderBy = { customer: { pharmacyName: sortOrder } };
    }

    const skip = (Math.max(1, page) - 1) * pageSize;

    const [totalCount, salesData, statsData] = await Promise.all([
      prisma.sale.count({ where: whereClause }),
      prisma.sale.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: pageSize,
        include: {
          customer: true,
          distributor: true,
          invoice: true,
          saleItems: true,
        },
      }),
      prisma.sale.aggregate({
        where: whereClause,
        _sum: {
          grandTotal: true,
          paidAmount: true,
          dueAmount: true,
          totalCogs: true,
        },
      }),
    ]);

    const sales: SaleSummaryItem[] = salesData.map((s) => {
      const grandTotal = Number(s.grandTotal);
      const totalCogs = Number(s.totalCogs);
      const grossProfit = grandTotal - totalCogs;

      return {
        id: s.id,
        saleNumber: s.saleNumber,
        invoiceNumber: s.invoice?.invoiceNumber || null,
        challanNumber: s.invoice?.challanNumber || null,
        customerId: s.customerId,
        customerName: s.customer.pharmacyName,
        customerCode: s.customer.customerCode,
        customerPhone: s.customer.phone,
        salesmanName: s.distributor?.name || "Direct Cashier / HQ",
        saleDate: s.saleDate.toISOString(),
        deliveryDate: s.deliveryDate ? s.deliveryDate.toISOString() : null,
        itemsCount: s.saleItems.length,
        subtotalAmount: Number(s.subtotalAmount),
        discountAmount: Number(s.discountAmount),
        taxAmount: Number(s.taxAmount),
        deliveryCharge: Number(s.deliveryCharge),
        grandTotal,
        totalCogs,
        grossProfit,
        paidAmount: Number(s.paidAmount),
        dueAmount: Number(s.dueAmount),
        paymentStatus: s.paymentStatus,
        deliveryStatus: s.deliveryStatus,
        status: s.status,
        creditOverrideApproved: s.creditOverrideApproved,
        notes: s.notes,
        createdAt: s.createdAt.toISOString(),
      };
    });

    const totalRevenue = Number(statsData._sum.grandTotal || 0);
    const totalPaid = Number(statsData._sum.paidAmount || 0);
    const totalDue = Number(statsData._sum.dueAmount || 0);
    const totalCogs = Number(statsData._sum.totalCogs || 0);
    const totalGrossProfit = totalRevenue - totalCogs;

    return {
      sales,
      totalCount,
      totalRevenue,
      totalPaid,
      totalDue,
      totalGrossProfit,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  } catch (error) {
    console.error("Error in getSales service:", error);
    return {
      sales: [],
      totalCount: 0,
      totalRevenue: 0,
      totalPaid: 0,
      totalDue: 0,
      totalGrossProfit: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch detailed Sale record with batch breakdowns, customer details, and invoice linkage
 */
export async function getSaleById(id: string): Promise<SaleDetailRecord | null> {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        distributor: true,
        createdBy: true,
        cancelledBy: true,
        invoice: true,
        saleItems: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });

    if (!sale) return null;

    const company = await prisma.company.findFirst();

    const grandTotal = Number(sale.grandTotal);
    const totalCogs = Number(sale.totalCogs);
    const grossProfit = grandTotal - totalCogs;

    const items: SaleDetailItem[] = sale.saleItems.map((it) => {
      const lineTotal = Number(it.lineTotal);
      const lineCogs = Number(it.lineCogs);
      return {
        id: it.id,
        medicineId: it.medicineId,
        medicineName: it.medicine.brandName,
        genericName: it.medicine.genericName,
        dosageForm: it.medicine.dosageForm,
        batchId: it.batchId,
        batchNumber: it.batch.batchNumber,
        expiryDate: it.batch.expiryDate.toISOString(),
        quantity: it.quantity,
        bonusQuantity: it.bonusQuantity,
        unitCostPrice: Number(it.unitCostPrice),
        unitTradePrice: Number(it.unitTradePrice),
        unitMrp: Number(it.unitMrp),
        discountPercent: Number(it.discountPercent),
        discountAmount: Number(it.discountAmount),
        taxPercent: Number(it.taxPercent),
        taxAmount: Number(it.taxAmount),
        lineCogs,
        lineTotal,
        lineGrossProfit: lineTotal - lineCogs,
      };
    });

    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      invoiceNumber: sale.invoice?.invoiceNumber || null,
      challanNumber: sale.invoice?.challanNumber || null,
      customerId: sale.customerId,
      customerName: sale.customer.pharmacyName,
      customerCode: sale.customer.customerCode,
      customerPhone: sale.customer.phone,
      salesmanName: sale.distributor?.name || "Direct Cashier / HQ",
      saleDate: sale.saleDate.toISOString(),
      deliveryDate: sale.deliveryDate ? sale.deliveryDate.toISOString() : null,
      itemsCount: sale.saleItems.length,
      subtotalAmount: Number(sale.subtotalAmount),
      discountAmount: Number(sale.discountAmount),
      taxAmount: Number(sale.taxAmount),
      deliveryCharge: Number(sale.deliveryCharge),
      grandTotal,
      totalCogs,
      grossProfit,
      paidAmount: Number(sale.paidAmount),
      dueAmount: Number(sale.dueAmount),
      paymentStatus: sale.paymentStatus,
      deliveryStatus: sale.deliveryStatus,
      status: sale.status,
      creditOverrideApproved: sale.creditOverrideApproved,
      notes: sale.notes,
      cancellationReason: sale.cancellationReason,
      cancelledAt: sale.cancelledAt ? sale.cancelledAt.toISOString() : null,
      cancelledByName: sale.cancelledBy?.name || null,
      createdByName: sale.createdBy.name,
      companyName: company?.name || undefined,
      companyAddress: company?.address || undefined,
      companyPhone: company?.phone || undefined,
      companyDrugLicense: company?.drugLicenseNo || undefined,
      createdAt: sale.createdAt.toISOString(),
      items,
    };
  } catch (error) {
    console.error("Error in getSaleById service:", error);
    return null;
  }
}

/**
 * Atomic Wholesale Sale Creation Engine
 * 1. Validates customer and credit barrier
 * 2. Validates medicines and non-expired batches
 * 3. Validates available stockOnHand with negative stock prevention
 * 4. Recalculates authoritative financials server-side using precision numbers
 * 5. Creates Sale and SaleItems with historical batch COGS preservation
 * 6. Depletes batch inventory & logs SALE_OUT stock movement
 * 7. Generates Wholesale Tax Invoice & Delivery Challan
 * 8. Records initial customer payment if paidAmount > 0 and creates allocation
 * 9. Updates customer current due and purchase balance
 * 10. Records system audit log
 */
export async function createSale(
  input: SaleOrderInput,
  userId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const {
      customerId,
      distributorId,
      orderDate,
      deliveryAddress,
      specialDiscountPercent = 0,
      deliveryCharge = 0,
      paidAmount: rawPaidAmount = 0,
      paymentMethod = "CASH",
      paymentReference,
      paymentBank,
      paymentChequeNumber,
      creditOverrideApproved = false,
      creditOverrideReason,
      notes,
      items,
    } = input;

    if (!items || items.length === 0) {
      return { success: false, error: "At least one medicine item is required." };
    }

    // 1. Verify Customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return { success: false, error: "Selected Customer Pharmacy not found." };
    }

    if (customer.status === "INACTIVE") {
      return {
        success: false,
        error: `Customer "${customer.pharmacyName}" is INACTIVE and cannot receive wholesale shipments.`,
      };
    }

    if (customer.status === "BLOCKED_OVERDUE" && !creditOverrideApproved) {
      return {
        success: false,
        error: `Credit Barrier Block: Customer "${customer.pharmacyName}" has overdue invoices and is locked. Requires manager override approval.`,
      };
    }

    // 2. Fetch and Validate all Batches & Medicines
    const batchIds = items.map((i) => i.batchId);
    const batches = await prisma.medicineBatch.findMany({
      where: { id: { in: batchIds } },
      include: {
        medicine: true,
      },
    });

    const batchMap = new Map(batches.map((b) => [b.id, b]));

    // Pre-calculate line items and validate stock
    let subtotalAmount = 0;
    let lineDiscountsAmount = 0;
    let lineTaxesAmount = 0;
    let totalCogs = 0;

    const validatedItems: Array<{
      medicineId: string;
      batchId: string;
      quantity: number;
      bonusQuantity: number;
      unitCostPrice: number;
      unitTradePrice: number;
      unitMrp: number;
      discountPercent: number;
      discountAmount: number;
      taxPercent: number;
      taxAmount: number;
      lineCogs: number;
      lineTotal: number;
    }> = [];

    const now = new Date();

    for (const item of items) {
      const batch = batchMap.get(item.batchId);
      if (!batch) {
        return { success: false, error: `Batch ID "${item.batchId}" not found.` };
      }

      if (batch.medicine.status !== "ACTIVE") {
        return { success: false, error: `Medicine "${batch.medicine.brandName}" is inactive.` };
      }

      if (batch.status === "EXHAUSTED" || batch.quantityOnHand <= 0) {
        return {
          success: false,
          error: `Stock Error: Batch "${batch.batchNumber}" of "${batch.medicine.brandName}" is exhausted.`,
        };
      }

      // Check Expiry
      if (batch.expiryDate.getTime() < now.getTime()) {
        return {
          success: false,
          error: `FEFO Safety Violation: Batch "${batch.batchNumber}" of "${batch.medicine.brandName}" expired on ${batch.expiryDate.toISOString().split("T")[0]} and cannot be sold.`,
        };
      }

      const totalRequiredQty = item.quantity + item.bonusQuantity;
      if (batch.quantityOnHand < totalRequiredQty) {
        return {
          success: false,
          error: `Insufficient Stock: Batch "${batch.batchNumber}" has only ${batch.quantityOnHand} available, but ${totalRequiredQty} (${item.quantity} order + ${item.bonusQuantity} bonus) was requested.`,
        };
      }

      // Authoritative Calculations using Batch Snapshot
      const unitTradePrice = Number(item.unitTradePrice > 0 ? item.unitTradePrice : batch.tradePrice);
      const unitCostPrice = Number(batch.purchaseCostPrice); // Historical Cost Preservation
      const unitMrp = Number(item.unitMrp && item.unitMrp > 0 ? item.unitMrp : batch.mrp);
      const discountPercent = Number(item.discountPercent || 0);
      const vatPercent = Number(item.vatPercent || 0);

      const rawLineTotal = item.quantity * unitTradePrice;
      const discountAmount = rawLineTotal * (discountPercent / 100);
      const discountedLine = rawLineTotal - discountAmount;
      const taxAmount = discountedLine * (vatPercent / 100);
      const finalLineTotal = discountedLine + taxAmount;

      // Historical COGS: includes both billed quantity and promotional bonus quantity
      const lineCogs = totalRequiredQty * unitCostPrice;

      subtotalAmount += rawLineTotal;
      lineDiscountsAmount += discountAmount;
      lineTaxesAmount += taxAmount;
      totalCogs += lineCogs;

      validatedItems.push({
        medicineId: batch.medicineId,
        batchId: batch.id,
        quantity: item.quantity,
        bonusQuantity: item.bonusQuantity,
        unitCostPrice,
        unitTradePrice,
        unitMrp,
        discountPercent,
        discountAmount,
        taxPercent: vatPercent,
        taxAmount,
        lineCogs,
        lineTotal: finalLineTotal,
      });
    }

    // Special order discount
    const specialDiscountAmount = (subtotalAmount - lineDiscountsAmount) * (specialDiscountPercent / 100);
    const totalDiscountAmount = lineDiscountsAmount + specialDiscountAmount;
    const grandTotal = Math.max(0, subtotalAmount - totalDiscountAmount + lineTaxesAmount + Number(deliveryCharge));

    // Credit limit validation
    const currentDue = Number(customer.currentDue);
    const creditLimit = Number(customer.creditLimit);
    const projectedDue = currentDue + grandTotal - Number(rawPaidAmount);

    if (creditLimit > 0 && projectedDue > creditLimit && !creditOverrideApproved) {
      return {
        success: false,
        error: `Credit Barrier Exceeded: Order of ৳${grandTotal.toFixed(2)} pushes customer due to ৳${projectedDue.toFixed(2)}, exceeding credit limit of ৳${creditLimit.toFixed(2)}. Requires Sales Manager override.`,
      };
    }

    // Payment validation
    const paidAmount = Math.min(grandTotal, Math.max(0, Number(rawPaidAmount)));
    const dueAmount = grandTotal - paidAmount;

    let paymentStatus: PaymentStatus = PaymentStatus.UNPAID;
    if (paidAmount >= grandTotal && grandTotal > 0) {
      paymentStatus = PaymentStatus.PAID;
    } else if (paidAmount > 0) {
      paymentStatus = PaymentStatus.PARTIALLY_PAID;
    }

    // Execute Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find active company and user
      const company = await tx.company.findFirst();
      const user = userId ? await tx.user.findUnique({ where: { id: userId } }) : await tx.user.findFirst();

      const year = new Date().getFullYear();
      const count = await tx.sale.count();
      const saleNumber = `SO-${year}-${String(count + 1).padStart(5, "0")}`;
      const invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, "0")}`;
      const challanNumber = `CH-${year}-${String(count + 1).padStart(5, "0")}`;
      const receiptNumber = `RCT-${year}-${String(count + 1).padStart(5, "0")}`;

      const saleDateObj = new Date(orderDate);
      const dueDateObj = new Date(saleDateObj);
      dueDateObj.setDate(dueDateObj.getDate() + customer.creditDaysLimit);

      // 1. Create Sale
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          customerId,
          distributorId: distributorId || undefined,
          createdById: user?.id || customer.id,
          saleDate: saleDateObj,
          deliveryDate: new Date(),
          subtotalAmount,
          discountAmount: totalDiscountAmount,
          taxAmount: lineTaxesAmount,
          deliveryCharge: Number(deliveryCharge),
          grandTotal,
          totalCogs,
          paidAmount,
          dueAmount,
          paymentStatus,
          deliveryStatus: DeliveryStatus.DELIVERED,
          status: SaleStatus.CONFIRMED,
          creditOverrideApproved,
          creditOverrideReason: creditOverrideReason || undefined,
          notes: notes?.trim() || undefined,
          saleItems: {
            create: validatedItems.map((vi) => ({
              medicineId: vi.medicineId,
              batchId: vi.batchId,
              quantity: vi.quantity,
              bonusQuantity: vi.bonusQuantity,
              unitCostPrice: vi.unitCostPrice,
              unitTradePrice: vi.unitTradePrice,
              unitMrp: vi.unitMrp,
              discountPercent: vi.discountPercent,
              discountAmount: vi.discountAmount,
              taxPercent: vi.taxPercent,
              taxAmount: vi.taxAmount,
              lineCogs: vi.lineCogs,
              lineTotal: vi.lineTotal,
            })),
          },
        },
      });

      // 2. Decrement Batch Stock & Record StockMovements
      for (const vi of validatedItems) {
        const totalDeplete = vi.quantity + vi.bonusQuantity;
        const currentBatch = await tx.medicineBatch.findUnique({
          where: { id: vi.batchId },
        });

        if (!currentBatch || currentBatch.quantityOnHand < totalDeplete) {
          throw new Error(`Concurrent stock change: Batch ${vi.batchId} has insufficient stock.`);
        }

        const remaining = currentBatch.quantityOnHand - totalDeplete;
        await tx.medicineBatch.update({
          where: { id: vi.batchId },
          data: {
            quantityOnHand: remaining,
            status: remaining === 0 ? "EXHAUSTED" : currentBatch.status,
          },
        });

        // Record immutable stock movement ledger entry
        await tx.stockMovement.create({
          data: {
            medicineId: vi.medicineId,
            batchId: vi.batchId,
            warehouseId: currentBatch.warehouseId,
            movementType: StockMovementType.SALE_OUT,
            quantityDelta: -totalDeplete,
            quantityBefore: currentBatch.quantityOnHand,
            quantityAfter: remaining,
            unitCostPrice: vi.unitCostPrice,
            referenceNumber: saleNumber,
            reason: `Wholesale Medicine Order ${saleNumber} to ${customer.pharmacyName}`,
            createdById: user?.id,
          },
        });
      }

      // 3. Create Wholesale Tax Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          saleId: sale.id,
          customerId,
          distributorId: distributorId || undefined,
          createdById: user?.id || customer.id,
          invoiceDate: saleDateObj,
          dueDate: dueDateObj,
          subtotalAmount,
          discountAmount: totalDiscountAmount,
          taxAmount: lineTaxesAmount,
          deliveryCharge: Number(deliveryCharge),
          grandTotal,
          paidAmount,
          dueAmount,
          paymentStatus,
          status: InvoiceStatus.ISSUED,
          challanNumber,
          notes: notes?.trim() || undefined,
        },
      });

      // 4. If payment made during sale, create CustomerPayment & Allocation
      let paymentRecord = null;
      if (paidAmount > 0) {
        paymentRecord = await tx.customerPayment.create({
          data: {
            receiptNumber,
            customerId,
            distributorId: distributorId || undefined,
            createdById: user?.id || customer.id,
            amount: paidAmount,
            paymentDate: saleDateObj,
            paymentMethod: paymentMethod as PaymentMethod,
            referenceNumber: paymentReference || undefined,
            bankName: paymentBank || undefined,
            chequeNumber: paymentChequeNumber || undefined,
            status: "CONFIRMED",
            notes: `Settlement for Wholesale Invoice ${invoiceNumber}`,
            paymentAllocations: {
              create: [
                {
                  invoiceId: invoice.id,
                  allocatedAmount: paidAmount,
                },
              ],
            },
          },
        });
      }

      // 5. Update Customer Account Balance
      await tx.customer.update({
        where: { id: customerId },
        data: {
          currentDue: { increment: dueAmount },
          totalPurchased: { increment: grandTotal },
          totalPaid: { increment: paidAmount },
        },
      });

      // 6. Audit Log
      if (user) {
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "CREATE",
            entityName: "Sale",
            entityId: sale.id,
            newValues: JSON.stringify({
              saleNumber,
              invoiceNumber,
              customerId,
              pharmacyName: customer.pharmacyName,
              grandTotal,
              paidAmount,
              dueAmount,
              itemsCount: validatedItems.length,
            }),
          },
        });
      }

      return {
        saleId: sale.id,
        saleNumber,
        invoiceId: invoice.id,
        invoiceNumber,
        grandTotal,
        paidAmount,
        dueAmount,
      };
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating sale in sales.service:", error);
    return { success: false, error: error.message || "Failed to create wholesale sales order." };
  }
}

/**
 * Cancel a Wholesale Sale (Restores inventory, reverses customer balance, voids invoice)
 */
export async function cancelSale(
  id: string,
  reason: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        invoice: true,
        saleItems: true,
      },
    });

    if (!sale) {
      return { success: false, error: "Sale record not found." };
    }

    if (sale.status === SaleStatus.CANCELLED) {
      return { success: false, error: "Sale is already cancelled." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Restore Inventory for each batch
      for (const item of sale.saleItems) {
        const totalRestore = item.quantity + item.bonusQuantity;
        const batch = await tx.medicineBatch.findUnique({
          where: { id: item.batchId },
        });

        if (batch) {
          const newQty = batch.quantityOnHand + totalRestore;
          await tx.medicineBatch.update({
            where: { id: item.batchId },
            data: {
              quantityOnHand: newQty,
              status: "ACTIVE",
            },
          });

          // Log stock reversal
          await tx.stockMovement.create({
            data: {
              medicineId: item.medicineId,
              batchId: item.batchId,
              warehouseId: batch.warehouseId,
              movementType: StockMovementType.SALE_CANCEL_RETURN,
              quantityDelta: totalRestore,
              quantityBefore: batch.quantityOnHand,
              quantityAfter: newQty,
              unitCostPrice: item.unitCostPrice,
              referenceNumber: sale.saleNumber,
              reason: `Sale Cancellation Reversal for ${sale.saleNumber}: ${reason}`,
              createdById: userId,
            },
          });
        }
      }

      // 2. Adjust Customer Financials
      const dueToDeduct = Number(sale.dueAmount);
      const totalPurchasedToDeduct = Number(sale.grandTotal);
      const paidToAdjust = Number(sale.paidAmount);

      await tx.customer.update({
        where: { id: sale.customerId },
        data: {
          currentDue: { decrement: dueToDeduct },
          totalPurchased: { decrement: totalPurchasedToDeduct },
          totalPaid: { decrement: paidToAdjust },
        },
      });

      // 3. Update Sale & Invoice status
      await tx.sale.update({
        where: { id },
        data: {
          status: SaleStatus.CANCELLED,
          cancellationReason: reason,
          cancelledAt: new Date(),
          cancelledById: userId || undefined,
        },
      });

      if (sale.invoice) {
        await tx.invoice.update({
          where: { id: sale.invoice.id },
          data: {
            status: InvoiceStatus.CANCELLED,
          },
        });
      }

      // 4. Audit Log
      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "CANCEL",
            entityName: "Sale",
            entityId: id,
            newValues: JSON.stringify({
              saleNumber: sale.saleNumber,
              reason,
            }),
          },
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling sale:", error);
    return { success: false, error: error.message || "Failed to cancel sale." };
  }
}
