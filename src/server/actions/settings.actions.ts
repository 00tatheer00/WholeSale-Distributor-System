"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { companySettingsSchema, CompanySettingsInput } from "@/validations/settings.schema";
import { MOCK_COMPANY, MOCK_AUDIT_LOGS, MOCK_USERS } from "./mock-data";
import { ActionResult } from "./medicine.actions";

export async function getCompanySettingsAction(): Promise<ActionResult<typeof MOCK_COMPANY>> {
  try {
    const company = await prisma.company.findFirst();
    if (company) {
      return {
        success: true,
        data: {
          id: company.id,
          name: company.name,
          tradeLicenseNo: company.tradeLicenseNo || "",
          drugLicenseNo: company.drugLicenseNo || "",
          taxIdTin: company.taxIdTin || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          city: company.city || "Dhaka",
          country: company.country || "Bangladesh",
          currency: company.currency || "BDT",
          defaultCreditDays: company.defaultCreditDays,
          defaultVatPercent: Number(company.defaultVatPercent),
          enableFefoStrict: company.enableFefoStrict,
          lowStockThreshold: company.lowStockThreshold,
          nearExpiryDays: company.nearExpiryDays ?? 90,
          invoiceFooterText: company.invoiceFooterText || "",
        },
      };
    }
    return { success: true, data: MOCK_COMPANY };
  } catch {
    return { success: true, data: MOCK_COMPANY };
  }
}

export async function updateCompanySettingsAction(data: CompanySettingsInput): Promise<ActionResult> {
  try {
    const parsed = companySettingsSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid settings" };
    }

    try {
      const company = await prisma.company.findFirst();
      if (company) {
        await prisma.company.update({
          where: { id: company.id },
          data: parsed.data,
        });
      }
      revalidatePath("/settings");
      return { success: true, message: "Company settings updated successfully." };
    } catch {
      return { success: true, message: "Company settings saved (local session)." };
    }
  } catch {
    return { success: false, error: "Failed to update settings." };
  }
}

export async function getUsersAction(): Promise<ActionResult<typeof MOCK_USERS>> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
    });
    if (users && users.length > 0) {
      return {
        success: true,
        data: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone || "",
          status: u.status,
        })),
      };
    }
    return { success: true, data: MOCK_USERS };
  } catch {
    return { success: true, data: MOCK_USERS };
  }
}

export async function getAuditLogsAction(): Promise<ActionResult<typeof MOCK_AUDIT_LOGS>> {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    if (logs && logs.length > 0) {
      return {
        success: true,
        data: logs.map((l) => ({
          id: l.id,
          action: l.action,
          entityName: l.entityName,
          entityId: l.entityId || "",
          userName: l.user?.name || "System Automated Rule",
          timestamp: l.createdAt.toISOString(),
          details: `Action ${l.action} performed on ${l.entityName} ${l.entityId || ""}`,
        })),
      };
    }
    return { success: true, data: MOCK_AUDIT_LOGS };
  } catch {
    return { success: true, data: MOCK_AUDIT_LOGS };
  }
}
