import { z } from "zod";

export const customerTypeEnum = z.enum([
  "RETAIL_PHARMACY",
  "HOSPITAL_DISPENSARY",
  "CLINIC_INSTITUTION",
  "SUB_DISTRIBUTOR",
]);

export const customerStatusEnum = z.enum(["ACTIVE", "BLOCKED_OVERDUE", "INACTIVE"]);

export const customerSchema = z.object({
  tradeName: z.string().min(2, "Pharmacy / Institutional name is required").max(150),
  proprietorName: z.string().optional().nullable(),
  customerType: customerTypeEnum.default("RETAIL_PHARMACY"),
  customerCode: z.string().optional().nullable(),
  drugLicenseNo: z.string().min(2, "Drug license number is mandatory for wholesale billing"),
  drugLicenseExpiry: z.string().min(1, "Drug license expiry date is required"),
  tradeLicenseNo: z.string().optional().nullable(),
  taxIdTin: z.string().optional().nullable(),
  phone: z.string().min(6, "Valid phone number required"),
  alternatePhone: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  deliveryAddress: z.string().min(3, "Delivery address is required"),
  city: z.string().optional().nullable(),
  assignedRoute: z.string().optional().nullable(),
  creditLimit: z.coerce.number().min(0, "Credit limit must be 0 or positive").default(100000),
  maxDueDays: z.coerce.number().int().min(1).max(180).default(30),
  openingBalance: z.coerce.number().min(0, "Opening balance cannot be negative").default(0),
  defaultDiscountPercent: z.coerce.number().min(0).max(100).default(0),
  status: customerStatusEnum.default("ACTIVE"),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = customerSchema.omit({
  openingBalance: true, // Immutable financial balance
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

