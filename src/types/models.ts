export interface MedicineRecord {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  categoryId: string;
  categoryName: string;
  supplierId: string;
  supplierName: string;
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
  status: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
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
  currentPayable: number;
  status: string;
  totalPurchases: number;
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

export interface PurchaseRecord {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  supplierInvoiceNo?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
  itemsCount: number;
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
