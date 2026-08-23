"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  companySettingsSchema,
  CompanySettingsInput,
  userProfileSchema,
  UserProfileInput,
  userManagementSchema,
  UserManagementInput,
} from "@/validations/settings.schema";
import { recordAuditLog, getAuditLogs, AuditLogQueryParams } from "@/server/services/audit.service";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getCompanySettingsAction(): Promise<ActionResult<any>> {
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
          city: company.city || "Kabul",
          country: company.country || "Afghanistan",
          currency: company.currency || "AFN",
          logoUrl: company.logoUrl || null,
          invoiceFooterText: company.invoiceFooterText || "Goods once sold cannot be returned without original cash memo & regulatory compliance verification.",
          
          // Invoice settings
          invoicePrefix: "INV-",
          showTaxOnInvoice: true,
          showDiscountOnInvoice: true,
          showBatchOnInvoice: true,
          showExpiryOnInvoice: true,

          // Tax & Discount
          defaultVatPercent: Number(company.defaultVatPercent),
          enableGlobalDiscount: true,
          maxDiscountPercent: 20,

          // Inventory & FEFO
          enableFefoStrict: company.enableFefoStrict,
          allowExpiredSales: false,
          lowStockThreshold: company.lowStockThreshold,
          nearExpiryDays: company.nearExpiryDays ?? 90,

          // Credit
          enforceCreditLimit: true,
          defaultCreditDays: company.defaultCreditDays,
          creditWarningThresholdPercent: 80,
          requireApprovalOnCreditExceed: true,

          // Notifications
          notifyLowStock: true,
          notifyNearExpiry: true,
          notifyExpiredStock: true,
          notifyCreditBreach: true,
          notifySupplierDues: true,
        },
      };
    }

    return {
      success: true,
      data: {
        name: "Apex Pharma Dist Ltd.",
        tradeLicenseNo: "TR-KBL-2026-8891",
        drugLicenseNo: "AFG-DL-9842-W",
        taxIdTin: "TIN-89342019-2026",
        email: "accounts@apexpharma.af",
        phone: "+93 70 123 4567",
        address: "District 4, Shar-e-Naw",
        city: "Kabul",
        country: "Afghanistan",
        currency: "AFN",
        invoiceFooterText: "Goods once sold cannot be returned without original cash memo & DGDA compliance verification.",
        defaultVatPercent: 0,
        enableFefoStrict: true,
        allowExpiredSales: false,
        lowStockThreshold: 20,
        nearExpiryDays: 90,
        defaultCreditDays: 30,
      },
    };
  } catch (error: any) {
    console.error("getCompanySettingsAction error:", error);
    return { success: false, error: "Failed to load company settings." };
  }
}

export async function updateCompanySettingsAction(data: CompanySettingsInput): Promise<ActionResult> {
  try {
    const parsed = companySettingsSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid settings data" };
    }

    const company = await prisma.company.findFirst();
    const oldValues = company ? { ...company } : null;

    if (company) {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          name: parsed.data.name,
          tradeLicenseNo: parsed.data.tradeLicenseNo,
          drugLicenseNo: parsed.data.drugLicenseNo,
          taxIdTin: parsed.data.taxIdTin,
          email: parsed.data.email,
          phone: parsed.data.phone,
          address: parsed.data.address,
          city: parsed.data.city,
          country: parsed.data.country,
          currency: parsed.data.currency,
          logoUrl: parsed.data.logoUrl,
          invoiceFooterText: parsed.data.invoiceFooterText,
          defaultCreditDays: parsed.data.defaultCreditDays,
          defaultVatPercent: parsed.data.defaultVatPercent,
          enableFefoStrict: parsed.data.enableFefoStrict,
          lowStockThreshold: parsed.data.lowStockThreshold,
          nearExpiryDays: parsed.data.nearExpiryDays,
        },
      });
    }

    // Record Immutable Audit Log
    await recordAuditLog({
      action: "UPDATE_COMPANY_SETTINGS",
      entityName: "CompanySettings",
      entityId: company?.id || "SYSTEM",
      oldValues,
      newValues: parsed.data,
    });

    revalidatePath("/settings");
    return { success: true, message: "System & business settings updated successfully." };
  } catch (error: any) {
    console.error("updateCompanySettingsAction error:", error);
    return { success: false, error: error.message || "Failed to update settings." };
  }
}

export async function getAuditLogsAction(params?: AuditLogQueryParams): Promise<ActionResult<any>> {
  try {
    const result = await getAuditLogs(params);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("getAuditLogsAction error:", error);
    return { success: false, error: "Failed to retrieve audit trail." };
  }
}

export async function getUsersAction(): Promise<ActionResult<any[]>> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      include: {
        distributorProfile: true,
      },
    });

    return {
      success: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "N/A",
        role: u.role,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("getUsersAction error:", error);
    return { success: false, error: "Failed to retrieve user accounts." };
  }
}

export async function updateUserProfileAction(data: UserProfileInput): Promise<ActionResult> {
  try {
    const parsed = userProfileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid profile data." };
    }

    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
      await prisma.user.update({
        where: { id: firstUser.id },
        data: {
          name: parsed.data.name,
          phone: parsed.data.phone,
        },
      });

      await recordAuditLog({
        action: "UPDATE_USER_PROFILE",
        entityName: "User",
        entityId: firstUser.id,
        newValues: parsed.data,
      });
    }

    revalidatePath("/settings/profile");
    return { success: true, message: "Profile updated successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile." };
  }
}
