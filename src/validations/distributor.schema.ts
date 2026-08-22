import { z } from "zod";

export const distributorSchema = z.object({
  name: z.string().min(2, "Sales representative name is required").max(100),
  phone: z.string().min(6, "Valid phone number required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  assignedTerritory: z.string().min(2, "Territory name is required"),
  dailyRouteBeat: z.string().optional().nullable(),
  monthlySalesTarget: z.coerce.number().min(0).default(500000),
  commissionRatePercent: z.coerce.number().min(0).max(50).default(2.5),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]).default("ACTIVE"),
});

export type DistributorInput = z.infer<typeof distributorSchema>;
