"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { manufacturerSchema, ManufacturerInput } from "@/validations/manufacturer.schema";
import { recordAuditLog } from "@/server/services/audit.service";
import { getCurrentUser } from "@/lib/auth/session";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  canDeactivate?: boolean;
}

export async function getManufacturersAction(params?: {
  search?: string;
  isActive?: boolean;
}): Promise<ActionResult<any[]>> {
  try {
    const whereClause: any = {};

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      whereClause.OR = [
        { name: { contains: q } },
        { code: { contains: q } },
        { contactPerson: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    if (typeof params?.isActive === "boolean") {
      whereClause.isActive = params.isActive;
    }

    const manufacturers = await prisma.manufacturer.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { medicines: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = manufacturers.map((m) => ({
      id: m.id,
      name: m.name,
      code: m.code || "N/A",
      contactPerson: m.contactPerson || "N/A",
      phone: m.phone || "N/A",
      email: m.email || "N/A",
      address: m.address || "N/A",
      country: m.country || "Pakistan",
      isActive: m.isActive,
      medicinesCount: m._count.medicines,
      createdAt: m.createdAt.toISOString().split("T")[0],
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error("getManufacturersAction error:", error);
    return { success: false, error: "Failed to retrieve manufacturers." };
  }
}

export async function createManufacturerAction(data: ManufacturerInput): Promise<ActionResult> {
  try {
    const parsed = manufacturerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: "Apex Pharma Distributors Ltd.", country: "Pakistan", currency: "PKR" },
      });
    }

    const manufacturer = await prisma.manufacturer.create({
      data: {
        companyId: company.id,
        name: parsed.data.name.trim(),
        code: parsed.data.code?.trim() || null,
        contactPerson: parsed.data.contactPerson?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        email: parsed.data.email?.trim() || null,
        address: parsed.data.address?.trim() || null,
        country: parsed.data.country || "Pakistan",
        isActive: parsed.data.isActive ?? true,
      },
    });

    const userContext = await getCurrentUser();
    await recordAuditLog({
      action: "CREATE_MANUFACTURER",
      entityName: "Manufacturer",
      entityId: manufacturer.id,
      newValues: JSON.stringify(manufacturer),
      userId: userContext?.authUser.id,
    });

    revalidatePath("/manufacturers");
    revalidatePath("/medicines");
    return {
      success: true,
      message: `Manufacturer "${manufacturer.name}" registered successfully.`,
      data: manufacturer,
    };
  } catch (err: any) {
    console.error("createManufacturerAction error:", err);
    return { success: false, error: err.message || "Failed to create manufacturer." };
  }
}

export async function updateManufacturerAction(
  id: string,
  data: ManufacturerInput
): Promise<ActionResult> {
  try {
    const parsed = manufacturerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const existing = await prisma.manufacturer.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Manufacturer not found." };
    }

    const updated = await prisma.manufacturer.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        code: parsed.data.code?.trim() || null,
        contactPerson: parsed.data.contactPerson?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        email: parsed.data.email?.trim() || null,
        address: parsed.data.address?.trim() || null,
        country: parsed.data.country || "Pakistan",
        isActive: parsed.data.isActive ?? true,
      },
    });

    const userContext = await getCurrentUser();
    await recordAuditLog({
      action: "UPDATE_MANUFACTURER",
      entityName: "Manufacturer",
      entityId: updated.id,
      oldValues: JSON.stringify(existing),
      newValues: JSON.stringify(updated),
      userId: userContext?.authUser.id,
    });

    revalidatePath("/manufacturers");
    revalidatePath("/medicines");
    return {
      success: true,
      message: `Manufacturer "${updated.name}" updated successfully.`,
      data: updated,
    };
  } catch (err: any) {
    console.error("updateManufacturerAction error:", err);
    return { success: false, error: err.message || "Failed to update manufacturer." };
  }
}

export async function toggleManufacturerStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const updated = await prisma.manufacturer.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/manufacturers");
    revalidatePath("/medicines");
    return {
      success: true,
      message: `Manufacturer status updated to ${isActive ? "Active" : "Inactive"}.`,
      data: updated,
    };
  } catch (err: any) {
    return { success: false, error: "Failed to update manufacturer status." };
  }
}

export async function deleteManufacturerAction(id: string): Promise<ActionResult> {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { medicines: true },
        },
      },
    });

    if (!manufacturer) {
      return { success: false, error: "Manufacturer not found." };
    }

    if (manufacturer._count.medicines > 0) {
      return {
        success: false,
        canDeactivate: true,
        error: `Cannot permanently delete "${manufacturer.name}" because ${manufacturer._count.medicines} medicine catalog record(s) depend on it. Please use "Deactivate" to archive this manufacturer instead.`,
      };
    }

    await prisma.manufacturer.delete({ where: { id } });

    const userContext = await getCurrentUser();
    await recordAuditLog({
      action: "DELETE_MANUFACTURER",
      entityName: "Manufacturer",
      entityId: id,
      oldValues: JSON.stringify(manufacturer),
      userId: userContext?.authUser.id,
    });

    revalidatePath("/manufacturers");
    revalidatePath("/medicines");
    return {
      success: true,
      message: `Manufacturer "${manufacturer.name}" permanently deleted.`,
    };
  } catch (err: any) {
    return { success: false, error: "Failed to delete manufacturer." };
  }
}
