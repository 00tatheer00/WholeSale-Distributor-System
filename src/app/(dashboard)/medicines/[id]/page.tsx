import * as React from "react";
import { notFound } from "next/navigation";
import { getMedicineByIdAction } from "@/server/actions/medicine.actions";
import { getBatchesByMedicineIdAction } from "@/server/actions/batch.actions";
import { getSuppliersAction } from "@/server/actions/supplier.actions";
import { MedicineDetailClient } from "./medicine-detail-client";

interface MedicineDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MedicineDetailPage({ params }: MedicineDetailPageProps) {
  const { id } = await params;

  const [medicineRes, batchesRes, suppliersRes] = await Promise.all([
    getMedicineByIdAction(id),
    getBatchesByMedicineIdAction(id),
    getSuppliersAction(),
  ]);

  if (!medicineRes.success || !medicineRes.data) {
    notFound();
  }

  const medicine = medicineRes.data;
  const batches = batchesRes.data || [];
  const suppliers = suppliersRes.data || [];
  const warehouses = [
    { id: "wh-001", name: "Tejgaon Central Warehouse (Air-Conditioned)" },
    { id: "wh-002", name: "Mirpur Transit Distribution Hub" },
    { id: "wh-003", name: "Cold-Room Vaccine Depository (2-8°C)" },
  ];

  return (
    <MedicineDetailClient
      medicine={medicine}
      initialBatches={batches}
      warehouses={warehouses}
      suppliers={suppliers}
    />
  );
}
