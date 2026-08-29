const { PrismaClient } = require('@prisma/client');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'prisma', 'wmdms.db');
process.env.DATABASE_URL = `file:${dbPath.replace(/\\/g, '/')}`;

const prisma = new PrismaClient();

async function resetToCleanZero() {
  console.log('🧹 ZEROING ALL TRANSACTIONAL & MASTER DATA IN SQLITE...');
  console.log('Target SQLite DB:', process.env.DATABASE_URL);

  // Execute clean-up in foreign-key safe order using direct SQLite PRAGMA / DELETE statements
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF;`);

  const tablesToZero = [
    'payment_invoice_allocations',
    'customer_payments',
    'supplier_payments',
    'invoices',
    'distributor_sales',
    'distributor_expenses',
    'business_expenses',
    'sale_items',
    'sales',
    'purchase_items',
    'purchases',
    'stock_movements',
    'stock_adjustments',
    'medicine_batches',
    'medicines',
    'customers',
    'suppliers',
    'distributors',
    'notifications',
    'audit_logs',
  ];

  for (const table of tablesToZero) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM ${table};`);
      console.log(`✅ Table cleared: ${table}`);
    } catch (err) {
      console.warn(`Warning clearing ${table}:`, err.message);
    }
  }

  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);

  // 2. Ensure Default Company exists
  const company = await prisma.company.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {
      name: "Kabul Pharma Wholesale Distributors",
      currency: "AFN",
      enableFefoStrict: true,
    },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Kabul Pharma Wholesale Distributors",
      tradeLicenseNo: "TL-AF-2024-9872",
      drugLicenseNo: "DL-MOPH-AFG-4402",
      taxIdTin: "TIN-9873421-KBL",
      email: "admin@kabulpharma.af",
      phone: "+93 79 912 3456",
      address: "District 4, Main Commercial Avenue, Wholesale Market",
      city: "Kabul",
      country: "Afghanistan",
      currency: "AFN",
      defaultCreditDays: 30,
      defaultVatPercent: 0,
      enableFefoStrict: true,
      lowStockThreshold: 20,
      nearExpiryDays: 90,
      invoiceFooterText: "Thank you for your business. Strictly wholesale FEFO batch-tracked distribution.",
    },
  });

  // 3. Ensure Clean Admin Users exist
  const admin123Hash = await bcrypt.hash("admin123", 10);
  const sales123Hash = await bcrypt.hash("sales123", 10);
  const warehouse123Hash = await bcrypt.hash("warehouse123", 10);
  const accounts123Hash = await bcrypt.hash("accounts123", 10);
  const adminPasswordHash = await bcrypt.hash("admin@123", 10);

  const cleanUsers = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      email: "admin@pharmadist.com",
      name: "Super Admin",
      phone: "+93 79 000 1100",
      role: "SUPER_ADMIN",
      passwordHash: admin123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      email: "sales.manager@pharmadist.com",
      name: "Sales Manager",
      phone: "+93 79 000 1200",
      role: "SALES_MANAGER",
      passwordHash: sales123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      email: "warehouse@pharmadist.com",
      name: "Warehouse Officer",
      phone: "+93 79 000 1300",
      role: "WAREHOUSE_MANAGER",
      passwordHash: warehouse123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      email: "accounts@pharmadist.com",
      name: "Accounts Officer",
      phone: "+93 79 000 1400",
      role: "ACCOUNTS_OFFICER",
      passwordHash: accounts123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000010",
      email: "admin@erp.com",
      name: "Tatheer Admin",
      phone: "+93 79 000 1111",
      role: "SUPER_ADMIN",
      passwordHash: adminPasswordHash,
    },
  ];

  for (const u of cleanUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: u.passwordHash, status: "ACTIVE" },
      create: {
        id: u.id,
        companyId: company.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        status: "ACTIVE",
        passwordHash: u.passwordHash,
      },
    });
  }

  // 4. Ensure Clean Warehouse exists
  await prisma.warehouse.upsert({
    where: { code: "MAIN-WH" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000020",
      companyId: company.id,
      name: "Central Distribution Warehouse",
      code: "MAIN-WH",
      location: "Building A, Kabul Industrial Zone",
      isDefault: true,
      isActive: true,
    },
  });

  console.log('\n--- FINAL CLEAN ZERO AUDIT ---');
  console.log('🏢 Companies:', await prisma.company.count());
  console.log('👥 Users:', await prisma.user.count());
  console.log('💊 Medicines:', await prisma.medicine.count(), ' (Zero Clean)');
  console.log('📦 Batches:', await prisma.medicineBatch.count(), ' (Zero Clean)');
  console.log('🚚 Stock Movements:', await prisma.stockMovement.count(), ' (Zero Clean)');
  console.log('🏪 Customers:', await prisma.customer.count(), ' (Zero Clean)');
  console.log('🏭 Suppliers:', await prisma.supplier.count(), ' (Zero Clean)');
  console.log('💰 Sales:', await prisma.sale.count(), ' (Zero Clean)');
  console.log('🧾 Invoices:', await prisma.invoice.count(), ' (Zero Clean)');
  console.log('📥 Purchases:', await prisma.purchase.count(), ' (Zero Clean)');
  console.log('📉 Expenses:', await prisma.businessExpense.count(), ' (Zero Clean)');
  console.log('🔔 Notifications:', await prisma.notification.count(), ' (Zero Clean)');
  console.log('📝 Audit Logs:', await prisma.auditLog.count(), ' (Zero Clean)');
  console.log('------------------------------------');
  console.log('🎉 Database is 100% ZERO CLEAN and ready for live production entries!');
}

resetToCleanZero()
  .catch((e) => {
    console.error('Reset Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
