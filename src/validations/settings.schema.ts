import { z } from "zod";

export const companySettingsSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  tradeLicenseNo: z.string().optional().nullable(),
  drugLicenseNo: z.string().optional().nullable(),
  taxIdTin: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default("Bangladesh"),
  currency: z.string().default("BDT"),
  logoUrl: z.string().optional().nullable(),
  invoiceFooterText: z.string().optional().nullable(),
  
  // Invoice Configuration
  invoicePrefix: z.string().default("INV-"),
  showTaxOnInvoice: z.boolean().default(true),
  showDiscountOnInvoice: z.boolean().default(true),
  showBatchOnInvoice: z.boolean().default(true),
  showExpiryOnInvoice: z.boolean().default(true),
  
  // Tax & Discount
  defaultVatPercent: z.coerce.number().min(0, "VAT cannot be negative").max(100, "Max 100%").default(0),
  enableGlobalDiscount: z.boolean().default(true),
  maxDiscountPercent: z.coerce.number().min(0).max(100).default(20),

  // Inventory & FEFO
  enableFefoStrict: z.boolean().default(true),
  allowExpiredSales: z.boolean().default(false), // STRICT SAFETY: Default NEVER sell expired
  lowStockThreshold: z.coerce.number().int().min(1).default(20),
  nearExpiryDays: z.coerce.number().int().min(1).default(90),

  // Customer Credit Policy
  enforceCreditLimit: z.boolean().default(true),
  defaultCreditDays: z.coerce.number().int().min(0).default(30),
  creditWarningThresholdPercent: z.coerce.number().min(1).max(100).default(80),
  requireApprovalOnCreditExceed: z.boolean().default(true),

  // Notification Toggles
  notifyLowStock: z.boolean().default(true),
  notifyNearExpiry: z.boolean().default(true),
  notifyExpiredStock: z.boolean().default(true),
  notifyCreditBreach: z.boolean().default(true),
  notifySupplierDues: z.boolean().default(true),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

export const userProfileSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(6, "Valid phone number required"),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

export const userManagementSchema = z.object({
  name: z.string().min(2, "User name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  role: z.enum([
    "SUPER_ADMIN",
    "SALES_MANAGER",
    "SALESMAN",
    "WAREHOUSE_MANAGER",
    "INVENTORY_OFFICER",
    "ACCOUNTS_OFFICER",
    "CASHIER",
  ]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

export type UserManagementInput = z.infer<typeof userManagementSchema>;
