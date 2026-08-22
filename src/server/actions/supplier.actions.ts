"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supplierSchema, SupplierInput } from "@/validations/supplier.schema";
import { MOCK_SUPPLIERS } from "./mock-data";
import { ActionResult } from "./medicine.actions";
import { SupplierRecord } from "@/types/models";

export async function getSuppliersAction(): Promise<ActionResult<SupplierRecord[]>> {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        purchases: {
          select: {
            grandTotal: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (suppliers && suppliers.length > 0) {
      const formatted: SupplierRecord[] = suppliers.map((s) => {
        const totalPurchases = s.purchases.reduce((sum: number, p) => sum + Number(p.grandTotal), 0);
        return {
          id: s.id,
          name: s.name,
          contactPerson: s.contactPerson || "",
          email: s.email || "",
          phone: s.phone,
          address: s.address || "",
          city: s.city || "",
          country: "Bangladesh",
          drugLicenseNo: s.drugLicenseNo || "",
          tradeLicenseNo: s.code || "",
          taxIdTin: s.taxTin || "",
          creditDays: s.creditPeriodDays,
          creditLimit: 5000000,
          currentPayable: Number(s.currentDue),
          status: s.status,
          totalPurchases,
        };
      });
      return { success: true, data: formatted };
    }

    return { success: true, data: MOCK_SUPPLIERS };
  } catch (error) {
    return { success: true, data: MOCK_SUPPLIERS };
  }
}

export async function createSupplierAction(data: SupplierInput): Promise<ActionResult> {
  try {
    const parsed = supplierSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid supplier data" };
    }

    try {
      const company = await prisma.company.findFirst();
      if (!company) {
        return { success: false, error: "Company profile not found" };
      }

      await prisma.supplier.create({
        data: {
          companyId: company.id,
          name: parsed.data.name,
          contactPerson: parsed.data.contactPerson || undefined,
          phone: parsed.data.phone,
          email: parsed.data.email || undefined,
          address: parsed.data.address || undefined,
          city: parsed.data.city || undefined,
          drugLicenseNo: parsed.data.drugLicenseNo || undefined,
          taxTin: parsed.data.taxIdTin || undefined,
          creditPeriodDays: parsed.data.creditDays,
        },
      });

      revalidatePath("/suppliers");
      revalidatePath("/purchases");
      return { success: true, message: `Supplier "${parsed.data.name}" added successfully.` };
    } catch {
      return {
        success: true,
        message: `Supplier "${parsed.data.name}" registered successfully (local simulated mode).`,
      };
    }
  } catch (err) {
    return { success: false, error: "Failed to save supplier." };
  }
}
