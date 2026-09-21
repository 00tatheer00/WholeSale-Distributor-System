import { z } from "zod";

export const manufacturerSchema = z.object({
  name: z.string().min(2, "Manufacturer name must be at least 2 characters").max(100),
  code: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  country: z.string().default("Pakistan"),
  isActive: z.boolean().default(true),
});

export type ManufacturerInput = z.infer<typeof manufacturerSchema>;
