import {
  PrismaClient,
  UserRole,
  UserStatus,
  RecordStatus,
  StorageZone,
  CustomerType,
  CustomerStatus,
  DosageForm,
  StorageCondition,
  BatchStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive offline SQLite database seeding...");

  // 1. Create / Upsert Default Company
  const company = await prisma.company.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "PharmaDist Wholesale Medicine Distributors",
      tradeLicenseNo: "TL-PK-2024-9872",
      drugLicenseNo: "DRAP-DL-KHI-4402",
      taxIdTin: "NTN-9873421-KHI",
      email: "admin@pharmadist.pk",
      phone: "+92 21 34567890",
      address: "Plot 14, Commercial Zone, Korangi Industrial Area",
      city: "Karachi",
      country: "Pakistan",
      currency: "PKR",
      defaultCreditDays: 30,
      defaultVatPercent: 0,
      enableFefoStrict: true,
      lowStockThreshold: 20,
      nearExpiryDays: 90,
      invoiceFooterText: "Thank you for your business. Strictly wholesale FEFO batch-tracked distribution per DRAP regulations.",
    },
  });

  console.log("✅ Company configured:", company.name);

  // 2. Hash Passwords
  const adminPasswordHash = await bcrypt.hash("admin@123", 10);
  const admin123Hash = await bcrypt.hash("admin123", 10);
  const sales123Hash = await bcrypt.hash("sales123", 10);
  const warehouse123Hash = await bcrypt.hash("warehouse123", 10);
  const accounts123Hash = await bcrypt.hash("accounts123", 10);

  // 3. Create Default Users
  const users = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      email: "admin@pharmadist.com",
      name: "Super Admin",
      phone: "+92 300 1001100",
      role: UserRole.SUPER_ADMIN,
      passwordHash: admin123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      email: "sales.manager@pharmadist.com",
      name: "Sales Manager",
      phone: "+92 300 1001200",
      role: UserRole.SALES_MANAGER,
      passwordHash: sales123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      email: "warehouse@pharmadist.com",
      name: "Warehouse Officer",
      phone: "+92 300 1001300",
      role: UserRole.WAREHOUSE_MANAGER,
      passwordHash: warehouse123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      email: "accounts@pharmadist.com",
      name: "Accounts Officer",
      phone: "+92 300 1001400",
      role: UserRole.ACCOUNTS_OFFICER,
      passwordHash: accounts123Hash,
    },
    {
      id: "00000000-0000-0000-0000-000000000010",
      email: "admin@erp.com",
      name: "Tatheer Admin",
      phone: "+92 300 1001111",
      role: UserRole.SUPER_ADMIN,
      passwordHash: adminPasswordHash,
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
  console.log("✅ Core Users created (admin@pharmadist.com / admin123)");

  // 4. Default Warehouse & Racks
  const warehouse = await prisma.warehouse.upsert({
    where: { code: "MAIN-WH" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000020",
      companyId: company.id,
      name: "Central Distribution Warehouse",
      code: "MAIN-WH",
      location: "Building A, Korangi Industrial Area, Karachi",
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

  const createdCategories = [];
  for (const c of categories) {
    const cat = await prisma.medicineCategory.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        code: c.code,
        isActive: true,
      },
    });
    createdCategories.push(cat);
  }
  console.log("✅ Medicine Categories seeded");

  // 6. Suppliers
  const suppliers = [
    {
      name: "Ariana Medical Importers Ltd",
      code: "SUP-AF-001",
      phone: "+92 321 1234567",
      email: "orders@arianamed.pk",
      city: "Karachi",
      address: "Korangi Industrial Area, Karachi",
    },
    {
      name: "Maiwand Drug Distributors",
      code: "SUP-AF-002",
      phone: "+92 42 4567890",
      email: "supply@maiwandpharma.pk",
      city: "Lahore",
      address: "Daroghawala Pharma Market, Lahore",
    },
  ];

  const createdSuppliers = [];
  for (const s of suppliers) {
    const sup = await prisma.supplier.upsert({
      where: { code: s.code },
      update: {},
      create: {
        companyId: company.id,
        name: s.name,
        code: s.code,
        phone: s.phone,
        email: s.email,
        city: s.city,
        address: s.address,
        status: RecordStatus.ACTIVE,
      },
    });
    createdSuppliers.push(sup);
  }
  console.log("✅ Suppliers seeded");

  // 7. Customers (Pharmacies & Clinics)
  const customers = [
    {
      pharmacyName: "Shafa Central Model Pharmacy",
      proprietorName: "Dr. Mohammad Tariq",
      customerCode: "CUST-KBL-001",
      drugLicenseNo: "DL-KBL-2024-110",
      phone: "+92 300 1112233",
      city: "Karachi",
      address: "Saddar Bazaar, District South",
      creditLimit: 250000,
      creditDaysLimit: 30,
      customerType: CustomerType.RETAIL_PHARMACY,
    },
    {
      pharmacyName: "Clifton Care Specialized Clinic",
      proprietorName: "Dr. Ahmad Wahid",
      customerCode: "CUST-KHI-002",
      drugLicenseNo: "DRAP-DL-KHI-2024-220",
      phone: "+92 321 2223344",
      city: "Karachi",
      address: "Block 5, Clifton, Main Boulevard",
      creditLimit: 400000,
      creditDaysLimit: 45,
      customerType: CustomerType.CLINIC_INSTITUTION,
    },
    {
      pharmacyName: "Lahore Al-Razi Dispensary",
      proprietorName: "Dr. Zahir Shah",
      customerCode: "CUST-LHR-003",
      drugLicenseNo: "DRAP-DL-LHR-2024-330",
      phone: "+92 42 3334455",
      city: "Lahore",
      address: "Anarkali Bazaar, Main Market",
      creditLimit: 180000,
      creditDaysLimit: 30,
      customerType: CustomerType.RETAIL_PHARMACY,
    },
  ];

  for (const cust of customers) {
    await prisma.customer.upsert({
      where: { customerCode: cust.customerCode },
      update: {},
      create: {
        companyId: company.id,
        pharmacyName: cust.pharmacyName,
        proprietorName: cust.proprietorName,
        customerCode: cust.customerCode,
        drugLicenseNo: cust.drugLicenseNo,
        phone: cust.phone,
        city: cust.city,
        address: cust.address,
        creditLimit: cust.creditLimit,
        creditDaysLimit: cust.creditDaysLimit,
        currentDue: 0,
        customerType: cust.customerType,
        status: CustomerStatus.ACTIVE,
      },
    });
  }
  console.log("✅ Customer Pharmacies seeded");

  // 8. Medicines & FEFO Batches
  const medicines = [
    {
      brandName: "Amoxicillin 500mg Capsules",
      genericName: "Amoxicillin Trihydrate",
      skuCode: "MED-AMX-500",
      categoryId: createdCategories[0].id,
      dosageForm: DosageForm.CAPSULE,
      strength: "500mg",
      packSize: "10x10 Strips (100 Caps)",
      stripPerBox: 10,
      unitsPerStrip: 10,
      defaultTradePrice: 460,
      defaultMrp: 550,
      batches: [
        {
          batchNumber: "AMX-24-01",
          expiryDate: new Date("2026-11-30"),
          costPrice: 380,
          tradePrice: 460,
          mrp: 550,
          quantity: 350,
        },
        {
          batchNumber: "AMX-25-02",
          expiryDate: new Date("2027-08-31"),
          costPrice: 395,
          tradePrice: 460,
          mrp: 550,
          quantity: 600,
        },
      ],
    },
    {
      brandName: "Paracetamol 500mg Extra Tablets",
      genericName: "Paracetamol + Caffeine",
      skuCode: "MED-PAR-500",
      categoryId: createdCategories[1].id,
      dosageForm: DosageForm.TABLET,
      strength: "500mg / 65mg",
      packSize: "20x10 Tablets (200 Tabs)",
      stripPerBox: 20,
      unitsPerStrip: 10,
      defaultTradePrice: 280,
      defaultMrp: 340,
      batches: [
        {
          batchNumber: "PAR-24-99",
          expiryDate: new Date("2026-12-31"),
          costPrice: 220,
          tradePrice: 280,
          mrp: 340,
          quantity: 500,
        },
      ],
    },
    {
      brandName: "Omeprazole 20mg Delayed-Release",
      genericName: "Omeprazole Magnesium",
      skuCode: "MED-OMP-20",
      categoryId: createdCategories[3].id,
      dosageForm: DosageForm.CAPSULE,
      strength: "20mg",
      packSize: "14x10 Capsules (140 Caps)",
      stripPerBox: 14,
      unitsPerStrip: 10,
      defaultTradePrice: 510,
      defaultMrp: 600,
      batches: [
        {
          batchNumber: "OMP-25-01",
          expiryDate: new Date("2027-06-30"),
          costPrice: 420,
          tradePrice: 510,
          mrp: 600,
          quantity: 400,
        },
      ],
    },
    {
      brandName: "Ciprofloxacin 500mg USP",
      genericName: "Ciprofloxacin HCl",
      skuCode: "MED-CIP-500",
      categoryId: createdCategories[0].id,
      dosageForm: DosageForm.TABLET,
      strength: "500mg",
      packSize: "10x10 Tablets (100 Tabs)",
      stripPerBox: 10,
      unitsPerStrip: 10,
      defaultTradePrice: 620,
      defaultMrp: 720,
      batches: [
        {
          batchNumber: "CIP-25-11",
          expiryDate: new Date("2027-10-31"),
          costPrice: 520,
          tradePrice: 620,
          mrp: 720,
          quantity: 280,
        },
      ],
    },
  ];

  for (const m of medicines) {
    const med = await prisma.medicine.upsert({
      where: { skuCode: m.skuCode },
      update: {},
      create: {
        companyId: company.id,
        brandName: m.brandName,
        genericName: m.genericName,
        skuCode: m.skuCode,
        categoryId: m.categoryId,
        supplierId: createdSuppliers[0].id,
        dosageForm: m.dosageForm,
        strength: m.strength,
        packSize: m.packSize,
        stripPerBox: m.stripPerBox,
        unitsPerStrip: m.unitsPerStrip,
        defaultTradePrice: m.defaultTradePrice,
        defaultMrp: m.defaultMrp,
        status: RecordStatus.ACTIVE,
      },
    });

    for (const b of m.batches) {
      await prisma.medicineBatch.upsert({
        where: {
          medicineId_warehouseId_batchNumber: {
            medicineId: med.id,
            warehouseId: warehouse.id,
            batchNumber: b.batchNumber,
          },
        },
        update: {},
        create: {
          medicineId: med.id,
          warehouseId: warehouse.id,
          supplierId: createdSuppliers[0].id,
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          purchaseCostPrice: b.costPrice,
          tradePrice: b.tradePrice,
          mrp: b.mrp,
          quantityOnHand: b.quantity,
          quantityAvailable: b.quantity,
          quantityReserved: 0,
          status: BatchStatus.ACTIVE,
        },
      });
    }
  }
  console.log("✅ Medicines and FEFO Batches seeded with PKR pricing");

  console.log("🎉 Complete offline SQLite database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
