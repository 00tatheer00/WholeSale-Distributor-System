import * as React from "react";
import { getMedicinesAction, getMedicineCategoriesAction } from "@/server/actions/medicine.actions";
import { getSuppliersAction } from "@/server/actions/supplier.actions";
import { MedicineClient } from "./medicine-client";

export default async function MedicinesPage() {
  const [medicinesRes, categoriesRes, suppliersRes] = await Promise.all([
    getMedicinesAction(),
    getMedicineCategoriesAction(),
    getSuppliersAction(),
  ]);

  return (
    <MedicineClient
      initialMedicines={medicinesRes.data || []}
      categories={categoriesRes.data || []}
      suppliers={suppliersRes.data || []}
    />
  );
}
