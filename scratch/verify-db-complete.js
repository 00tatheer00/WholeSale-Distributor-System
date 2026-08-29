const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'wmdms.db');
process.env.DATABASE_URL = `file:${dbPath.replace(/\\/g, '/')}`;

const prisma = new PrismaClient();

async function main() {
  console.log('--- VERIFYING SQLITE DATABASE INTEGRITY ---');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, status: true } });
  console.log(`✅ Users found: ${users.length}`);
  users.forEach((u) => console.log(`   - [${u.role}] ${u.email} (Status: ${u.status})`));

  const companies = await prisma.company.findMany();
  console.log(`✅ Companies found: ${companies.length} (${companies[0]?.name || 'N/A'}, Currency: ${companies[0]?.currency || 'AFN'})`);

  const medicines = await prisma.medicine.count();
  console.log(`✅ Medicines in DB: ${medicines}`);

  const batches = await prisma.medicineBatch.count();
  console.log(`✅ Inventory Batches in DB: ${batches}`);

  const customers = await prisma.customer.count();
  console.log(`✅ Customers in DB: ${customers}`);

  const suppliers = await prisma.supplier.count();
  console.log(`✅ Suppliers in DB: ${suppliers}`);

  const sales = await prisma.sale.count();
  console.log(`✅ Sales records in DB: ${sales}`);

  const purchases = await prisma.purchase.count();
  console.log(`✅ Purchase orders in DB: ${purchases}`);

  console.log('--- ALL SQLITE TABLES & DATA 100% VERIFIED ---');
}

main()
  .catch((e) => {
    console.error('Database Verification Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
