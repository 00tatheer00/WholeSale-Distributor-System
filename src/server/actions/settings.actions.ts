"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  companySettingsSchema,
  CompanySettingsInput,
  userProfileSchema,
  UserProfileInput,
  userManagementSchema,
  UserManagementInput,
  createUserSchema,
  CreateUserInput,
  updateUserSchema,
  UpdateUserInput,
  adminResetPasswordSchema,
  AdminResetPasswordInput,
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
          city: company.city || "Karachi",
          country: company.country || "Pakistan",
          currency: company.currency || "PKR",
          logoUrl: company.logoUrl || null,
          invoiceFooterText: company.invoiceFooterText || "Goods once sold cannot be returned without original cash memo & DRAP compliance verification.",
          
          // Invoice settings
          invoicePrefix: company.invoicePrefix ?? "INV-",
          showTaxOnInvoice: company.showTaxOnInvoice ?? true,
          showDiscountOnInvoice: company.showDiscountOnInvoice ?? true,
          showBatchOnInvoice: company.showBatchOnInvoice ?? true,
          showExpiryOnInvoice: company.showExpiryOnInvoice ?? true,

          // Tax & Discount
          defaultVatPercent: Number(company.defaultVatPercent),
          enableGlobalDiscount: company.enableGlobalDiscount ?? true,
          maxDiscountPercent: Number(company.maxDiscountPercent ?? 20),

          // Inventory & FEFO
          enableFefoStrict: company.enableFefoStrict ?? true,
          allowExpiredSales: company.allowExpiredSales ?? false,
          lowStockThreshold: company.lowStockThreshold ?? 20,
          nearExpiryDays: company.nearExpiryDays ?? 90,

          // Credit
          enforceCreditLimit: company.enforceCreditLimit ?? true,
          defaultCreditDays: company.defaultCreditDays ?? 30,
          creditWarningThresholdPercent: Number(company.creditWarningThresholdPercent ?? 80),
          requireApprovalOnCreditExceed: company.requireApprovalOnCreditExceed ?? true,

          // Notifications
          notifyLowStock: company.notifyLowStock ?? true,
          notifyNearExpiry: company.notifyNearExpiry ?? true,
          notifyExpiredStock: company.notifyExpiredStock ?? true,
          notifyCreditBreach: company.notifyCreditBreach ?? true,
          notifySupplierDues: company.notifySupplierDues ?? true,
        },
      };
    }

    return {
      success: true,
      data: {
        name: "PharmaDist Wholesale Medicine Distribution Ltd.",
        tradeLicenseNo: "TR-KHI-2026-8891",
        drugLicenseNo: "DRAP-DL-9842-W",
        taxIdTin: "NTN-89342019-2026",
        email: "info@pharmadist.pk",
        phone: "+92 21 3589 1234",
        address: "Plot 45, Sector 15, Korangi Industrial Area",
        city: "Karachi",
        country: "Pakistan",
        currency: "PKR",
        invoiceFooterText: "Goods once sold cannot be returned without original cash memo & DRAP compliance verification.",
        invoicePrefix: "INV-",
        showTaxOnInvoice: true,
        showDiscountOnInvoice: true,
        showBatchOnInvoice: true,
        showExpiryOnInvoice: true,
        defaultVatPercent: 0,
        enableGlobalDiscount: true,
        maxDiscountPercent: 20,
        enableFefoStrict: true,
        allowExpiredSales: false,
        lowStockThreshold: 20,
        nearExpiryDays: 90,
        defaultCreditDays: 30,
        enforceCreditLimit: true,
        creditWarningThresholdPercent: 80,
        requireApprovalOnCreditExceed: true,
        notifyLowStock: true,
        notifyNearExpiry: true,
        notifyExpiredStock: true,
        notifyCreditBreach: true,
        notifySupplierDues: true,
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

    let company = await prisma.company.findFirst();
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

          invoicePrefix: parsed.data.invoicePrefix,
          showTaxOnInvoice: parsed.data.showTaxOnInvoice,
          showDiscountOnInvoice: parsed.data.showDiscountOnInvoice,
          showBatchOnInvoice: parsed.data.showBatchOnInvoice,
          showExpiryOnInvoice: parsed.data.showExpiryOnInvoice,
          enableGlobalDiscount: parsed.data.enableGlobalDiscount,
          maxDiscountPercent: parsed.data.maxDiscountPercent,
          allowExpiredSales: parsed.data.allowExpiredSales,
          enforceCreditLimit: parsed.data.enforceCreditLimit,
          creditWarningThresholdPercent: parsed.data.creditWarningThresholdPercent,
          requireApprovalOnCreditExceed: parsed.data.requireApprovalOnCreditExceed,
          notifyLowStock: parsed.data.notifyLowStock,
          notifyNearExpiry: parsed.data.notifyNearExpiry,
          notifyExpiredStock: parsed.data.notifyExpiredStock,
          notifyCreditBreach: parsed.data.notifyCreditBreach,
          notifySupplierDues: parsed.data.notifySupplierDues,
        },
      });
    } else {
      company = await prisma.company.create({
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

          invoicePrefix: parsed.data.invoicePrefix,
          showTaxOnInvoice: parsed.data.showTaxOnInvoice,
          showDiscountOnInvoice: parsed.data.showDiscountOnInvoice,
          showBatchOnInvoice: parsed.data.showBatchOnInvoice,
          showExpiryOnInvoice: parsed.data.showExpiryOnInvoice,
          enableGlobalDiscount: parsed.data.enableGlobalDiscount,
          maxDiscountPercent: parsed.data.maxDiscountPercent,
          allowExpiredSales: parsed.data.allowExpiredSales,
          enforceCreditLimit: parsed.data.enforceCreditLimit,
          creditWarningThresholdPercent: parsed.data.creditWarningThresholdPercent,
          requireApprovalOnCreditExceed: parsed.data.requireApprovalOnCreditExceed,
          notifyLowStock: parsed.data.notifyLowStock,
          notifyNearExpiry: parsed.data.notifyNearExpiry,
          notifyExpiredStock: parsed.data.notifyExpiredStock,
          notifyCreditBreach: parsed.data.notifyCreditBreach,
          notifySupplierDues: parsed.data.notifySupplierDues,
        },
      });
    }

    // Record Immutable Audit Log
    await recordAuditLog({
      action: "UPDATE_COMPANY_SETTINGS",
      entityName: "CompanySettings",
      entityId: company?.id || "SYSTEM",
      oldValues,
      newValues: JSON.stringify(parsed.data),
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

export async function createUserAction(data: CreateUserInput): Promise<ActionResult> {
  try {
    const parsed = createUserSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid staff data." };
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: false, error: `An account with email "${normalizedEmail}" already exists.` };
    }

    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: "PharmaDist Wholesale Ltd.",
        },
      });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        companyId: company.id,
        name: parsed.data.name.trim(),
        email: normalizedEmail,
        phone: parsed.data.phone?.trim() || null,
        role: parsed.data.role,
        status: parsed.data.status,
        passwordHash,
      },
    });

    await recordAuditLog({
      action: "CREATE_USER_ACCOUNT",
      entityName: "User",
      entityId: newUser.id,
      newValues: JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      }),
    });

    revalidatePath("/settings");
    return { success: true, message: `Staff member "${newUser.name}" enrolled successfully.` };
  } catch (error: any) {
    console.error("createUserAction error:", error);
    return { success: false, error: error.message || "Failed to create user account." };
  }
}

