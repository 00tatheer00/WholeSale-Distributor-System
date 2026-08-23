import {
  PrismaClient,
  UserRole,
  UserStatus,
  RecordStatus,
  CustomerStatus,
  CustomerType,
  DistributorStatus,
  DosageForm,
  StorageCondition,
  StorageZone,
  BatchStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding for Wholesale Medicine Distribution ERP...");

  // 1. Clean existing records if any exist (safe check)
  try {
    const count = await prisma.company.count();
    if (count > 0) {
      console.log("ℹ️ Existing data found, skipping delete step.");
    }
  } catch (e) {
    console.log("Starting fresh seed...");
  }

  // 2. Seed Default Company & Business Settings
  const company = await prisma.company.create({
    data: {
      name: "Apex Pharma Distributors Ltd.",
      tradeLicenseNo: "TRAD-DH-2024-8849",
      drugLicenseNo: "DL-DH-09182-W",
      taxIdTin: "8291039182",
      email: "info@apexpharmadist.com",
      phone: "+880 1711 000111",
      address: "Plot 14, Commercial Zone, Tejgaon Industrial Area",
      city: "Dhaka",
      country: "Bangladesh",
      currency: "BDT",
      defaultCreditDays: 30,
      defaultVatPercent: 0.00, // Medicine VAT is often exempt or zero-rated
      enableFefoStrict: true,
      lowStockThreshold: 20,
      nearExpiryDays: 90,
      invoiceFooterText: "Goods once sold are subject to wholesale returns policy within 7 days. Licensed wholesale drug stockist.",
    },
  });

  console.log(`✅ Seeded Company: ${company.name}`);

  // 3. Seed Users across system roles
  const superAdmin = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "admin@pharmadist.com",
      name: "Rafiqul Islam",
      phone: "+880 1819 112233",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const salesManager = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "sales.manager@pharmadist.com",
      name: "Kamal Hossain",
      phone: "+880 1712 334455",
      role: UserRole.SALES_MANAGER,
      status: UserStatus.ACTIVE,
    },
  });

  const warehouseManager = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "warehouse@pharmadist.com",
      name: "Tareq Mahmud",
      phone: "+880 1913 556677",
      role: UserRole.WAREHOUSE_MANAGER,
      status: UserStatus.ACTIVE,
    },
  });

  const accountsOfficer = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "accounts@pharmadist.com",
      name: "Shahidul Alam",
      phone: "+880 1515 778899",
      role: UserRole.ACCOUNTS_OFFICER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`✅ Seeded 4 System Users (Admin, Sales Manager, Warehouse Manager, Accounts)`);

  // 4. Seed Warehouse & Storage Racks
  const centralWarehouse = await prisma.warehouse.create({
    data: {
      companyId: company.id,
      name: "Central Logistics Hub",
      code: "WH-CENTRAL-01",
      location: "Tejgaon Hub, Building A",
      isDefault: true,
      isActive: true,
    },
  });

  const rackA1 = await prisma.rack.create({
    data: {
      warehouseId: centralWarehouse.id,
      rackCode: "RACK-A-01",
      zone: StorageZone.GENERAL,
      description: "General Analgesics & Antibiotics (Fast Moving)",
    },
  });

  const rackCold = await prisma.rack.create({
    data: {
      warehouseId: centralWarehouse.id,
      rackCode: "COLD-ZONE-01",
      zone: StorageZone.COLD_ROOM,
      description: "Cold Chain 2-8°C Refrigerated Vaccines & Insulin",
    },
  });

  console.log(`✅ Seeded Warehouse and Racks (General & Cold Chain)`);

  // 5. Seed Medicine Categories
  const catAnalgesic = await prisma.medicineCategory.create({
    data: {
      name: "Analgesics & Antipyretics",
      code: "CAT-ANALG",
      description: "Pain relief and fever reducing pharmaceuticals",
      isActive: true,
    },
  });

  const catAntibiotic = await prisma.medicineCategory.create({
    data: {
      name: "Antibiotics & Antimicrobials",
      code: "CAT-ANTIB",
      description: "Broad-spectrum and targeted antibacterial drugs",
      isActive: true,
    },
  });

  const catGastro = await prisma.medicineCategory.create({
    data: {
      name: "Gastrointestinal & Anti-Ulcerants",
      code: "CAT-GASTRO",
      description: "Proton pump inhibitors, antacids, and H2 blockers",
      isActive: true,
    },
  });

  const catCardio = await prisma.medicineCategory.create({
    data: {
      name: "Cardiovascular & Antihypertensives",
      code: "CAT-CARDIO",
      description: "Blood pressure, beta blockers and cardiac medications",
      isActive: true,
    },
  });

  console.log(`✅ Seeded 4 Medicine Categories`);

  // 6. Seed Pharmaceutical Suppliers / Manufacturers
  const supplierSquare = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: "Square Pharmaceuticals PLC",
      code: "SUPP-SQUARE",
      contactPerson: "Mahbubur Rahman (Key Account Manager)",
      phone: "+880 2 8833047",
      email: "order@squarepharma.com",
      address: "Square Centre, 48 Mohakhali C/A",
      city: "Dhaka",
      drugLicenseNo: "DL-MFG-00129",
      creditPeriodDays: 45,
      openingBalance: 0.00,
      currentDue: 0.00,
    },
  });

  const supplierBeximco = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: "Beximco Pharmaceuticals Ltd.",
      code: "SUPP-BEXIMCO",
      contactPerson: "Anisur Zaman",
      phone: "+880 2 58611001",
      email: "supply@beximcopharma.com",
      address: "19 Dhanmondi R/A, Road 7",
      city: "Dhaka",
      drugLicenseNo: "DL-MFG-00244",
      creditPeriodDays: 30,
      openingBalance: 0.00,
      currentDue: 0.00,
    },
  });

  const supplierIncepta = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: "Incepta Pharmaceuticals Ltd.",
      code: "SUPP-INCEPTA",
      contactPerson: "Dr. Farhan Kabir",
      phone: "+880 2 8891688",
      email: "distribution@inceptapharma.com",
      address: "40 Shahid Tajuddin Ahmed Sarani, Tejgaon",
      city: "Dhaka",
      drugLicenseNo: "DL-MFG-00381",
      creditPeriodDays: 30,
      openingBalance: 0.00,
      currentDue: 0.00,
    },
  });

  console.log(`✅ Seeded 3 Major Pharmaceutical Suppliers`);

  // 7. Seed Medicines (Master Drug Catalog)
  const medNapaExtra = await prisma.medicine.create({
    data: {
      companyId: company.id,
      categoryId: catAnalgesic.id,
      supplierId: supplierBeximco.id,
      brandName: "Napa Extra",
      genericName: "Paracetamol 500mg + Caffeine 65mg",
      skuCode: "MED-NAPA-EXT",
      darNumber: "DAR-028-011-042",
      dosageForm: DosageForm.TABLET,
      strength: "500mg + 65mg",
      unitOfMeasure: "BOX",
      packSize: "20 x 10 Blister Strips (200 Tablets)",
      stripPerBox: 20,
      unitsPerStrip: 10,
      minReorderLevel: 100,
      storageCondition: StorageCondition.ROOM_TEMPERATURE,
      defaultTradePrice: 400.00, // Trade price per box
      defaultMrp: 500.00,        // MRP per box (2.50 BDT / tablet)
      vatPercent: 0.00,
      status: RecordStatus.ACTIVE,
    },
  });

  const medSeclo20 = await prisma.medicine.create({
    data: {
      companyId: company.id,
      categoryId: catGastro.id,
      supplierId: supplierSquare.id,
      brandName: "Seclo 20mg",
      genericName: "Omeprazole",
      skuCode: "MED-SECLO-20",
      darNumber: "DAR-001-089-019",
      dosageForm: DosageForm.CAPSULE,
      strength: "20mg",
      unitOfMeasure: "BOX",
      packSize: "10 x 10 Alu-Alu Strips (100 Capsules)",
      stripPerBox: 10,
      unitsPerStrip: 10,
      minReorderLevel: 80,
      storageCondition: StorageCondition.ROOM_TEMPERATURE,
      defaultTradePrice: 425.00,
      defaultMrp: 500.00,
      vatPercent: 0.00,
      status: RecordStatus.ACTIVE,
    },
  });

  const medMoxacil500 = await prisma.medicine.create({
    data: {
      companyId: company.id,
      categoryId: catAntibiotic.id,
      supplierId: supplierSquare.id,
      brandName: "Moxacil 500mg",
      genericName: "Amoxicillin Trihydrate",
      skuCode: "MED-MOX-500",
      darNumber: "DAR-001-012-077",
      dosageForm: DosageForm.CAPSULE,
      strength: "500mg",
      unitOfMeasure: "BOX",
      packSize: "10 x 10 Blister Strips (100 Capsules)",
      stripPerBox: 10,
      unitsPerStrip: 10,
      minReorderLevel: 50,
      storageCondition: StorageCondition.ROOM_TEMPERATURE,
      defaultTradePrice: 580.00,
      defaultMrp: 680.00,
      vatPercent: 0.00,
      status: RecordStatus.ACTIVE,
    },
  });

  console.log(`✅ Seeded 3 Medicines with Multi-Unit Conversions`);

  // 8. Seed Multiple Batches per Medicine (Demonstrating FEFO ordering)
  // Napa Extra - Batch 1 (Expires earlier: 2026-11-30) -> Should be allocated FIRST under FEFO
  const batchNapa1 = await prisma.medicineBatch.create({
    data: {
      medicineId: medNapaExtra.id,
      warehouseId: centralWarehouse.id,
      rackId: rackA1.id,
      supplierId: supplierBeximco.id,
      batchNumber: "BEX-NPX-2025-01",
      mfgDate: new Date("2024-12-01"),
      expiryDate: new Date("2026-11-30"), // Earlier expiry
      purchaseCostPrice: 340.00,           // Historical acquisition cost per box
      tradePrice: 400.00,
      mrp: 500.00,
      quantityOnHand: 250,
      quantityReserved: 0,
      quantityAvailable: 250,
      status: BatchStatus.ACTIVE,
    },
  });

  // Napa Extra - Batch 2 (Expires later: 2027-08-31) -> Should be allocated SECOND under FEFO
  const batchNapa2 = await prisma.medicineBatch.create({
    data: {
      medicineId: medNapaExtra.id,
      warehouseId: centralWarehouse.id,
      rackId: rackA1.id,
      supplierId: supplierBeximco.id,
      batchNumber: "BEX-NPX-2025-02",
      mfgDate: new Date("2025-03-01"),
      expiryDate: new Date("2027-08-31"), // Later expiry
      purchaseCostPrice: 348.00,           // Cost slightly increased, preserving separate COGS!
      tradePrice: 400.00,
      mrp: 500.00,
      quantityOnHand: 500,
      quantityReserved: 0,
      quantityAvailable: 500,
      status: BatchStatus.ACTIVE,
    },
  });

  // Seclo 20mg - Batch 1
  const batchSeclo1 = await prisma.medicineBatch.create({
    data: {
      medicineId: medSeclo20.id,
      warehouseId: centralWarehouse.id,
      rackId: rackA1.id,
      supplierId: supplierSquare.id,
      batchNumber: "SQ-SEC-2025-99",
      mfgDate: new Date("2025-01-15"),
      expiryDate: new Date("2027-06-30"),
      purchaseCostPrice: 360.00,
      tradePrice: 425.00,
      mrp: 500.00,
      quantityOnHand: 300,
      quantityReserved: 0,
      quantityAvailable: 300,
      status: BatchStatus.ACTIVE,
    },
  });

  // Moxacil 500mg - Batch 1
  const batchMoxacil1 = await prisma.medicineBatch.create({
    data: {
      medicineId: medMoxacil500.id,
      warehouseId: centralWarehouse.id,
      rackId: rackA1.id,
      supplierId: supplierSquare.id,
      batchNumber: "SQ-MOX-2025-44",
      mfgDate: new Date("2025-02-01"),
      expiryDate: new Date("2027-01-31"),
      purchaseCostPrice: 490.00,
      tradePrice: 580.00,
      mrp: 680.00,
      quantityOnHand: 180,
      quantityReserved: 0,
      quantityAvailable: 180,
      status: BatchStatus.ACTIVE,
    },
  });

  console.log(`✅ Seeded 4 Medicine Batches with distinct expiry dates and COGS costs`);

  // 9. Seed Distributors / Field Sales Representatives
  const distributor1 = await prisma.distributor.create({
    data: {
      companyId: company.id,
      name: "Arifur Rahman (Territory Officer)",
      employeeCode: "SR-DHK-01",
      phone: "+880 1715 889900",
      email: "arif.sales@pharmadist.com",
      assignedTerritory: "Dhaka South Division",
      assignedRoute: "Dhanmondi - Green Road Beat",
      commissionRatePercent: 1.50, // 1.5% commission on sales
      monthlySalesTarget: 500000.00,
      joiningDate: new Date("2024-01-01"),
      status: DistributorStatus.ACTIVE,
    },
  });

  const distributor2 = await prisma.distributor.create({
    data: {
      companyId: company.id,
      name: "Mehedi Hasan (Territory Officer)",
      employeeCode: "SR-DHK-02",
      phone: "+880 1916 223344",
      email: "mehedi.sales@pharmadist.com",
      assignedTerritory: "Dhaka North Division",
      assignedRoute: "Uttara - Mirpur Beat",
      commissionRatePercent: 1.50,
      monthlySalesTarget: 600000.00,
      joiningDate: new Date("2024-03-15"),
      status: DistributorStatus.ACTIVE,
    },
  });

  console.log(`✅ Seeded 2 Distributors / Field Salesmen`);

  // 10. Seed Customer Pharmacies (B2B Licensed Wholesale Clients)
  const customer1 = await prisma.customer.create({
    data: {
      companyId: company.id,
      distributorId: distributor1.id,
      pharmacyName: "Green Life Model Pharmacy",
      proprietorName: "Dr. Anowar Hossain",
      customerCode: "CUST-DH-001",
      drugLicenseNo: "DL-DH-RET-09812",
      drugLicenseExpiry: new Date("2027-12-31"),
      taxTin: "71829301928",
      phone: "+880 1712 111222",
      address: "32 Green Road, Dhanmondi",
      city: "Dhaka",
      territory: "Dhaka South",
      creditLimit: 150000.00,
      creditDaysLimit: 30,
      openingBalance: 0.00,
      currentDue: 0.00,
      customerType: CustomerType.RETAIL_PHARMACY,
      status: CustomerStatus.ACTIVE,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      companyId: company.id,
      distributorId: distributor1.id,
      pharmacyName: "Popular Hospital Dispensary & Pharmacy",
      proprietorName: "Popular Health Services Ltd.",
      customerCode: "CUST-DH-002",
      drugLicenseNo: "DL-DH-HOSP-01284",
      drugLicenseExpiry: new Date("2028-06-30"),
      taxTin: "99182301923",
      phone: "+880 2 9669480",
      address: "House 16, Road 2, Dhanmondi",
      city: "Dhaka",
      territory: "Dhaka South",
      creditLimit: 500000.00,
      creditDaysLimit: 45,
      openingBalance: 0.00,
      currentDue: 0.00,
      customerType: CustomerType.HOSPITAL_DISPENSARY,
      status: CustomerStatus.ACTIVE,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      companyId: company.id,
      distributorId: distributor2.id,
      pharmacyName: "Medix Central Pharmacy",
      proprietorName: "Kazi Jahirul Islam",
      customerCode: "CUST-DH-003",
      drugLicenseNo: "DL-DH-RET-04812",
      drugLicenseExpiry: new Date("2026-10-31"),
      phone: "+880 1819 445566",
      address: "Sector 3, Uttara Model Town",
      city: "Dhaka",
      territory: "Dhaka North",
      creditLimit: 100000.00,
      creditDaysLimit: 30,
      openingBalance: 0.00,
      currentDue: 0.00,
      customerType: CustomerType.RETAIL_PHARMACY,
      status: CustomerStatus.ACTIVE,
    },
  });

  console.log(`✅ Seeded 3 Customer Pharmacies & Hospital Dispensaries`);

  // 11. Seed Expense Categories
  const expRent = await prisma.expenseCategory.create({
    data: {
      companyId: company.id,
      name: "Warehouse Rent & Facility",
      code: "EXP-RENT",
      description: "Monthly warehouse lease and security charges",
      isDirectCost: false,
      isActive: true,
    },
  });

  const expLogistics = await prisma.expenseCategory.create({
    data: {
      companyId: company.id,
      name: "Delivery Van Fuel & Logistics",
      code: "EXP-LOGIS",
      description: "Delivery van fuel, maintenance and carrier charges",
      isDirectCost: true,
      isActive: true,
    },
  });

  const expUtilities = await prisma.expenseCategory.create({
    data: {
      companyId: company.id,
      name: "Electricity & Cold Chain Utilities",
      code: "EXP-UTIL",
      description: "Electricity and cold chain refrigerator backup power",
      isDirectCost: true,
      isActive: true,
    },
  });

  const expSalaries = await prisma.expenseCategory.create({
    data: {
      companyId: company.id,
      name: "Staff Salaries & Allowances",
      code: "EXP-SALARY",
      description: "Warehouse, sales and administrative payroll",
      isDirectCost: false,
      isActive: true,
    },
  });

  // 12. Seed Taxes & Discounts
  await prisma.tax.create({
    data: {
      name: "Zero Rated Medicine Supply",
      code: "VAT-00",
      ratePercent: 0.00,
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.discount.create({
    data: {
      name: "Standard Wholesale Margin Discount",
      discountType: "PERCENTAGE",
      value: 0.00,
      isActive: true,
    },
  });

  console.log("🚀 Base database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
