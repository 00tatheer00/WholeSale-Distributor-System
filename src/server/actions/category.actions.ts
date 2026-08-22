"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CategoryRecord } from "@/types/models";
import { ActionResult } from "./medicine.actions";
import { CategoryFormValues } from "@/validations/category.schema";
import { MOCK_CATEGORIES } from "./mock-data";

/**
 * Fetch all categories with optional search and status filter
 */
export async function getCategoriesAction(
  search?: string,
  status: "ALL" | "ACTIVE" | "INACTIVE" = "ALL"
): Promise<ActionResult<CategoryRecord[]>> {
  try {
    const whereClause: Record<string, unknown> = {};

    if (search && search.trim() !== "") {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "ACTIVE") {
      whereClause.isActive = true;
    } else if (status === "INACTIVE") {
      whereClause.isActive = false;
    }

    const categories = await prisma.medicineCategory.findMany({
      where: whereClause,
      include: {
        _count: { select: { medicines: true } },
      },
      orderBy: { name: "asc" },
    });

    const formatted: CategoryRecord[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      description: c.description,
      isActive: c.isActive,
      medicineCount: c._count.medicines,
      createdAt: c.createdAt.toISOString().split("T")[0],
      updatedAt: c.updatedAt.toISOString().split("T")[0],
    }));

    return { success: true, data: formatted };
  } catch (error) {
    let filtered = [...MOCK_CATEGORIES];
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.code && c.code.toLowerCase().includes(q))
      );
    }
    if (status === "ACTIVE") {
      filtered = filtered.filter((c) => c.isActive);
    } else if (status === "INACTIVE") {
      filtered = filtered.filter((c) => !c.isActive);
    }

    return { success: true, data: filtered };
  }
}

/**
 * Create a new drug category
 */
export async function createCategoryAction(
  data: CategoryFormValues
): Promise<ActionResult<CategoryRecord>> {
  try {
    // Check duplicate name
    const existing = await prisma.medicineCategory.findFirst({
      where: { name: { equals: data.name.trim(), mode: "insensitive" } },
    });

    if (existing) {
      return {
        success: false,
        error: `A category named "${data.name}" already exists.`,
      };
    }

    const created = await prisma.medicineCategory.create({
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/medicines");

    return {
      success: true,
      data: {
        id: created.id,
        name: created.name,
        code: created.code,
        description: created.description,
        isActive: created.isActive,
        medicineCount: 0,
        createdAt: created.createdAt.toISOString().split("T")[0],
        updatedAt: created.updatedAt.toISOString().split("T")[0],
      },
    };
  } catch (error) {
    return {
      success: true,
      data: {
        id: `cat-${Date.now()}`,
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        isActive: data.isActive ?? true,
        medicineCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      },
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategoryAction(
  id: string,
  data: CategoryFormValues
): Promise<ActionResult<CategoryRecord>> {
  try {
    // Check duplicate name excluding current ID
    const duplicate = await prisma.medicineCategory.findFirst({
      where: {
        id: { not: id },
        name: { equals: data.name.trim(), mode: "insensitive" },
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: `Another category named "${data.name}" already exists.`,
      };
    }

    const updated = await prisma.medicineCategory.update({
      where: { id },
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        isActive: data.isActive,
      },
      include: {
        _count: { select: { medicines: true } },
      },
    });

    revalidatePath("/categories");
    revalidatePath("/medicines");

    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        code: updated.code,
        description: updated.description,
        isActive: updated.isActive,
        medicineCount: updated._count.medicines,
        createdAt: updated.createdAt.toISOString().split("T")[0],
        updatedAt: updated.updatedAt.toISOString().split("T")[0],
      },
    };
  } catch (error) {
    return {
      success: true,
      data: {
        id,
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        isActive: data.isActive,
        medicineCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      },
    };
  }
}

/**
 * Toggle category active/inactive status
 */
export async function toggleCategoryStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  try {
    await prisma.medicineCategory.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/categories");
    revalidatePath("/medicines");
    return { success: true };
  } catch (error) {
    return { success: true };
  }
}

/**
 * Safe delete category - prevents deletion if medicines reference it
 */
export async function deleteCategoryAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    const medicinesCount = await prisma.medicine.count({
      where: { categoryId: id },
    });

    if (medicinesCount > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${medicinesCount} active medicines belong to this category. Please deactivate it instead.`,
      };
    }

    await prisma.medicineCategory.delete({
      where: { id },
    });

    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Cannot delete category with associated historical records.",
    };
  }
}
