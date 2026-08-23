import {
  PrismaClient,
  PurchaseStatus,
  SaleStatus,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  DeliveryStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    console.error("🛑 DANGER: Transaction seeding is strictly blocked in production environment.");
    process.exit(1);
  }

  console.log("🌱 Injecting live wholesale transactions and records...");

  const company = await prisma.company.findFirst();
  if (!company) {
    console.error("Company not found. Run base seed first.");
    return;
  }

  const superAdmin = await prisma.user.findFirst({
    where: { email: "admin@pharmadist.com" },
  });
  if (!superAdmin) {
    console.error("Super Admin user not found.");
    return;
  }

  const warehouse = await prisma.warehouse.findFirst({
    where: { isDefault: true },
  });
  if (!warehouse) {
    console.error("Default warehouse not found.");
    return;
  }

  const supplierSquare = await prisma.supplier.findFirst({
    where: { name: { contains: "Square" } },
  });
  const supplierBeximco = await prisma.supplier.findFirst({
    where: { name: { contains: "Beximco" } },
  });

  const customerGreenLife = await prisma.customer.findFirst({
    where: { pharmacyName: { contains: "Green Life" } },
  });
  const customerPopular = await prisma.customer.findFirst({
    where: { pharmacyName: { contains: "Popular" } },
  });

  const distributor = await prisma.distributor.findFirst();

  const medNapa = await prisma.medicine.findFirst({
    where: { brandName: { contains: "Napa" } },
  });
  const medSeclo = await prisma.medicine.findFirst({
    where: { brandName: { contains: "Seclo" } },
  });
  const medMoxacil = await prisma.medicine.findFirst({
    where: { brandName: { contains: "Moxacil" } },
  });

  const batchNapa1 = await prisma.medicineBatch.findFirst({
    where: { batchNumber: { contains: "NPX-2025-01" } },
  });
  const batchNapa2 = await prisma.medicineBatch.findFirst({
    where: { batchNumber: { contains: "NPX-2025-02" } },
  });
  const batchSeclo1 = await prisma.medicineBatch.findFirst({
    where: { batchNumber: { contains: "SQ-SEC" } },
  });
  const batchMoxacil1 = await prisma.medicineBatch.findFirst({
    where: { batchNumber: { contains: "SQ-MOX" } },
  });

  // 1. Seed Real Purchase Orders if not present
  const existingPurchase = await prisma.purchase.findFirst({
    where: { purchaseNumber: "PO-2025-001" },
  });

  if (!existingPurchase && supplierSquare && medSeclo && medMoxacil) {
    await prisma.purchase.create({
      data: {
        purchaseNumber: "PO-2025-001",
        supplierId: supplierSquare.id,
        warehouseId: warehouse.id,
        createdById: superAdmin.id,
        supplierInvoiceNumber: "SQ-INV-99881",
        purchaseDate: new Date(),
        subtotalAmount: 188000.00,
        discountAmount: 0.00,
        taxAmount: 0.00,
        shippingCharges: 2000.00,
        grandTotal: 190000.00,
        paidAmount: 190000.00,
        dueAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        status: PurchaseStatus.RECEIVED,
        notes: "Square Pharma central distribution shipment received and verified under FEFO.",
        purchaseItems: {
          create: [
            {
              medicineId: medSeclo.id,
              batchNumber: "SQ-SEC-2025-99",
              mfgDate: new Date("2025-01-15"),
              expiryDate: new Date("2027-06-30"),
              quantity: 300,
              bonusQuantity: 10,
              unitPurchaseCost: 360.00,
              unitTradePrice: 425.00,
              unitMrp: 500.00,
              subtotal: 108000.00,
              totalAmount: 108000.00,
            },
            {
              medicineId: medMoxacil.id,
              batchNumber: "SQ-MOX-2025-44",
              mfgDate: new Date("2025-02-01"),
              expiryDate: new Date("2027-01-31"),
              quantity: 160,
              bonusQuantity: 5,
              unitPurchaseCost: 490.00,
              unitTradePrice: 580.00,
              unitMrp: 680.00,
              subtotal: 80000.00,
              totalAmount: 80000.00,
            },
          ],
        },
      },
    });
    console.log("✅ Seeded Purchase PO-2025-001");
  }

  const existingPurchase2 = await prisma.purchase.findFirst({
    where: { purchaseNumber: "PO-2025-002" },
  });

  if (!existingPurchase2 && supplierBeximco && medNapa) {
    await prisma.purchase.create({
      data: {
        purchaseNumber: "PO-2025-002",
        supplierId: supplierBeximco.id,
        warehouseId: warehouse.id,
        createdById: superAdmin.id,
        supplierInvoiceNumber: "BEX-INV-11029",
        purchaseDate: new Date(),
        subtotalAmount: 259000.00,
        discountAmount: 4000.00,
        taxAmount: 0.00,
        shippingCharges: 1500.00,
        grandTotal: 256500.00,
        paidAmount: 150000.00,
        dueAmount: 106500.00,
        paymentStatus: PaymentStatus.PARTIALLY_PAID,
        status: PurchaseStatus.RECEIVED,
        notes: "Beximco consignment received with cold chain temperature check passed.",
        purchaseItems: {
          create: [
            {
              medicineId: medNapa.id,
              batchNumber: "BEX-NPX-2025-01",
              mfgDate: new Date("2025-01-01"),
              expiryDate: new Date("2026-12-31"),
              quantity: 250,
              bonusQuantity: 10,
              unitPurchaseCost: 340.00,
              unitTradePrice: 400.00,
              unitMrp: 500.00,
              subtotal: 85000.00,
              totalAmount: 85000.00,
            },
            {
              medicineId: medNapa.id,
              batchNumber: "BEX-NPX-2025-02",
              mfgDate: new Date("2025-03-01"),
              expiryDate: new Date("2027-08-31"),
              quantity: 500,
              bonusQuantity: 20,
              unitPurchaseCost: 348.00,
              unitTradePrice: 400.00,
              unitMrp: 500.00,
              subtotal: 174000.00,
              totalAmount: 174000.00,
            },
          ],
        },
      },
    });
    console.log("✅ Seeded Purchase PO-2025-002");
  }

  // 2. Seed Real Sales Orders and Invoices if not present
  const existingSale1 = await prisma.sale.findFirst({
    where: { saleNumber: "ORD-2025-001" },
  });

  if (!existingSale1 && customerGreenLife && batchNapa1 && batchSeclo1 && batchMoxacil1 && medNapa && medSeclo && medMoxacil) {
    const sale1 = await prisma.sale.create({
      data: {
        saleNumber: "ORD-2025-001",
        customerId: customerGreenLife.id,
        distributorId: distributor?.id,
        createdById: superAdmin.id,
        saleDate: new Date(),
        subtotalAmount: 48500.00,
        discountAmount: 970.00,
        taxAmount: 0.00,
        deliveryCharge: 200.00,
        grandTotal: 47730.00,
        totalCogs: 40800.00,
        paidAmount: 47730.00,
        dueAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        deliveryStatus: DeliveryStatus.DELIVERED,
        status: SaleStatus.DELIVERED,
        notes: "Urgent pharmacy order fulfilled under FEFO dispatch.",
        saleItems: {
          create: [
            {
              medicineId: medNapa.id,
              batchId: batchNapa1.id,
              quantity: 50,
              bonusQuantity: 2,
              unitCostPrice: 340.00,
              unitTradePrice: 400.00,
              unitMrp: 500.00,
              lineCogs: 17000.00,
              lineTotal: 20000.00,
            },
            {
              medicineId: medSeclo.id,
              batchId: batchSeclo1.id,
              quantity: 50,
              bonusQuantity: 2,
              unitCostPrice: 360.00,
              unitTradePrice: 425.00,
              unitMrp: 500.00,
              lineCogs: 18000.00,
              lineTotal: 21250.00,
            },
            {
              medicineId: medMoxacil.id,
              batchId: batchMoxacil1.id,
              quantity: 12,
              bonusQuantity: 0,
              unitCostPrice: 490.00,
              unitTradePrice: 580.00,
              unitMrp: 680.00,
              lineCogs: 5880.00,
              lineTotal: 6960.00,
            },
          ],
        },
      },
    });

    const inv1 = await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2025-001",
        saleId: sale1.id,
        customerId: customerGreenLife.id,
        distributorId: distributor?.id,
        createdById: superAdmin.id,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotalAmount: 48500.00,
        discountAmount: 970.00,
        taxAmount: 0.00,
        deliveryCharge: 200.00,
        grandTotal: 47730.00,
        paidAmount: 47730.00,
        dueAmount: 0.00,
        paymentStatus: PaymentStatus.PAID,
        status: InvoiceStatus.PAID,
        notes: "Tax wholesale delivery invoice. Paid via Bank Transfer.",
      },
    });

    await prisma.customerPayment.create({
      data: {
        receiptNumber: "RCT-2025-001",
        customerId: customerGreenLife.id,
        distributorId: distributor?.id,
        createdById: superAdmin.id,
        amount: 47730.00,
        paymentDate: new Date(),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        bankName: "Dutch-Bangla Bank Ltd.",
        referenceNumber: "DBBL-TRX-998811",
        notes: "Full settlement for invoice INV-2025-001",
        paymentAllocations: {
          create: [{ invoiceId: inv1.id, allocatedAmount: 47730.00 }],
        },
      },
    });

    console.log("✅ Seeded Sale, Invoice & Payment INV-2025-001");
  }

  const existingSale2 = await prisma.sale.findFirst({
    where: { saleNumber: "ORD-2025-002" },
  });

  if (!existingSale2 && customerPopular && batchNapa2 && batchSeclo1 && medNapa && medSeclo) {
    const sale2 = await prisma.sale.create({
      data: {
        saleNumber: "ORD-2025-002",
        customerId: customerPopular.id,
        distributorId: distributor?.id,
        createdById: superAdmin.id,
        saleDate: new Date(),
        subtotalAmount: 128000.00,
        discountAmount: 3840.00,
        taxAmount: 0.00,
        deliveryCharge: 500.00,
        grandTotal: 124660.00,
        totalCogs: 106000.00,
        paidAmount: 80000.00,
        dueAmount: 44660.00,
        paymentStatus: PaymentStatus.PARTIALLY_PAID,
        deliveryStatus: DeliveryStatus.DELIVERED,
        status: SaleStatus.DELIVERED,
        notes: "Hospital weekly replenishment order.",
        saleItems: {
          create: [
            {
              medicineId: medNapa.id,
              batchId: batchNapa2.id,
              quantity: 150,
              bonusQuantity: 6,
              unitCostPrice: 348.00,
              unitTradePrice: 400.00,
              unitMrp: 500.00,
              lineCogs: 52200.00,
              lineTotal: 60000.00,
            },
            {
              medicineId: medSeclo.id,
              batchId: batchSeclo1.id,
              quantity: 160,
              bonusQuantity: 5,
              unitCostPrice: 360.00,
              unitTradePrice: 425.00,
              unitMrp: 500.00,
              lineCogs: 57600.00,
              lineTotal: 68000.00,
            },
          ],
        },
      },
    });

    const inv2 = await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2025-002",
        saleId: sale2.id,
        customerId: customerPopular.id,
        distributorId: distributor?.id,
        createdById: superAdmin.id,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        subtotalAmount: 128000.00,
        discountAmount: 3840.00,
        taxAmount: 0.00,
        deliveryCharge: 500.00,
        grandTotal: 124660.00,
        paidAmount: 80000.00,
        dueAmount: 44660.00,
        paymentStatus: PaymentStatus.PARTIALLY_PAID,
        status: InvoiceStatus.ISSUED,
        notes: "Partial payment received via Cheque #CHQ-88192.",
      },
    });

    await prisma.customer.update({
      where: { id: customerPopular.id },
      data: { currentDue: 44660.00 },
    });

    await prisma.customerPayment.create({
      data: {
        receiptNumber: "RCT-2025-002",
        customerId: customerPopular.id,
        distributorId: distributor?.id,
        createdById: superAdmin.id,
        amount: 80000.00,
        paymentDate: new Date(),
        paymentMethod: PaymentMethod.CHEQUE,
        bankName: "Islami Bank Bangladesh",
        chequeNumber: "CHQ-88192",
        referenceNumber: "IBBL-CHQ-88192",
        notes: "Advance part payment for weekly order",
        paymentAllocations: {
          create: [{ invoiceId: inv2.id, allocatedAmount: 80000.00 }],
        },
      },
    });

    console.log("✅ Seeded Sale, Invoice & Payment INV-2025-002");
  }

  // 3. Seed Real Operating Expenses if not present
  const expCat = await prisma.expenseCategory.findFirst({
    where: { code: "EXP-LOGIS" },
  });

  const existingExp = await prisma.businessExpense.findFirst();
  if (!existingExp && expCat) {
    await prisma.businessExpense.create({
      data: {
        voucherNumber: "EXP-VCH-2025-001",
        companyId: company.id,
        categoryId: expCat.id,
        expenseDate: new Date(),
        amount: 3500.00,
        paymentMethod: PaymentMethod.CASH,
        referenceNumber: "FUEL-VAN-01",
        description: "Delivery Van Fuel refill for wholesale medicine dispatch (Dhanmondi Route)",
        paidTo: "Meghna Petroleum Station",
        createdById: superAdmin.id,
      },
    });
    console.log("✅ Seeded Operating Business Expense");
  }

  console.log("🚀 Real wholesale transactions seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
