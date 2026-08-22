import * as React from "react";
import { getBatchesAction, getWarehousesAction } from "@/server/actions/inventory.actions";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const [batchesRes, warehousesRes] = await Promise.all([
    getBatchesAction(),
    getWarehousesAction(),
  ]);

  return (
    <InventoryClient
      initialBatches={batchesRes.data || []}
      warehouses={warehousesRes.data || []}
    />
  );
}
