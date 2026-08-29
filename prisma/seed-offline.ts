import { PrismaClient, UserRole, UserStatus, RecordStatus, StorageZone, CustomerType, CustomerStatus, DosageForm, StorageCondition } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting offline SQLite database seeding...");

  // 1. Create Default Company
  const company = await prisma.company.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
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
      invoiceFooterText: "Thank you for your business. Terms: FEFO Batch Tracked Wholesale Invoice.",
    },
  });

  console.log("✅ Company configured:", company.name);

  // 2. Hash Passwords
  const adminPasswordHash = await bcrypt.hash("admin@123", 10);
  const admin123Hash = await bcrypt.hash("admin123", 10);
  const sales123Hash = await bcrypt.hash("sales123", 10);
  const warehouse123Hash = await bcrypt.hash("warehouse123", 10);
  const accounts123Hash = await bcrypt.hash("accounts123", 10);
  const managerPasswordHash = await bcrypt.hash("manager@123", 10);
  const cashierPasswordHash = await bcrypt.hash("cashier@123", 10);

  // 3. Create Default Users
  const users = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      email: "admin@pharmadist.com",
      name: "Super Admin",
      phone: "+93 79 000 1100",
      role: UserRole.SUPER_ADMIN,
      passwordHash: admin123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      email: "sales.manager@pharmadist.com",
      name: "Sales Manager",
      phone: "+93 79 000 1200",
      role: UserRole.SALES_MANAGER,
      passwordHash: sales123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      email: "warehouse@pharmadist.com",
      name: "Warehouse Officer",
      phone: "+93 79 000 1300",
      role: UserRole.WAREHOUSE_MANAGER,
      passwordHash: warehouse123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      email: "accounts@pharmadist.com",
      name: "Accounts Officer",
      phone: "+93 79 000 1400",
      role: UserRole.ACCOUNTS_OFFICER,
      passwordHash: accounts123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000010",
      email: "admin@erp.com",
      name: "Tatheer Admin",
      phone: "+93 79 000 1111",
      role: UserRole.SUPER_ADMIN,
      passwordHash: adminPasswordHash,
    },
    {
      id: "00000000-0000-0000-0000-000000000011",
      email: "manager@erp.com",
      name: "Ahmad Sales Manager",
      phone: "+93 79 000 2222",
      role: UserRole.SALES_MANAGER,
      passwordHash: managerPasswordHash,
    },
    {
      id: "00000000-0000-0000-0000-000000000012",
      email: "cashier@erp.com",
      name: "Bilal Cashier",
      phone: "+93 79 000 3333",
      role: UserRole.CASHIER,
      passwordHash: cashierPasswordHash,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: u.passwordHash },
      create: {
        id: u.id,
        companyId: company.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        status: UserStatus.ACTIVE,
        passwordHash: u.passwordHash,
      },
    });
  }
  console.log("✅ Core Users created (default password: admin@123)");

  // 4. Default Warehouse & Racks
  const warehouse = await prisma.warehouse.upsert({
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

  const racks = [
    { code: "RACK-GEN-01", zone: StorageZone.GENERAL, desc: "General Tablets & Syrups" },
    { code: "RACK-COLD-01", zone: StorageZone.COLD_ROOM, desc: "2-8°C Cold Chain Vaccines & Insulins" },
    { code: "RACK-NARC-01", zone: StorageZone.NARCOTICS_SAFE, desc: "Controlled Substances Safe" },
  ];

  for (const r of racks) {
    await prisma.rack.upsert({
      where: {
        warehouseId_rackCode: {
          warehouseId: warehouse.id,
          rackCode: r.code,
        },
      },
      update: {},
      create: {
        warehouseId: warehouse.id,
        rackCode: r.code,
        zone: r.zone,
        description: r.desc,
      },
    });
  }
  console.log("✅ Warehouse & Racks created");

  // 5. Default Medicine Categories
  const categories = [
    { name: "Antibiotics & Antibacterials", code: "CAT-ANTI" },
    { name: "Analgesics & Pain Relief", code: "CAT-ANAL" },
    { name: "Cardiovascular & Hypertension", code: "CAT-CARD" },
    { name: "Gastrointestinal & Antacids", code: "CAT-GAST" },
    { name: "Vitamins & Nutritional Supplements", code: "CAT-VITA" },
    { name: "Respiratory & Anti-Asthma", code: "CAT-RESP" },
  ];

  for (const c of categories) {
    await prisma.medicineCategory.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        code: c.code,
        isActive: true,
      },
    });
  }
  console.log("✅ Medicine Categories seeded");

  // 6. Default Expense Categories
  const expenseCategories = [
    { name: "Warehouse Electricity & Generator Fuel", code: "EXP-ELEC" },
    { name: "Vehicle Fuel & Delivery Transport", code: "EXP-TRANS" },
    { name: "Staff Salaries & Allowances", code: "EXP-SALARY" },
    { name: "Office Rent & Maintenance", code: "EXP-RENT" },
    { name: "Packaging & Cold Chain Ice", code: "EXP-PACK" },
  ];

  for (const exp of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: {
        companyId_name: {
          companyId: company.id,
          name: exp.name,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        name: exp.name,
        code: exp.code,
        isActive: true,
      },
    });
  }
  console.log("✅ Expense Categories seeded");

  console.log("🎉 Offline SQLite database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
