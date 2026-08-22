import * as React from "react";
import { getMedicinesAction } from "@/server/actions/medicine.actions";
import { getCategoriesAction } from "@/server/actions/category.actions";
import { getSuppliersAction } from "@/server/actions/supplier.actions";
import { MedicineClient } from "./medicine-client";

export default async function MedicinesPage() {
  const [medicinesRes, categoriesRes, suppliersRes] = await Promise.all([
    getMedicinesAction({ page: 1, pageSize: 20 }),
    getCategoriesAction(),
    getSuppliersAction(),
  ]);

  const medicines = medicinesRes.data || [];
  const categories = categoriesRes.data || [];
  const suppliers = suppliersRes.data || [];

  return (
    <MedicineClient
      initialMedicines={medicines}
      categories={categories}
      suppliers={suppliers}
      totalCount={medicinesRes.totalCount || medicines.length}
      totalPages={medicinesRes.totalPages || 1}
      initialPage={1}
    />
  );
}
