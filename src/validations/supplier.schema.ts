import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "Company / Manufacturer name is required").max(150),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(6, "Valid phone number required"),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default("Bangladesh"),
  drugLicenseNo: z.string().optional().nullable(),
  tradeLicenseNo: z.string().optional().nullable(),
  taxIdTin: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountNo: z.string().optional().nullable(),
  creditDays: z.coerce.number().int().min(0).default(30),
  creditLimit: z.coerce.number().min(0).default(500000),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
