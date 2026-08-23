import * as React from "react";
import { getStockAdjustmentsAction } from "@/server/actions/inventory.actions";
import { getMedicinesAction } from "@/server/actions/medicine.actions";
import { getBatchesAction } from "@/server/actions/inventory.actions";
import { AdjustmentsClient } from "./adjustments-client";

export default async function InventoryAdjustmentsPage() {
  const [adjustmentsRes, medicinesRes, batchesRes] = await Promise.all([
    getStockAdjustmentsAction(),
    getMedicinesAction({ page: 1, pageSize: 100 }),
    getBatchesAction(),
  ]);

  const adjustments = adjustmentsRes.data || [];
  const medicines = medicinesRes.data || [];
  const batches = batchesRes.data || [];

  return (
    <AdjustmentsClient
      initialAdjustments={adjustments}
      medicines={medicines}
      batches={batches}
    />
  );
}
