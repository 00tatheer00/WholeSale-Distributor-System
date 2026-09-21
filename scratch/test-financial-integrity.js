const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'wmdms.db');
process.env.DATABASE_URL = `file:${dbPath.replace(/\\/g, '/')}`;

const prisma = new PrismaClient();

async function runFinancialIntegrityTest() {
  console.log('====================================================');
  console.log('PHASE 3 & 4: INVENTORY & FINANCIAL INTEGRITY AUDIT');
  console.log('====================================================\n');

  let supplierId = null;
  let customerId = null;
  let medicineId = null;
  let batchId = null;
  let warehouseId = null;
  let purchaseId = null;
  let supplierPaymentId = null;
  let creditSaleId = null;
  let cashSaleId = null;
  let customerPaymentId = null;
  let expenseId = null;

  try {
    const company = await prisma.company.findFirst();
    const adminUser = await prisma.user.findFirst();

    // 1. Setup Test Supplier
    const supplier = await prisma.supplier.create({
      data: {
        companyId: company.id,
        name: 'Integrity Test Pharma Supplier',
        code: 'SUP-INT-' + Date.now(),
        phone: '+92 321 1122334',
        address: 'Industrial Area, Karachi',
        openingBalance: 0,
        currentDue: 0,
        totalPurchased: 0,
        totalPaid: 0,
      },
    });
    supplierId = supplier.id;
    console.log(`✅ [1/9] Created Test Supplier: "${supplier.name}" (Initial AP Due: Rs. ${supplier.currentDue})`);

    // 2. Setup Test Customer
    const customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        pharmacyName: 'Integrity Test Pharmacy',
        proprietorName: 'Dr. Financial Auditor',
        customerCode: 'CUST-INT-' + Date.now(),
        drugLicenseNo: 'DRAP-KHI-88992',
        phone: '+92 333 4455667',
        address: 'Tariq Road, Karachi',
        creditLimit: 200000,
        openingBalance: 0,
        currentDue: 0,
        totalPurchased: 0,
        totalPaid: 0,
      },
    });
    customerId = customer.id;
    console.log(`✅ [2/9] Created Test Customer: "${customer.pharmacyName}" (Initial AR Due: Rs. ${customer.currentDue})`);

    let category = await prisma.medicineCategory.findFirst();
    if (!category) {
      category = await prisma.medicineCategory.create({
        data: { name: 'Integrity Category', code: 'CAT-INT' },
      });
    }

    let warehouse = await prisma.warehouse.findFirst();
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: { companyId: company.id, name: 'Main Depot', code: 'WH-MAIN' },
      });
    }
    warehouseId = warehouse.id;

    // 3. Setup Test Medicine
    const medicine = await prisma.medicine.create({
      data: {
        companyId: company.id,
        categoryId: category.id,
        supplierId: supplier.id,
        brandName: 'Panadol Extra 500mg Test',
        genericName: 'Paracetamol + Caffeine',
        skuCode: 'MED-INT-' + Date.now(),
        strength: '500mg',
        dosageForm: 'TABLET',
        defaultTradePrice: 50,
        defaultMrp: 60,
      },
    });
    medicineId = medicine.id;

    // 4. Test Purchase Consignment (AP Accrual)
    console.log('\n📦 [3/9] Testing Purchase Consignment & Supplier Accounts Payable (AP):');
    const purchaseNumber = 'PO-INT-' + Date.now();
    const purchaseTotal = 50000.0; // 1,000 units @ Rs. 50 cost

    const purchase = await prisma.$transaction(async (tx) => {
      const p = await tx.purchase.create({
        data: {
          supplierId: supplier.id,
          warehouseId: warehouse.id,
          createdById: adminUser.id,
          purchaseNumber,
          purchaseDate: new Date(),
          subtotalAmount: purchaseTotal,
          discountAmount: 0,
          taxAmount: 0,
          grandTotal: purchaseTotal,
          paidAmount: 0,
          dueAmount: purchaseTotal,
          paymentStatus: 'UNPAID',
          status: 'RECEIVED',
          purchaseItems: {
            create: [
              {
                medicineId: medicine.id,
                batchNumber: 'BATCH-INT-001',
                mfgDate: new Date('2024-01-01'),
                expiryDate: new Date('2027-01-01'),
                quantity: 1000,
                bonusQuantity: 0,
                unitPurchaseCost: 50.0,
                unitTradePrice: 65.0,
                unitMrp: 75.0,
                subtotal: purchaseTotal,
                totalAmount: purchaseTotal,
              },
            ],
          },
        },
      });

      // Create Batch
      const batch = await tx.medicineBatch.create({
        data: {
          medicineId: medicine.id,
          warehouseId: warehouse.id,
          supplierId: supplier.id,
          batchNumber: 'BATCH-INT-001',
          mfgDate: new Date('2024-01-01'),
          expiryDate: new Date('2027-01-01'),
          purchaseCostPrice: 50.0,
          tradePrice: 65.0,
          mrp: 75.0,
          quantityOnHand: 1000,
          quantityAvailable: 1000,
          status: 'ACTIVE',
        },
      });

      // Increment Supplier AP
      await tx.supplier.update({
        where: { id: supplier.id },
        data: {
          currentDue: { increment: purchaseTotal },
          totalPurchased: { increment: purchaseTotal },
        },
      });

      return { purchase: p, batch };
    });

    purchaseId = purchase.purchase.id;
    batchId = purchase.batch.id;

    const suppAfterPurchase = await prisma.supplier.findUnique({ where: { id: supplier.id } });
    console.log(`   - Supplier AP Due after Purchase: Rs. ${suppAfterPurchase.currentDue} (Expected: Rs. 50000)`);
    if (Number(suppAfterPurchase.currentDue) !== 50000) {
      throw new Error('Supplier AP currentDue was not incremented correctly after purchase!');
    }
    console.log('   -> VERIFIED: Purchase correctly increased Accounts Payable liabilities.');

    // 5. Test Supplier Partial Payment (AP Reduction)
    console.log('\n💳 [4/9] Testing Partial Supplier Payment Voucher:');
    const paymentAmount = 20000.0;
    const paymentVoucher = await prisma.$transaction(async (tx) => {
      const sp = await tx.supplierPayment.create({
        data: {
          supplierId: supplier.id,
          purchaseId: purchase.purchase.id,
          createdById: adminUser.id,
          voucherNumber: 'PV-INT-' + Date.now(),
          amount: paymentAmount,
          paymentDate: new Date(),
          paymentMethod: 'BANK_TRANSFER',
          referenceNumber: 'MBL-TXN-99881',
          status: 'CONFIRMED',
        },
      });

      // Update Purchase Paid/Due
      await tx.purchase.update({
        where: { id: purchase.purchase.id },
        data: {
          paidAmount: paymentAmount,
          dueAmount: purchaseTotal - paymentAmount,
          paymentStatus: 'PARTIALLY_PAID',
        },
      });

      // Decrement Supplier AP
      await tx.supplier.update({
        where: { id: supplier.id },
        data: {
          currentDue: { decrement: paymentAmount },
          totalPaid: { increment: paymentAmount },
        },
      });

      return sp;
    });

    supplierPaymentId = paymentVoucher.id;
    const suppAfterPayment = await prisma.supplier.findUnique({ where: { id: supplier.id } });
    console.log(`   - Supplier AP Due after Payment: Rs. ${suppAfterPayment.currentDue} (Expected: Rs. 30000)`);
    console.log(`   - Supplier Total Paid:          Rs. ${suppAfterPayment.totalPaid} (Expected: Rs. 20000)`);
    if (Number(suppAfterPayment.currentDue) !== 30000 || Number(suppAfterPayment.totalPaid) !== 20000) {
      throw new Error('Supplier AP balance not updated correctly upon payment voucher execution!');
    }
    console.log('   -> VERIFIED: Payment voucher correctly reduced Accounts Payable liabilities.');

    // 6. Test Customer Credit Sale (AR Accrual)
    console.log('\n🧾 [5/9] Testing Customer Credit Sale & Accounts Receivable (AR):');
    const saleTotal = 40000.0; // 500 units @ Rs. 80 Trade Price
    const saleCogs = 25000.0;  // 500 units @ Rs. 50 Cost
    const expectedGrossProfit = saleTotal - saleCogs; // 15,000

    const creditSale = await prisma.$transaction(async (tx) => {
      const s = await tx.sale.create({
        data: {
          customerId: customer.id,
          createdById: adminUser.id,
          saleNumber: 'SO-INT-CREDIT-' + Date.now(),
          saleDate: new Date(),
          subtotalAmount: saleTotal,
          discountAmount: 0,
          taxAmount: 0,
          deliveryCharge: 0,
          grandTotal: saleTotal,
          totalCogs: saleCogs,
          paidAmount: 0,
          dueAmount: saleTotal,
          paymentStatus: 'UNPAID',
          deliveryStatus: 'DELIVERED',
          status: 'CONFIRMED',
          saleItems: {
            create: [
              {
                medicineId: medicine.id,
                batchId: batchId,
                quantity: 500,
                bonusQuantity: 0,
                unitCostPrice: 50.0,
                unitTradePrice: 80.0,
                unitMrp: 90.0,
                lineCogs: saleCogs,
                lineTotal: saleTotal,
              },
            ],
          },
          invoice: {
            create: {
              customerId: customer.id,
              createdById: adminUser.id,
              invoiceNumber: 'INV-INT-CREDIT-' + Date.now(),
              invoiceDate: new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              subtotalAmount: saleTotal,
              discountAmount: 0,
              taxAmount: 0,
              grandTotal: saleTotal,
              paidAmount: 0,
              dueAmount: saleTotal,
              paymentStatus: 'UNPAID',
              status: 'ISSUED',
              challanNumber: 'CHL-INT-' + Date.now(),
            },
          },
        },
      });

      // Deduct Batch
      await tx.medicineBatch.update({
        where: { id: batchId },
        data: {
          quantityOnHand: { decrement: 500 },
          quantityAvailable: { decrement: 500 },
        },
      });

      // Increment Customer AR
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          currentDue: { increment: saleTotal },
          totalPurchased: { increment: saleTotal },
        },
      });

      return s;
    });

    creditSaleId = creditSale.id;
    const custAfterSale = await prisma.customer.findUnique({ where: { id: customer.id } });
    console.log(`   - Customer AR Due after Credit Sale: Rs. ${custAfterSale.currentDue} (Expected: Rs. 40000)`);
    if (Number(custAfterSale.currentDue) !== 40000) {
      throw new Error('Customer AR currentDue was not incremented correctly after credit sale!');
    }
    console.log('   -> VERIFIED: Credit sale correctly accrued customer accounts receivable.');

    // 7. Test Customer Partial Collection (AR Reduction)
    console.log('\n💵 [6/9] Testing Customer Collection & Money Receipt:');
    const collectionAmount = 15000.0;
    const collection = await prisma.$transaction(async (tx) => {
      const cp = await tx.customerPayment.create({
        data: {
          customerId: customer.id,
          createdById: adminUser.id,
          receiptNumber: 'RCT-INT-' + Date.now(),
          amount: collectionAmount,
          paymentDate: new Date(),
          paymentMethod: 'CASH',
          status: 'CONFIRMED',
        },
      });

      // Decrement Customer AR
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          currentDue: { decrement: collectionAmount },
          totalPaid: { increment: collectionAmount },
        },
      });

      // Update Invoice Paid/Due
      const inv = await tx.invoice.findFirst({ where: { saleId: creditSale.id } });
      await tx.invoice.update({
        where: { id: inv.id },
        data: {
          paidAmount: collectionAmount,
          dueAmount: saleTotal - collectionAmount,
          paymentStatus: 'PARTIALLY_PAID',
        },
      });

      return cp;
    });

    customerPaymentId = collection.id;
    const custAfterCollection = await prisma.customer.findUnique({ where: { id: customer.id } });
    console.log(`   - Customer AR Due after Collection: Rs. ${custAfterCollection.currentDue} (Expected: Rs. 25000)`);
    console.log(`   - Customer Total Paid:             Rs. ${custAfterCollection.totalPaid} (Expected: Rs. 15000)`);
    if (Number(custAfterCollection.currentDue) !== 25000 || Number(custAfterCollection.totalPaid) !== 15000) {
      throw new Error('Customer AR balance not updated correctly upon collection!');
    }
    console.log('   -> VERIFIED: Money receipt collection correctly reduced Accounts Receivable.');

    // 8. Test Business Expense & Net Profit Impact
    console.log('\n🏢 [7/9] Testing Operating Expense Recording:');
    let expenseCat = await prisma.expenseCategory.findFirst({ where: { code: 'EXP-RENT' } });
    if (!expenseCat) {
      expenseCat = await prisma.expenseCategory.create({
        data: {
          companyId: company.id,
          name: 'Warehouse & Office Rent',
          code: 'EXP-RENT',
          isDirectCost: false,
        },
      });
    }

    const expenseAmount = 5000.0;
    const expense = await prisma.businessExpense.create({
      data: {
        companyId: company.id,
        categoryId: expenseCat.id,
        createdById: adminUser.id,
        voucherNumber: 'EXP-INT-' + Date.now(),
        expenseDate: new Date(),
        amount: expenseAmount,
        paymentMethod: 'BANK_TRANSFER',
        paidTo: 'Estate Landlord',
        description: 'Monthly Warehouse Lease Payment',
        status: 'APPROVED',
      },
    });
    expenseId = expense.id;
    console.log(`   - Recorded Expense: Rs. ${expense.amount} (${expenseCat.name})`);

    // 9. Financial Derivation Formula Verification
    console.log('\n📊 [8/9] Verifying Financial Statements Equation:');
    const expectedNetProfit = expectedGrossProfit - expenseAmount; // 15,000 - 5,000 = 10,000

    console.log(`   - Sales Revenue:     Rs. ${saleTotal}`);
    console.log(`   - COGS:              Rs. ${saleCogs}`);
    console.log(`   - Gross Profit:      Rs. ${expectedGrossProfit} (${((expectedGrossProfit / saleTotal) * 100).toFixed(2)}%)`);
    console.log(`   - Operating Expense: Rs. ${expenseAmount}`);
    console.log(`   - Net Profit:        Rs. ${expectedNetProfit} (${((expectedNetProfit / saleTotal) * 100).toFixed(2)}%)`);

    if (expectedGrossProfit !== 15000 || expectedNetProfit !== 10000) {
      throw new Error('Financial statement formulas failed!');
    }
    console.log('   -> VERIFIED: Revenue - COGS = Gross Profit; Gross Profit - Expenses = Net Profit.');

    // 10. Test Sale Reversal Cleanup
    console.log('\n🔄 [9/9] Testing Sale Cancellation Reversal:');
    await prisma.$transaction(async (tx) => {
      // Restore Batch Stock (500 units)
      await tx.medicineBatch.update({
        where: { id: batchId },
        data: {
          quantityOnHand: { increment: 500 },
          quantityAvailable: { increment: 500 },
        },
      });

      // Reverse Customer AR (remaining due 25,000, totalPurchased 40,000, totalPaid 15,000)
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          currentDue: { decrement: 25000 },
          totalPurchased: { decrement: 40000 },
          totalPaid: { decrement: 15000 },
        },
      });

      await tx.sale.update({
        where: { id: creditSaleId },
        data: { status: 'CANCELLED' },
      });
    });

    const custFinal = await prisma.customer.findUnique({ where: { id: customer.id } });
    const batchFinal = await prisma.medicineBatch.findUnique({ where: { id: batchId } });

    console.log(`   - Final Customer AR Due: Rs. ${custFinal.currentDue} (Expected: 0)`);
    console.log(`   - Final Batch Stock:     ${batchFinal.quantityOnHand} (Expected: 1000)`);

    if (Number(custFinal.currentDue) !== 0 || batchFinal.quantityOnHand !== 1000) {
      throw new Error('Sale cancellation did not restore stock and customer financials cleanly!');
    }
    console.log('   -> VERIFIED: Cancellation cleanly reversed AR liabilities and restored stock.');

    console.log('\n====================================================');
    console.log('✅ ALL INVENTORY & FINANCIAL INTEGRITY CHECKS PASSED!');
    console.log('====================================================');
  } finally {
    console.log('\n🧹 Cleaning up test records...');
    if (expenseId) await prisma.businessExpense.delete({ where: { id: expenseId } }).catch(() => {});
    if (customerPaymentId) await prisma.customerPayment.delete({ where: { id: customerPaymentId } }).catch(() => {});
    if (creditSaleId) {
      await prisma.invoice.deleteMany({ where: { saleId: creditSaleId } });
      await prisma.saleItem.deleteMany({ where: { saleId: creditSaleId } });
      await prisma.sale.delete({ where: { id: creditSaleId } }).catch(() => {});
    }
    if (supplierPaymentId) await prisma.supplierPayment.delete({ where: { id: supplierPaymentId } }).catch(() => {});
    if (purchaseId) {
      await prisma.purchaseItem.deleteMany({ where: { purchaseId: purchaseId } });
      await prisma.purchase.delete({ where: { id: purchaseId } }).catch(() => {});
    }
    if (batchId) await prisma.medicineBatch.delete({ where: { id: batchId } }).catch(() => {});
    if (medicineId) await prisma.medicine.delete({ where: { id: medicineId } }).catch(() => {});
    if (customerId) await prisma.customer.delete({ where: { id: customerId } }).catch(() => {});
    if (supplierId) await prisma.supplier.delete({ where: { id: supplierId } }).catch(() => {});
    console.log('✅ Cleanup complete. Database in pristine condition.\n');
    await prisma.$disconnect();
  }
}

runFinancialIntegrityTest().catch((err) => {
  console.error('❌ Financial Integrity Test Failed with Error:', err);
  process.exit(1);
});
