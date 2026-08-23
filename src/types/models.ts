export interface CategoryRecord {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
  medicineCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineRecord {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  skuCode?: string | null;
  darNumber?: string | null;
  categoryId: string;
  categoryName: string;
  supplierId?: string | null;
  supplierName?: string | null;
  unitTradePrice: number;
  unitMrp: number;
  wholesaleBasePrice: number;
  vatPercent: number;
  storageCondition: string;
  reorderAlertLevel: number;
  totalStockOnHand: number;
  isPrescriptionRequired: boolean;
  isColdChain: boolean;
  isNarcotic: boolean;
  primaryUnitName: string;
  packSize?: string | null;
  stripPerBox: number;
  unitsPerStrip: number;
  batchesCount?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
  code?: string | null;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  drugLicenseNo: string;
  tradeLicenseNo: string;
  taxIdTin: string;
  creditDays: number;
  creditLimit: number;
  openingBalance: number;
  currentPayable: number;
  totalPaid: number;
  status: string;
  totalPurchases: number;
  purchasesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierLedgerEntry {
  id: string;
  date: string;
  type: "PURCHASE" | "PAYMENT" | "OPENING_BALANCE" | "CANCELLATION_REVERSAL";
  referenceNumber: string;
  description: string;
  debit: number;   // In B2B AP accounting: Purchase / Initial Due increases payable (Debit to Expense / Credit to AP)
  credit: number;  // Payment reduces payable
  runningBalance: number;
}

export interface SupplierPaymentRecord {
  id: string;
  voucherNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseId?: string | null;
  purchaseNumber?: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string | null;
  bankName?: string | null;
  chequeNumber?: string | null;
  chequeDate?: string | null;
  notes?: string | null;
  status: "CONFIRMED" | "VOIDED";
  createdByName?: string;
  createdAt: string;
}

export interface SupplierDetailRecord extends SupplierRecord {
  recentPurchases: PurchaseRecord[];
  recentPayments: SupplierPaymentRecord[];
  ledger: SupplierLedgerEntry[];
  suppliedMedicinesCount: number;
}

export interface PurchaseItemDetailRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName?: string;
  dosageForm?: string;
  strength?: string;
  batchNumber: string;
  mfgDate?: string | null;
  expiryDate: string;
  quantity: number;
  bonusQuantity: number;
  unitPurchaseCost: number;
  unitTradePrice: number;
  unitMrp: number;
  discountPercent: number;
  taxPercent: number;
  subtotal: number;
  totalAmount: number;
  createdBatchId?: string | null;
}

export interface PurchaseRecord {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId?: string | null;
  warehouseName?: string;
  purchaseDate: string;
  expectedDeliveryDate?: string | null;
  supplierInvoiceNo?: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  status: "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
  itemsCount: number;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  createdByName?: string;
  createdAt?: string;
}

export interface PurchaseDetailRecord extends PurchaseRecord {
  items: PurchaseItemDetailRecord[];
  payments: SupplierPaymentRecord[];
  supplierPhone?: string;
  supplierEmail?: string;
  supplierAddress?: string;
}

export interface BatchRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  batchNumber: string;
  manufacturingDate?: string;
  expiryDate: string;
  quantityOnHand: number;
  initialQuantity: number;
  unitCostPrice: number;
  unitTradePrice: number;
  unitMrp: number;
  warehouseId: string;
  warehouseName: string;
  rackName: string;
  status: string;
  isQuarantined: boolean;
}

export interface CustomerRecord {
  id: string;
  tradeName: string;
  proprietorName: string;
  customerType: string;
  drugLicenseNo: string;
  drugLicenseExpiry: string;
  tradeLicenseNo: string;
  taxIdTin: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  city: string;
  assignedRoute: string;
  creditLimit: number;
  maxDueDays: number;
  currentDue: number;
  oldestOverdueDays: number;
  defaultDiscountPercent: number;
  status: string;
  totalSales: number;
}

export interface DistributorRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  assignedTerritory: string;
  dailyRouteBeat: string;
  monthlySalesTarget: number;
  currentMonthSales: number;
  recoveryAmount: number;
  commissionRatePercent: number;
  earnedCommission: number;
  status: string;
}

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  distributorName: string;
  chequeNumber?: string;
  bankName?: string;
  chequeStatus?: string;
}

export interface InvoiceItemRecord {
  medicineName: string;
  genericName?: string;
  dosageForm?: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  bonusQuantity?: number;
  unitPrice: number;
  tradePrice?: number;
  mrp?: number;
  totalAmount: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  saleOrderId: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  salesmanId?: string;
  salesmanName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  cogsTotal: number;
  grossProfit: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  deliveryStatus: string;
  items: InvoiceItemRecord[];
}

export interface FinancialSummary {
  grossRevenue: number;
  tradeDiscounts: number;
  netRevenue: number;
  cogsTotal: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: number;
  netProfit: number;
  netProfitMargin: number;
  totalCustomerReceivables: number;
  overdueReceivables: number;
  totalSupplierPayables: number;
  stockInventoryValuation: number;
}

export interface MonthlyTrendData {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

export interface AgingBucket {
  customerName: string;
  current: number;
  days31To60: number;
  days61To90: number;
  daysOver90: number;
  totalDue: number;
  status: string;
}

