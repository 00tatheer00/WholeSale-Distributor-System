import * as React from "react";
import { prisma } from "@/lib/prisma";
import { SaleOrderForm } from "./sale-order-form";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const now = new Date();

  try {
    // 1. Fetch Customers
    const rawCustomers = await prisma.customer.findMany({
      where: { status: { not: "INACTIVE" } },
      orderBy: { pharmacyName: "asc" },
    });

    const customers = rawCustomers.map((c) => ({
      id: c.id,
      customerCode: c.customerCode,
      tradeName: c.pharmacyName,
      proprietorName: c.proprietorName,
      customerType: c.customerType,
      drugLicenseNo: c.drugLicenseNo,
      drugLicenseExpiry: c.drugLicenseExpiry?.toISOString().split("T")[0] || "",
      phone: c.phone,
      deliveryAddress: c.address,
      city: c.city || "Dhaka",
      creditLimit: Number(c.creditLimit),
      currentDue: Number(c.currentDue),
      availableCredit: Math.max(0, Number(c.creditLimit) - Number(c.currentDue)),
      status: c.status,
    }));

    // 2. Fetch Active Medicines with FEFO-sorted Valid Batches
    const rawMedicines = await prisma.medicine.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: true,
        batches: {
          where: {
            quantityOnHand: { gt: 0 },
            expiryDate: { gt: now },
          },
          orderBy: { expiryDate: "asc" }, // Strict FEFO ordering
        },
      },
      orderBy: { brandName: "asc" },
    });

    const medicines = rawMedicines.map((m) => ({
      id: m.id,
      brandName: m.brandName,
      genericName: m.genericName,
      strength: m.strength,
      dosageForm: m.dosageForm,
      categoryName: m.category?.name || "General",
      unitTradePrice: Number(m.defaultTradePrice),
      unitMrp: Number(m.defaultMrp),
      vatPercent: Number(m.vatPercent),
      totalStockOnHand: m.batches.reduce((sum: number, b: any) => sum + b.quantityOnHand, 0),
      batches: m.batches.map((b) => ({
        id: b.id,
        batchNumber: b.batchNumber,
        expiryDate: b.expiryDate.toISOString().split("T")[0],
        quantityOnHand: b.quantityOnHand,
        unitPurchaseCost: Number(b.purchaseCostPrice),
        unitTradePrice: Number(b.tradePrice),
        unitMrp: Number(b.mrp),
      })),
    }));

    // 3. Fetch Distributors
    const rawDistributors = await prisma.distributor.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    });

    const distributors = rawDistributors.map((d) => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      assignedTerritory: d.assignedTerritory || "General Route",
    }));

    return (
      <SaleOrderForm
        customers={customers}
        medicines={medicines}
        distributors={distributors}
      />
    );
  } catch (err) {
    console.warn("DB offline during build, rendering empty form shell");
    return (
      <SaleOrderForm
        customers={[]}
        medicines={[]}
        distributors={[]}
      />
    );
  }
}
