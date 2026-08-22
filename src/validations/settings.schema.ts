import { z } from "zod";

export const companySettingsSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  tradeLicenseNo: z.string().optional().nullable(),
  drugLicenseNo: z.string().optional().nullable(),
  taxIdTin: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default("Bangladesh"),
  currency: z.string().default("BDT"),
  defaultCreditDays: z.coerce.number().int().min(0).default(30),
  defaultVatPercent: z.coerce.number().min(0).max(100).default(0),
  enableFefoStrict: z.boolean().default(true),
  lowStockThreshold: z.coerce.number().int().min(1).default(20),
  nearExpiryDays: z.coerce.number().int().min(1).default(90),
  invoiceFooterText: z.string().optional().nullable(),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

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
