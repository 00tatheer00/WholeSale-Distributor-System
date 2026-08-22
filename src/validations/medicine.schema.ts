import { z } from "zod";

export const dosageFormEnum = z.enum([
  "TABLET",
  "CAPSULE",
  "SYRUP",
  "INJECTION",
  "OINTMENT",
  "SUSPENSION",
  "IV_INFUSION",
  "DROPS",
  "INHALER",
  "OTHER",
]);

export const storageConditionEnum = z.enum([
  "ROOM_TEMPERATURE",
  "COLD_CHAIN_2_TO_8_C",
  "CONTROLLED_SUBSTANCE_NARCOTIC",
]);

export const recordStatusEnum = z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"]);

export const medicineSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters").max(100),
  genericName: z.string().min(2, "Generic name must be at least 2 characters").max(150),
  strength: z.string().min(1, "Dosage strength is required (e.g. 500mg, 10ml)"),
  dosageForm: dosageFormEnum.default("TABLET"),
  categoryId: z.string().min(1, "Please select a medicine category"),
  supplierId: z.string().optional().nullable(),
  unitTradePrice: z.coerce.number().min(0.01, "Trade price must be greater than 0"),
  unitMrp: z.coerce.number().min(0.01, "MRP must be greater than 0"),
  wholesaleBasePrice: z.coerce.number().min(0.01, "Wholesale price must be greater than 0"),
  vatPercent: z.coerce.number().min(0).max(100).default(0),
  storageCondition: storageConditionEnum.default("ROOM_TEMPERATURE"),
  reorderAlertLevel: z.coerce.number().int().min(1).default(50),
  isPrescriptionRequired: z.boolean().default(true),
  isColdChain: z.boolean().default(false),
  isNarcotic: z.boolean().default(false),
  primaryUnitName: z.string().default("Box"),
  secondaryUnitName: z.string().default("Strip"),
  unitConversionRatio: z.coerce.number().int().min(1).default(10),
  status: recordStatusEnum.default("ACTIVE"),
});

export type MedicineInput = z.infer<typeof medicineSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
