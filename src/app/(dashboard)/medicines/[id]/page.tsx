import * as React from "react";
import { notFound } from "next/navigation";
import { getMedicineByIdAction } from "@/server/actions/medicine.actions";
import { getBatchesByMedicineIdAction } from "@/server/actions/batch.actions";
import { getSuppliersAction } from "@/server/actions/supplier.actions";
import { getWarehousesAction } from "@/server/actions/warehouse.actions";
import { MedicineDetailClient } from "./medicine-detail-client";

interface MedicineDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MedicineDetailPage({ params }: MedicineDetailPageProps) {
  const { id } = await params;

  const [medicineRes, batchesRes, suppliersRes, warehousesRes] = await Promise.all([
    getMedicineByIdAction(id),
    getBatchesByMedicineIdAction(id),
    getSuppliersAction(),
    getWarehousesAction(),
  ]);

  if (!medicineRes.success || !medicineRes.data) {
    notFound();
  }

  const medicine = medicineRes.data;
  const batches = batchesRes.data || [];
  const suppliers = suppliersRes.data?.suppliers || [];
  const warehouses = (warehousesRes.data || []).map((w: any) => ({
    id: w.id,
    name: `${w.name}${w.isDefault ? " (Default)" : ""}`,
  }));

  return (
    <MedicineDetailClient
      medicine={medicine}
      initialBatches={batches}
      warehouses={warehouses}
      suppliers={suppliers}
    />
  );
}
