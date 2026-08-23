export type StockMovementTypeEnum =
  | "PURCHASE_IN"
  | "SALE_OUT"
  | "SALE_CANCEL_RETURN"
  | "PURCHASE_CANCEL_RETURN"
  | "MANUAL_IN"
  | "MANUAL_OUT"
  | "DAMAGE"
  | "EXPIRED"
  | "ADJUSTMENT";

export type StockAdjustmentTypeEnum =
  | "DAMAGE_WRITE_OFF"
  | "EXPIRY_REMOVAL"
  | "COUNT_DISCREPANCY_ADD"
  | "COUNT_DISCREPANCY_DEDUCT"
  | "RETURN_TO_SUPPLIER"
  | "SAMPLE_GIVEN";

export interface StockMovementRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  batchId: string;
  batchNumber: string;
  warehouseName?: string;
  movementType: StockMovementTypeEnum;
  quantityDelta: number;
  quantityBefore: number;
  quantityAfter: number;
  unitCostPrice: number;
  referenceNumber?: string | null;
  reason?: string | null;
  notes?: string | null;
  userName?: string | null;
  createdAt: string;
}

export interface StockAdjustmentRecord {
  id: string;
  batchId: string;
  batchNumber: string;
  medicineId: string;
  medicineName: string;
  adjustmentType: StockAdjustmentTypeEnum;
  quantityBefore: number;
  quantityDelta: number;
  quantityAfter: number;
  unitCostPrice: number;
  totalLossAmount: number;
  reason: string;
  referenceNumber?: string | null;
  userName?: string | null;
  createdAt: string;
}

export interface InventoryItemRecord {
  id: string;
  batchId: string;
  batchNumber: string;
  medicineId: string;
  brandName: string;
  genericName: string;
  skuCode?: string | null;
  dosageForm: string;
  strength: string;
  categoryName: string;
  supplierName: string;
  warehouseName: string;
  rackName: string;
  manufacturingDate?: string | null;
  expiryDate: string;
  daysToExpiry: number;
  expiryStatus: "ACTIVE" | "NEAR_EXPIRY_WARNING" | "NEAR_EXPIRY_CRITICAL" | "EXPIRED";
  purchaseCostPrice: number;
  tradePrice: number;
  mrp: number;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  primaryUnitName: string;
  reorderAlertLevel: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isColdChain: boolean;
  isNarcotic: boolean;
  status: string;
}

export interface InventorySummaryMetrics {
  totalInventoryItems: number;
  totalStockUnits: number;
  inventoryPurchaseValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  nearExpiryCount: number;
  expiredCount: number;
}
