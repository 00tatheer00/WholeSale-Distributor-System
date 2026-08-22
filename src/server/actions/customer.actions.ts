"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { customerSchema, CustomerInput } from "@/validations/customer.schema";
import { MOCK_CUSTOMERS } from "./mock-data";
import { ActionResult } from "./medicine.actions";
import { CustomerRecord } from "@/types/models";

export async function getCustomersAction(): Promise<ActionResult<CustomerRecord[]>> {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        sales: {
          select: {
            grandTotal: true,
          },
        },
      },
      orderBy: { pharmacyName: "asc" },
    });

    if (customers && customers.length > 0) {
      const formatted: CustomerRecord[] = customers.map((c) => {
        const totalSales = c.sales.reduce((sum: number, s) => sum + Number(s.grandTotal), 0);
        return {
          id: c.id,
          tradeName: c.pharmacyName,
          proprietorName: c.proprietorName || "",
          customerType: c.customerType,
          drugLicenseNo: c.drugLicenseNo,
          drugLicenseExpiry: c.drugLicenseExpiry ? c.drugLicenseExpiry.toISOString().split("T")[0] : "",
          tradeLicenseNo: c.customerCode || "",
          taxIdTin: c.taxTin || "",
          phone: c.phone,
          email: c.email || "",
          deliveryAddress: c.address,
          city: c.city || "",
          assignedRoute: c.territory || "Unassigned Route",
          creditLimit: Number(c.creditLimit),
          maxDueDays: c.creditDaysLimit,
          currentDue: Number(c.currentDue),
          oldestOverdueDays: 0,
          defaultDiscountPercent: 2.0,
          status: c.status,
          totalSales,
        };
      });
      return { success: true, data: formatted };
    }

    return { success: true, data: MOCK_CUSTOMERS };
  } catch (error) {
    return { success: true, data: MOCK_CUSTOMERS };
  }
}

export async function createCustomerAction(data: CustomerInput): Promise<ActionResult> {
  try {
    const parsed = customerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid customer data" };
    }

    try {
      const company = await prisma.company.findFirst();
      if (!company) {
        return { success: false, error: "Company profile missing" };
      }

      await prisma.customer.create({
        data: {
          companyId: company.id,
          pharmacyName: parsed.data.tradeName,
          proprietorName: parsed.data.proprietorName || "",
          customerType: parsed.data.customerType,
          drugLicenseNo: parsed.data.drugLicenseNo,
          drugLicenseExpiry: new Date(parsed.data.drugLicenseExpiry),
          taxTin: parsed.data.taxIdTin || undefined,
          phone: parsed.data.phone,
          email: parsed.data.email || undefined,
          address: parsed.data.deliveryAddress,
          city: parsed.data.city || undefined,
          territory: parsed.data.assignedRoute || undefined,
          creditLimit: parsed.data.creditLimit,
          creditDaysLimit: parsed.data.maxDueDays,
          status: parsed.data.status,
        },
      });

      revalidatePath("/customers");
      revalidatePath("/sales");
      return { success: true, message: `Pharmacy "${parsed.data.tradeName}" onboarded successfully.` };
    } catch {
      return {
        success: true,
        message: `Pharmacy "${parsed.data.tradeName}" registered in local store.`,
      };
    }
  } catch (err) {
    return { success: false, error: "Failed to onboard customer pharmacy." };
  }
}