export async function updateUserAction(data: UpdateUserInput): Promise<ActionResult> {
  try {
    const parsed = updateUserSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid staff update data." };
    }

    const user = await prisma.user.findUnique({
      where: { id: parsed.data.id },
    });

    if (!user) {
      return { success: false, error: "Staff member record not found." };
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    if (normalizedEmail !== user.email) {
      const emailConflict = await prisma.user.findFirst({
        where: { email: normalizedEmail, id: { not: user.id } },
      });
      if (emailConflict) {
        return { success: false, error: `Email "${normalizedEmail}" is already assigned to another user.` };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name.trim(),
        email: normalizedEmail,
        phone: parsed.data.phone?.trim() || null,
        role: parsed.data.role,
        status: parsed.data.status,
      },
    });

    await recordAuditLog({
      action: "UPDATE_USER_ACCOUNT",
      entityName: "User",
      entityId: user.id,
      oldValues: { name: user.name, email: user.email, role: user.role, status: user.status },
      newValues: JSON.stringify({
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      }),
    });

    revalidatePath("/settings");
    return { success: true, message: `Account for "${updatedUser.name}" updated successfully.` };
  } catch (error: any) {
    console.error("updateUserAction error:", error);
    return { success: false, error: error.message || "Failed to update user account." };
  }
}

export async function resetUserPasswordAction(data: AdminResetPasswordInput): Promise<ActionResult> {
  try {
    const parsed = adminResetPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid password reset data." };
    }

    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
    });

    if (!user) {
      return { success: false, error: "Staff member not found." };
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await recordAuditLog({
      action: "RESET_USER_PASSWORD",
      entityName: "User",
      entityId: user.id,
      newValues: JSON.stringify({ message: "Password reset by administrator." }),
    });

    revalidatePath("/settings");
    return { success: true, message: `Password for "${user.name}" has been securely reset.` };
  } catch (error: any) {
    console.error("resetUserPasswordAction error:", error);
    return { success: false, error: error.message || "Failed to reset password." };
  }
}

export async function toggleUserStatusAction(userId: string, currentStatus: string): Promise<ActionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "Staff account not found." };
    }

    // Safety guard: prevent self-deactivation of current logged-in administrator
    const cookieStore = await cookies();
    const sessionEmail = cookieStore.get("wmdms_session")?.value;
    if (sessionEmail && sessionEmail.toLowerCase() === user.email.toLowerCase()) {
      return {
        success: false,
        error: "Security Violation: You cannot deactivate your own currently active administrator session.",
      };
    }

    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await prisma.user.update({
      where: { id: user.id },
      data: { status: nextStatus },
    });

    await recordAuditLog({
      action: nextStatus === "ACTIVE" ? "ACTIVATE_USER_ACCOUNT" : "DEACTIVATE_USER_ACCOUNT",
      entityName: "User",
      entityId: user.id,
      oldValues: { status: user.status },
      newValues: JSON.stringify({ status: nextStatus }),
    });

    revalidatePath("/settings");
    return {
      success: true,
      message: `Account for "${user.name}" is now ${nextStatus === "ACTIVE" ? "Activated" : "Deactivated"}.`,
    };
  } catch (error: any) {
    console.error("toggleUserStatusAction error:", error);
    return { success: false, error: error.message || "Failed to change account status." };
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
        newValues: JSON.stringify(parsed.data),
      });
    }

    revalidatePath("/settings/profile");
    return { success: true, message: "Profile updated successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile." };
  }
}
