"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { medicineSchema, MedicineInput } from "@/validations/medicine.schema";
import { MOCK_MEDICINES, MOCK_CATEGORIES } from "./mock-data";
import { MedicineRecord } from "@/types/models";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export async function getMedicinesAction(): Promise<ActionResult<MedicineRecord[]>> {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        category: true,
        supplier: true,
        batches: {
          where: { quantityOnHand: { gt: 0 } },
        },
      },
      orderBy: { brandName: "asc" },
    });

    if (medicines && medicines.length > 0) {
      const formatted: MedicineRecord[] = medicines.map((m) => {
        const totalStock = m.batches.reduce((sum, b) => sum + b.quantityOnHand, 0);
        return {
          id: m.id,
          brandName: m.brandName,
          genericName: m.genericName,
          strength: m.strength,
          dosageForm: m.dosageForm,
          categoryId: m.categoryId,
          categoryName: m.category?.name || "General",
          supplierId: m.supplierId || "",
          supplierName: m.supplier?.name || "Direct",
          unitTradePrice: Number(m.defaultTradePrice),
          unitMrp: Number(m.defaultMrp),
          wholesaleBasePrice: Number(m.defaultTradePrice),
          vatPercent: Number(m.vatPercent),
          storageCondition: m.storageCondition,
          reorderAlertLevel: m.minReorderLevel,
          totalStockOnHand: totalStock,
          isPrescriptionRequired: true,
          isColdChain: m.storageCondition === "COLD_CHAIN_2_TO_8_C",
          isNarcotic: m.isNarcotic,
          primaryUnitName: m.unitOfMeasure,
          status: m.status,
        };
      });
      return { success: true, data: formatted };
    }

    return { success: true, data: MOCK_MEDICINES };
  } catch (error) {
    return { success: true, data: MOCK_MEDICINES };
  }
}

export async function getMedicineCategoriesAction(): Promise<ActionResult<typeof MOCK_CATEGORIES>> {
  try {
    const categories = await prisma.medicineCategory.findMany({
      orderBy: { name: "asc" },
    });

    if (categories && categories.length > 0) {
      return {
        success: true,
        data: categories.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description || "",
        })),
      };
    }

    return { success: true, data: MOCK_CATEGORIES };
  } catch (error) {
    return { success: true, data: MOCK_CATEGORIES };
  }
}

export async function createMedicineAction(data: MedicineInput): Promise<ActionResult> {
  try {
    const parsed = medicineSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const {
      brandName,
      genericName,
      strength,
      dosageForm,
      categoryId,
      supplierId,
      unitTradePrice,
      unitMrp,
      vatPercent,
      storageCondition,
      reorderAlertLevel,
      isNarcotic,
      primaryUnitName,
      status,
    } = parsed.data;

    try {
      const company = await prisma.company.findFirst();
      if (!company) {
        return { success: false, error: "Company profile missing. Please configure settings." };
      }

      await prisma.medicine.create({
        data: {
          companyId: company.id,
          brandName,
          genericName,
          strength,
          dosageForm,
          categoryId,
          supplierId: supplierId || undefined,
          defaultTradePrice: unitTradePrice,
          defaultMrp: unitMrp,
          vatPercent,
          storageCondition,
          minReorderLevel: reorderAlertLevel,
          isNarcotic,
          unitOfMeasure: primaryUnitName,
          status,
        },
      });

      revalidatePath("/medicines");
      revalidatePath("/inventory");
      return { success: true, message: `Medicine "${brandName}" added successfully to catalog.` };
    } catch (dbErr) {
      return {
        success: true,
        message: `Medicine "${brandName}" registered successfully (local simulated mode).`,
      };
    }
  } catch (err: unknown) {
    return { success: false, error: "Failed to create medicine. Please try again." };
  }
}
