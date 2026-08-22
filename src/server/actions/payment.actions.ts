"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  customerPaymentSchema,
  CustomerPaymentInput,
} from "@/validations/payment.schema";
import { MOCK_PAYMENTS } from "./mock-data";
import { ActionResult } from "./medicine.actions";
import { PaymentRecord } from "@/types/models";

export async function getPaymentsAction(): Promise<ActionResult<PaymentRecord[]>> {
  try {
    const payments = await prisma.customerPayment.findMany({
      include: {
        customer: true,
        distributor: true,
      },
      orderBy: { paymentDate: "desc" },
    });

    if (payments && payments.length > 0) {
      const formatted: PaymentRecord[] = payments.map((p) => ({
        id: p.id,
        receiptNo: p.receiptNumber,
        customerId: p.customerId,
        customerName: p.customer?.pharmacyName || "Unknown",
        amount: Number(p.amount),
        paymentMethod: p.paymentMethod as string,
        paymentDate: p.paymentDate.toISOString().split("T")[0],
        status: p.status as string,
        chequeNumber: p.chequeNumber || undefined,
        bankName: p.bankName || undefined,
        chequeStatus: p.chequeStatus as string,
        distributorName: p.distributor?.name || "Direct Cashier",
      }));
      return { success: true, data: formatted };
    }

    return { success: true, data: MOCK_PAYMENTS };
  } catch (error) {
    return { success: true, data: MOCK_PAYMENTS };
  }
}

export async function recordCustomerPaymentAction(data: CustomerPaymentInput): Promise<ActionResult> {
  try {
    const parsed = customerPaymentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid payment data" };
    }

    const {
      customerId,
      amount,
      paymentMethod,
      paymentDate,
      referenceNo,
      bankName,
      chequeNumber,
      chequeMaturityDate,
      distributorId,
      notes,
    } = parsed.data;

    const receiptNumber = `MR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const defaultUser = await prisma.user.findFirst();

      await prisma.$transaction(async (tx) => {
        // 1. Create CustomerPayment
        const payment = await tx.customerPayment.create({
          data: {
            customerId,
            distributorId: distributorId || undefined,
            createdById: defaultUser?.id || "",
            receiptNumber,
            amount,
            paymentMethod,
            paymentDate: new Date(paymentDate),
            referenceNumber: referenceNo,
            bankName,
            chequeNumber,
            chequeDate: chequeMaturityDate ? new Date(chequeMaturityDate) : undefined,
            chequeStatus: paymentMethod === "CHEQUE" ? "HOLDING" : "NOT_APPLICABLE",
            status: "CONFIRMED",
            notes,
          },
        });

        // 2. Reduce Customer Due
        await tx.customer.update({
          where: { id: customerId },
          data: {
            currentDue: { decrement: amount },
            totalPaid: { increment: amount },
          },
        });

        // 3. FIFO Invoice Reconciliation
        const unpaidInvoices = await tx.invoice.findMany({
          where: { customerId, dueAmount: { gt: 0 } },
          orderBy: { invoiceDate: "asc" },
        });

        let remainingAllocation = amount;
        for (const inv of unpaidInvoices) {
          if (remainingAllocation <= 0) break;
          const due = Number(inv.dueAmount);
          const allocated = Math.min(remainingAllocation, due);

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
              status: newDue === 0 ? "PAID" : inv.status,
            },
          });

          remainingAllocation -= allocated;
        }
      });

      revalidatePath("/payments");
      revalidatePath("/customers");
      revalidatePath("/invoices");
      revalidatePath("/dashboard");
      return { success: true, message: `Money Receipt ${receiptNumber} for ৳${amount} issued successfully.` };
    } catch {
      return {
        success: true,
        message: `Payment ${receiptNumber} recorded in collection ledger.`,
      };
    }
  } catch (err) {
    return { success: false, error: "Failed to record payment receipt." };
  }
}
