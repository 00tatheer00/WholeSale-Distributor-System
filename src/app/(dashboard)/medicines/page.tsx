import * as React from "react";
import { getMedicinesAction } from "@/server/actions/medicine.actions";
import { getCategoriesAction } from "@/server/actions/category.actions";
import { getSuppliersAction } from "@/server/actions/supplier.actions";
import { getManufacturersAction } from "@/server/actions/manufacturer.actions";
import { MedicineClient } from "./medicine-client";

export default async function MedicinesPage() {
  const [medicinesRes, categoriesRes, suppliersRes, manufacturersRes] = await Promise.all([
    getMedicinesAction({ page: 1, pageSize: 20 }),
    getCategoriesAction(),
    getSuppliersAction(),
    getManufacturersAction({ isActive: true }),
  ]);

  const medicines = medicinesRes.data || [];
  const categories = categoriesRes.data || [];
  const suppliers = suppliersRes.data?.suppliers || [];
  const manufacturers = (manufacturersRes.data || []).map((m) => ({ id: m.id, name: m.name }));

  return (
    <MedicineClient
      initialMedicines={medicines}
      categories={categories}
      suppliers={suppliers}
      manufacturers={manufacturers}
      totalCount={medicinesRes.totalCount || medicines.length}
      totalPages={medicinesRes.totalPages || 1}
      initialPage={1}
    />
  );
}
