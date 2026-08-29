import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentTransactionStatus, ChequeStatus, InvoiceStatus } from "@prisma/client";
import { CustomerPaymentInput } from "@/validations/payment.schema";
import { PaymentRecord } from "@/types/models";

export interface PaymentQueryParams {
  search?: string;
  customerId?: string;
  paymentMethod?: "ALL" | "CASH" | "BANK_TRANSFER" | "CHEQUE" | "MFS_BKASH_NAGAD";
  statusFilter?: "ALL" | "CONFIRMED" | "VOIDED";
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaymentQueryResult {
  payments: PaymentRecord[];
  totalCount: number;
  totalCollected: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaymentDetailRecord extends PaymentRecord {
  customerCode?: string | null;
  customerPhone?: string;
  customerAddress?: string;
  customerDrugLicense?: string;
  notes?: string | null;
  recordedByName: string;
  previousBalance: number;
  newBalance: number;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  allocatedInvoices: Array<{
    invoiceNumber: string;
    invoiceTotal: number;
    allocatedAmount: number;
    remainingDue: number;
  }>;
}

/**
 * Fetch Customer Payments with search, filtering, and pagination
 */
export async function getPayments(params: PaymentQueryParams = {}): Promise<PaymentQueryResult> {
  const {
    search = "",
    customerId,
    paymentMethod = "ALL",
    statusFilter = "ALL",
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
  } = params;

  try {
    const whereClause: any = {};

    if (search.trim()) {
      whereClause.OR = [
        { receiptNumber: { contains: search.trim() } },
        { referenceNumber: { contains: search.trim() } },
        { chequeNumber: { contains: search.trim() } },
        { customer: { pharmacyName: { contains: search.trim() } } },
        { customer: { customerCode: { contains: search.trim() } } },
      ];
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (paymentMethod !== "ALL") {
      whereClause.paymentMethod = paymentMethod as PaymentMethod;
    }

    if (statusFilter !== "ALL") {
      whereClause.status = statusFilter as PaymentTransactionStatus;
    }

    if (startDate || endDate) {
      whereClause.paymentDate = {};
      if (startDate) {
        whereClause.paymentDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.paymentDate.lte = end;
      }
    }

    const skip = (Math.max(1, page) - 1) * pageSize;

    const [totalCount, paymentsData, statsData] = await Promise.all([
      prisma.customerPayment.count({ where: whereClause }),
      prisma.customerPayment.findMany({
        where: whereClause,
        orderBy: { paymentDate: "desc" },
        skip,
        take: pageSize,
        include: {
          customer: true,
          distributor: true,
        },
      }),
      prisma.customerPayment.aggregate({
        where: whereClause,
        _sum: {
          amount: true,
        },
      }),
    ]);

    const payments: PaymentRecord[] = paymentsData.map((p) => ({
      id: p.id,
      receiptNo: p.receiptNumber,
      customerId: p.customerId,
      customerName: p.customer.pharmacyName,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate.toISOString().split("T")[0],
      status: p.status,
      chequeNumber: p.chequeNumber || undefined,
      bankName: p.bankName || undefined,
      chequeStatus: p.chequeStatus,
      distributorName: p.distributor?.name || "Direct Cashier / HQ",
    }));

    return {
      payments,
      totalCount,
      totalCollected: Number(statsData._sum.amount || 0),
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  } catch (error) {
    console.error("Error in getPayments service:", error);
    return {
      payments: [],
      totalCount: 0,
      totalCollected: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
  }
}

/**
 * Fetch Detailed Payment Receipt Document with previous balance, allocated invoices, and company information
 */
export async function getPaymentById(id: string): Promise<PaymentDetailRecord | null> {
  try {
    const payment = await prisma.customerPayment.findFirst({
      where: {
        OR: [{ id }, { receiptNumber: id }],
      },
      include: {
        customer: true,
        distributor: true,
        createdBy: true,
        paymentAllocations: {
          include: {
            invoice: true,
          },
        },
      },
    });

    if (!payment) return null;

    const company = await prisma.company.findFirst();

    const currentDue = Number(payment.customer.currentDue);
    const amount = Number(payment.amount);
    const previousBalance = currentDue + amount;

    const allocatedInvoices = payment.paymentAllocations.map((a) => ({
      invoiceNumber: a.invoice.invoiceNumber,
      invoiceTotal: Number(a.invoice.grandTotal),
      allocatedAmount: Number(a.allocatedAmount),
      remainingDue: Number(a.invoice.dueAmount),
    }));

    return {
      id: payment.id,
      receiptNo: payment.receiptNumber,
      customerId: payment.customerId,
      customerName: payment.customer.pharmacyName,
      customerCode: payment.customer.customerCode,
      customerPhone: payment.customer.phone,
      customerAddress: payment.customer.address,
      customerDrugLicense: payment.customer.drugLicenseNo,
      amount,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate.toISOString().split("T")[0],
      status: payment.status,
      chequeNumber: payment.chequeNumber || undefined,
      bankName: payment.bankName || undefined,
      chequeStatus: payment.chequeStatus,
      distributorName: payment.distributor?.name || "Direct Cashier / HQ",
      notes: payment.notes,
      recordedByName: payment.createdBy.name,
      previousBalance,
      newBalance: currentDue,
      companyName: company?.name || "Apex Pharma Distributors Ltd.",
      companyAddress: company?.address || "Tejgaon Industrial Area, Dhaka",
      companyPhone: company?.phone || "+880 1711 000111",
      allocatedInvoices,
    };
  } catch (error) {
    console.error("Error in getPaymentById service:", error);
    return null;
  }
}

/**
 * Record Customer Payment against outstanding due with automatic FIFO Invoice allocation
 */
export async function recordCustomerPayment(
  input: CustomerPaymentInput,
  userId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const {
      customerId,
      amount: rawAmount,
      paymentMethod = "CASH",
      paymentDate,
      referenceNo,
      bankName,
      chequeNumber,
      chequeMaturityDate,
      distributorId,
      invoiceId,
      notes,
    } = input;

    const amount = Number(rawAmount);
    if (!amount || amount <= 0) {
      return { success: false, error: "Payment amount must be greater than zero." };
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return { success: false, error: "Customer not found." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = userId ? await tx.user.findUnique({ where: { id: userId } }) : await tx.user.findFirst();

      const year = new Date().getFullYear();
      const count = await tx.customerPayment.count();
      const receiptNumber = `RCT-${year}-${String(count + 1).padStart(5, "0")}`;

      // 1. Create CustomerPayment record
      const payment = await tx.customerPayment.create({
        data: {
          receiptNumber,
          customerId,
          distributorId: distributorId || undefined,
          createdById: user?.id || customer.id,
          amount,
          paymentDate: new Date(paymentDate),
          paymentMethod: paymentMethod as PaymentMethod,
          referenceNumber: referenceNo?.trim() || undefined,
          bankName: bankName?.trim() || undefined,
          chequeNumber: chequeNumber?.trim() || undefined,
          chequeDate: chequeMaturityDate ? new Date(chequeMaturityDate) : undefined,
          chequeStatus: paymentMethod === "CHEQUE" ? ChequeStatus.HOLDING : ChequeStatus.NOT_APPLICABLE,
          status: PaymentTransactionStatus.CONFIRMED,
          notes: notes?.trim() || undefined,
        },
      });

      // 2. Reduce Customer Current Due & Increment Total Paid
      await tx.customer.update({
        where: { id: customerId },
        data: {
          currentDue: { decrement: amount },
          totalPaid: { increment: amount },
        },
      });

      // 3. FIFO or Specific Invoice Allocation
      let remainingToAllocate = amount;

      if (invoiceId) {
        // Specific Invoice settlement
        const targetInvoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
        if (targetInvoice) {
          const due = Number(targetInvoice.dueAmount);
          const allocated = Math.min(remainingToAllocate, due);

          await tx.paymentInvoiceAllocation.create({
            data: {
              customerPaymentId: payment.id,
              invoiceId: targetInvoice.id,
              allocatedAmount: allocated,
            },
          });

          const newDue = due - allocated;
          const newPaid = Number(targetInvoice.paidAmount) + allocated;

          await tx.invoice.update({
            where: { id: targetInvoice.id },
            data: {
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newDue === 0 ? InvoiceStatus.PAID : targetInvoice.status,
            },
          });

          remainingToAllocate -= allocated;
        }
      }

      // If still remaining, perform FIFO allocation across oldest unpaid invoices
      if (remainingToAllocate > 0) {
        const unpaidInvoices = await tx.invoice.findMany({
          where: {
            customerId,
            dueAmount: { gt: 0 },
            ...(invoiceId ? { id: { not: invoiceId } } : {}),
          },
          orderBy: { invoiceDate: "asc" },
        });

        for (const inv of unpaidInvoices) {
          if (remainingToAllocate <= 0) break;
          const due = Number(inv.dueAmount);
          const allocated = Math.min(remainingToAllocate, due);

          await tx.paymentInvoiceAllocation.create({
            data: {
              customerPaymentId: payment.id,
              invoiceId: inv.id,
              allocatedAmount: allocated,
            },
          });

          const newDue = due - allocated;
          const newPaid = Number(inv.paidAmount) + allocated;

          await tx.invoice.update({
            where: { id: inv.id },
            data: {
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newDue === 0 ? InvoiceStatus.PAID : inv.status,
            },
          });

          remainingToAllocate -= allocated;
        }
      }

      // 4. Audit Log
      if (user) {
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "CREATE",
            entityName: "CustomerPayment",
            entityId: payment.id,
            newValues: JSON.stringify({
              receiptNumber,
              customerId,
              pharmacyName: customer.pharmacyName,
              amount,
              paymentMethod,
            }),
          },
        });
      }

      return {
        paymentId: payment.id,
        receiptNumber,
        amount,
      };
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error recording customer payment in payment.service:", error);
    return { success: false, error: error.message || "Failed to record customer payment." };
  }
}
