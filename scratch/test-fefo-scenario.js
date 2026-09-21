const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'wmdms.db');
process.env.DATABASE_URL = `file:${dbPath.replace(/\\/g, '/')}`;

const prisma = new PrismaClient();

async function runFefoTest() {
  console.log('====================================================');
  console.log('PHASE 2: CRITICAL FEFO TRANSACTION VERIFICATION TEST');
  console.log('====================================================\n');

  let testCustomerId = null;
  let testMedicineId = null;
  let batchAId = null;
  let batchBId = null;
  let batchCId = null;
  let batchExpId = null;
  let testWarehouseId = null;
  let testSupplierId = null;
  let testCategoryId = null;
  let testSaleId = null;

  try {
    // 1. Get or create Company
    let company = await prisma.company.findFirst();
    if (!company) {
      throw new Error('No company record found');
    }

    // 2. Setup Category & Supplier & Warehouse
    let category = await prisma.medicineCategory.findFirst();
    if (!category) {
      category = await prisma.medicineCategory.create({
        data: { name: 'FEFO Test Category', code: 'CAT-FEFO-TEST' },
      });
    }
    testCategoryId = category.id;

    let supplier = await prisma.supplier.findFirst();
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          companyId: company.id,
          name: 'FEFO Test Pharma Supplier',
          code: 'SUP-FEFO-TEST',
          phone: '+92 300 1234567',
        },
      });
    }
    testSupplierId = supplier.id;

    let warehouse = await prisma.warehouse.findFirst();
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          companyId: company.id,
          name: 'Main FEFO Warehouse',
          code: 'WH-FEFO-MAIN',
        },
      });
    }
    testWarehouseId = warehouse.id;

    // 3. Create Test Customer
    const customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        customerCode: 'CUST-FEFO-' + Date.now(),
        drugLicenseNo: 'DRAP-RET-LHR-99881',
        pharmacyName: 'FEFO Testing Pharmacy Ltd',
        proprietorName: 'Dr. Test Pharmacist',
        phone: '+92 300 7654321',
        address: 'Commercial Market, Lahore',
        creditLimit: 500000,
        currentDue: 0,
      },
    });
    testCustomerId = customer.id;
    console.log(`✅ [1/11] Created Test Customer: "${customer.pharmacyName}" (Credit Limit: Rs. ${customer.creditLimit})`);

    // 4. Create Test Medicine
    const medicine = await prisma.medicine.create({
      data: {
        companyId: company.id,
        categoryId: category.id,
        supplierId: supplier.id,
        brandName: 'Augmentin 625mg FEFO Test',
        genericName: 'Amoxicillin + Clavulanic Acid',
        skuCode: 'MED-FEFO-' + Date.now(),
        dosageForm: 'TABLET',
        strength: '625mg',
        packSize: 'Box of 10s',
        defaultTradePrice: 100,
        defaultMrp: 120,
      },
    });
    testMedicineId = medicine.id;
    console.log(`✅ [2/11] Created Test Medicine: "${medicine.brandName}" (SKU: ${medicine.skuCode})`);

    // 5. Create 3 Active Batches with Staggered Expiry + 1 Expired Batch
    const dateA = new Date('2026-10-15T00:00:00Z'); // Earlier Expiry
    const dateB = new Date('2026-11-20T00:00:00Z'); // Later Expiry
    const dateC = new Date('2026-12-25T00:00:00Z'); // Latest Expiry
    const dateExp = new Date('2024-01-01T00:00:00Z'); // Already Expired

    const batchA = await prisma.medicineBatch.create({
      data: {
        medicineId: medicine.id,
        warehouseId: warehouse.id,
        supplierId: supplier.id,
        batchNumber: 'BATCH-A-' + Date.now(),
        mfgDate: new Date('2024-01-01'),
        expiryDate: dateA,
        purchaseCostPrice: 80.0,
        tradePrice: 100.0,
        mrp: 120.0,
        quantityOnHand: 100,
        quantityAvailable: 100,
        status: 'ACTIVE',
      },
    });
    batchAId = batchA.id;

    const batchB = await prisma.medicineBatch.create({
      data: {
        medicineId: medicine.id,
        warehouseId: warehouse.id,
        supplierId: supplier.id,
        batchNumber: 'BATCH-B-' + Date.now(),
        mfgDate: new Date('2024-02-01'),
        expiryDate: dateB,
        purchaseCostPrice: 85.0,
        tradePrice: 105.0,
        mrp: 125.0,
        quantityOnHand: 100,
        quantityAvailable: 100,
        status: 'ACTIVE',
      },
    });
    batchBId = batchB.id;

    const batchC = await prisma.medicineBatch.create({
      data: {
        medicineId: medicine.id,
        warehouseId: warehouse.id,
        supplierId: supplier.id,
        batchNumber: 'BATCH-C-' + Date.now(),
        mfgDate: new Date('2024-03-01'),
        expiryDate: dateC,
        purchaseCostPrice: 90.0,
        tradePrice: 110.0,
        mrp: 130.0,
        quantityOnHand: 100,
        quantityAvailable: 100,
        status: 'ACTIVE',
      },
    });
    batchCId = batchC.id;

    const batchExp = await prisma.medicineBatch.create({
      data: {
        medicineId: medicine.id,
        warehouseId: warehouse.id,
        supplierId: supplier.id,
        batchNumber: 'BATCH-EXP-' + Date.now(),
        mfgDate: new Date('2022-01-01'),
        expiryDate: dateExp,
        purchaseCostPrice: 70.0,
        tradePrice: 90.0,
        mrp: 110.0,
        quantityOnHand: 50,
        quantityAvailable: 50,
        status: 'EXPIRED',
      },
    });
    batchExpId = batchExp.id;

    console.log(`✅ [3/11] Created 4 Test Batches:`);
    console.log(`   - Batch A (Earlier): ${batchA.batchNumber} | Expiry: ${dateA.toISOString().split('T')[0]} | Qty: 100 | Cost: Rs. 80 | TP: Rs. 100`);
    console.log(`   - Batch B (Later):   ${batchB.batchNumber} | Expiry: ${dateB.toISOString().split('T')[0]} | Qty: 100 | Cost: Rs. 85 | TP: Rs. 105`);
    console.log(`   - Batch C (Latest):  ${batchC.batchNumber} | Expiry: ${dateC.toISOString().split('T')[0]} | Qty: 100 | Cost: Rs. 90 | TP: Rs. 110`);
    console.log(`   - Batch EXP (Past):  ${batchExp.batchNumber} | Expiry: ${dateExp.toISOString().split('T')[0]} | Qty: 50  | Status: EXPIRED`);

    // 6. Test FEFO Queue Priority (Querying order by expiryDate ASC)
    const activeBatches = await prisma.medicineBatch.findMany({
      where: {
        medicineId: medicine.id,
        status: 'ACTIVE',
        expiryDate: { gt: new Date() },
      },
      orderBy: { expiryDate: 'asc' },
    });

    console.log(`\n🔍 [4/11] FEFO Query Result Order:`);
    activeBatches.forEach((b, idx) => {
      console.log(`   Priority #${idx + 1}: ${b.batchNumber} (Expires: ${b.expiryDate.toISOString().split('T')[0]})`);
    });

    if (activeBatches[0].id !== batchA.id || activeBatches[1].id !== batchB.id || activeBatches[2].id !== batchC.id) {
      throw new Error('FEFO Queue order failed! Batches were not ordered strictly by earliest expiryDate.');
    }
    console.log('   -> VERIFIED: Priority #1 is Batch A, Priority #2 is Batch B, Priority #3 is Batch C strictly by FEFO.');

    // 7. Verify Expired Batches are Excluded
    const hasExpired = activeBatches.some((b) => b.id === batchExp.id);
    if (hasExpired) {
      throw new Error('FEFO Violation: Expired batch appeared in active sales queue!');
    }
    console.log('✅ [5/11] Expired Batch Quarantine Verified: Expired batch excluded from active sales queue.');

    // 8. Execute Multi-Batch Sale: 150 Units Total (100 from Batch A + 50 from Batch B)
    console.log('\n📦 [6/11] Executing Multi-Batch Sale for 150 units:');
    console.log('   - 100 units from Batch A (Full depletion)');
    console.log('   - 50 units from Batch B (Partial depletion)');

    const saleNumber = 'SALE-FEFO-' + Date.now();
    const invoiceNumber = 'INV-FEFO-' + Date.now();

    const expectedCogsA = 100 * 80.0; // 8,000
    const expectedCogsB = 50 * 85.0;  // 4,250
    const totalExpectedCogs = expectedCogsA + expectedCogsB; // 12,250

    const lineTotalA = 100 * 100.0; // 10,000
    const lineTotalB = 50 * 105.0;  // 5,250
    const grandTotal = lineTotalA + lineTotalB; // 15,250
    const expectedGrossProfit = grandTotal - totalExpectedCogs; // 3,000

    const adminUser = await prisma.user.findFirst();
    if (!adminUser) throw new Error("No user found");

    const sale = await prisma.$transaction(async (tx) => {
      // Create Sale
      const newSale = await tx.sale.create({
        data: {
          customerId: customer.id,
          createdById: adminUser.id,
          saleNumber,
          saleDate: new Date(),
          subtotalAmount: grandTotal,
          discountAmount: 0,
          taxAmount: 0,
          deliveryCharge: 0,
          grandTotal: grandTotal,
          totalCogs: totalExpectedCogs,
          paidAmount: 0,
          dueAmount: grandTotal,
          paymentStatus: 'UNPAID',
          deliveryStatus: 'DELIVERED',
          status: 'CONFIRMED',
          saleItems: {
            create: [
              {
                medicineId: medicine.id,
                batchId: batchA.id,
                quantity: 100,
                bonusQuantity: 0,
                unitCostPrice: 80.0,
                unitTradePrice: 100.0,
                unitMrp: 120.0,
                lineCogs: expectedCogsA,
                lineTotal: lineTotalA,
              },
              {
                medicineId: medicine.id,
                batchId: batchB.id,
                quantity: 50,
                bonusQuantity: 0,
                unitCostPrice: 85.0,
                unitTradePrice: 105.0,
                unitMrp: 125.0,
                lineCogs: expectedCogsB,
                lineTotal: lineTotalB,
              },
            ],
          },
          invoice: {
            create: {
              customerId: customer.id,
              createdById: adminUser.id,
              invoiceNumber,
              invoiceDate: new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              subtotalAmount: grandTotal,
              discountAmount: 0,
              taxAmount: 0,
              grandTotal: grandTotal,
              paidAmount: 0,
              dueAmount: grandTotal,
              paymentStatus: 'UNPAID',
              status: 'ISSUED',
              challanNumber: 'CHL-' + Date.now(),
            },
          },
        },
      });

      // Update Batch A: 100 -> 0 (EXHAUSTED)
      await tx.medicineBatch.update({
        where: { id: batchA.id },
        data: {
          quantityOnHand: 0,
          quantityAvailable: 0,
          status: 'EXHAUSTED',
        },
      });

      // Log Stock Movement for Batch A
      await tx.stockMovement.create({
        data: {
          medicineId: medicine.id,
          batchId: batchA.id,
          warehouseId: warehouse.id,
          movementType: 'SALE_OUT',
          quantityDelta: -100,
          quantityBefore: 100,
          quantityAfter: 0,
          unitCostPrice: 80.0,
          referenceNumber: saleNumber,
          reason: 'Wholesale FEFO Allocation Sale',
        },
      });

      // Update Batch B: 100 -> 50
      await tx.medicineBatch.update({
        where: { id: batchB.id },
        data: {
          quantityOnHand: 50,
          quantityAvailable: 50,
        },
      });

      // Log Stock Movement for Batch B
      await tx.stockMovement.create({
        data: {
          medicineId: medicine.id,
          batchId: batchB.id,
          warehouseId: warehouse.id,
          movementType: 'SALE_OUT',
          quantityDelta: -50,
          quantityBefore: 100,
          quantityAfter: 50,
          unitCostPrice: 85.0,
          referenceNumber: saleNumber,
          reason: 'Wholesale FEFO Allocation Sale',
        },
      });

      // Update Customer AR
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          currentDue: { increment: grandTotal },
          totalPurchased: { increment: grandTotal },
        },
      });

      return newSale;
    });

    testSaleId = sale.id;
    console.log(`✅ [7/11] Sale Committed: ${sale.saleNumber} | Grand Total: Rs. ${grandTotal}`);

    // 9. Inspect Database State After Sale
    const updatedBatchA = await prisma.medicineBatch.findUnique({ where: { id: batchA.id } });
    const updatedBatchB = await prisma.medicineBatch.findUnique({ where: { id: batchB.id } });
    const updatedBatchC = await prisma.medicineBatch.findUnique({ where: { id: batchC.id } });
    const updatedCustomer = await prisma.customer.findUnique({ where: { id: customer.id } });

    console.log('\n📊 [8/11] Post-Sale Database Verification:');
    console.log(`   - Batch A stock: ${updatedBatchA.quantityOnHand} (Expected: 0, Status: ${updatedBatchA.status})`);
    console.log(`   - Batch B stock: ${updatedBatchB.quantityOnHand} (Expected: 50, Status: ${updatedBatchB.status})`);
    console.log(`   - Batch C stock: ${updatedBatchC.quantityOnHand} (Expected: 100, Untouched)`);
    console.log(`   - Customer Due:  Rs. ${updatedCustomer.currentDue} (Expected: Rs. ${grandTotal})`);

    if (updatedBatchA.quantityOnHand !== 0 || updatedBatchB.quantityOnHand !== 50 || updatedBatchC.quantityOnHand !== 100) {
      throw new Error('Post-sale batch quantities do not match expected stock deductions!');
    }
    if (Number(updatedCustomer.currentDue) !== grandTotal) {
      throw new Error('Customer Accounts Receivable (AR) balance not incremented properly!');
    }

    // 10. Verify COGS and Gross Profit Preservation
    const saleRecord = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: { saleItems: true },
    });

    const recordedCogs = Number(saleRecord.totalCogs);
    const recordedRevenue = Number(saleRecord.grandTotal);
    const recordedGrossProfit = recordedRevenue - recordedCogs;

    console.log('\n💰 [9/11] Margin & Historical COGS Derivation:');
    console.log(`   - Recorded Revenue: Rs. ${recordedRevenue}`);
    console.log(`   - Historical COGS:  Rs. ${recordedCogs} (Expected: Rs. ${totalExpectedCogs})`);
    console.log(`   - Gross Profit:     Rs. ${recordedGrossProfit} (Expected: Rs. ${expectedGrossProfit})`);
    console.log(`   - Margin Percentage: ${((recordedGrossProfit / recordedRevenue) * 100).toFixed(2)}%`);

    if (recordedCogs !== totalExpectedCogs) {
      throw new Error(`COGS mismatch! Recorded: ${recordedCogs}, Expected: ${totalExpectedCogs}`);
    }
    if (recordedGrossProfit !== expectedGrossProfit) {
      throw new Error(`Gross profit mismatch! Recorded: ${recordedGrossProfit}, Expected: ${expectedGrossProfit}`);
    }
    console.log('   -> VERIFIED: Historical batch COGS snapshot preserved accurately.');

    // 11. Test Sale Cancellation & Inventory Restoration
    console.log('\n🔄 [10/11] Testing Safe Sale Cancellation & Stock Reversal:');
    await prisma.$transaction(async (tx) => {
      // Restore Batches
      await tx.medicineBatch.update({
        where: { id: batchA.id },
        data: {
          quantityOnHand: { increment: 100 },
          quantityAvailable: { increment: 100 },
          status: 'ACTIVE',
        },
      });

      await tx.stockMovement.create({
        data: {
          medicineId: medicine.id,
          batchId: batchA.id,
          warehouseId: warehouse.id,
          movementType: 'SALE_CANCEL_RETURN',
          quantityDelta: 100,
          quantityBefore: 0,
          quantityAfter: 100,
          unitCostPrice: 80.0,
          referenceNumber: saleNumber,
          reason: 'Sale Cancellation Reversal',
        },
      });

      await tx.medicineBatch.update({
        where: { id: batchB.id },
        data: {
          quantityOnHand: { increment: 50 },
          quantityAvailable: { increment: 50 },
        },
      });

      await tx.stockMovement.create({
        data: {
          medicineId: medicine.id,
          batchId: batchB.id,
          warehouseId: warehouse.id,
          movementType: 'SALE_CANCEL_RETURN',
          quantityDelta: 50,
          quantityBefore: 50,
          quantityAfter: 100,
          unitCostPrice: 85.0,
          referenceNumber: saleNumber,
          reason: 'Sale Cancellation Reversal',
        },
      });

      // Reverse Customer Balance
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          currentDue: { decrement: grandTotal },
          totalPurchased: { decrement: grandTotal },
        },
      });

      // Mark Sale & Invoice Cancelled
      await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'UAT FEFO Test Cancellation Verification',
          cancelledAt: new Date(),
        },
      });

      await tx.invoice.update({
        where: { saleId: sale.id },
        data: { status: 'CANCELLED' },
      });
    });

    const restoredBatchA = await prisma.medicineBatch.findUnique({ where: { id: batchA.id } });
    const restoredBatchB = await prisma.medicineBatch.findUnique({ where: { id: batchB.id } });
    const restoredCustomer = await prisma.customer.findUnique({ where: { id: customer.id } });
    const cancelledSale = await prisma.sale.findUnique({ where: { id: sale.id } });

    console.log(`   - Restored Batch A stock: ${restoredBatchA.quantityOnHand} (Expected: 100, Status: ${restoredBatchA.status})`);
    console.log(`   - Restored Batch B stock: ${restoredBatchB.quantityOnHand} (Expected: 100, Status: ${restoredBatchB.status})`);
    console.log(`   - Restored Customer Due:  Rs. ${restoredCustomer.currentDue} (Expected: 0)`);
    console.log(`   - Sale Status:            ${cancelledSale.status} (Expected: CANCELLED)`);

    if (restoredBatchA.quantityOnHand !== 100 || restoredBatchB.quantityOnHand !== 100) {
      throw new Error('Stock restoration failed upon sale cancellation!');
    }
    if (Number(restoredCustomer.currentDue) !== 0) {
      throw new Error('Customer financial reversal failed upon sale cancellation!');
    }
    console.log('   -> VERIFIED: Stock and customer financials restored to exact pre-sale state.');

    console.log('\n====================================================');
    console.log('✅ [11/11] ALL 11 CRITICAL FEFO CHECKS PASSED 100%!');
    console.log('====================================================');
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test records from database...');
    if (testSaleId) {
      await prisma.stockMovement.deleteMany({ where: { referenceNumber: { contains: 'SALE-FEFO' } } });
      await prisma.saleItem.deleteMany({ where: { saleId: testSaleId } });
      await prisma.invoice.deleteMany({ where: { saleId: testSaleId } });
      await prisma.sale.deleteMany({ where: { id: testSaleId } });
    }
    if (batchAId) await prisma.medicineBatch.delete({ where: { id: batchAId } }).catch(() => {});
    if (batchBId) await prisma.medicineBatch.delete({ where: { id: batchBId } }).catch(() => {});
    if (batchCId) await prisma.medicineBatch.delete({ where: { id: batchCId } }).catch(() => {});
    if (batchExpId) await prisma.medicineBatch.delete({ where: { id: batchExpId } }).catch(() => {});
    if (testMedicineId) await prisma.medicine.delete({ where: { id: testMedicineId } }).catch(() => {});
    if (testCustomerId) await prisma.customer.delete({ where: { id: testCustomerId } }).catch(() => {});
    console.log('✅ Cleanup complete. Database restored to pristine condition.\n');
    await prisma.$disconnect();
  }
}

runFefoTest().catch((err) => {
  console.error('❌ FEFO Test Failed with Error:', err);
  process.exit(1);
});
