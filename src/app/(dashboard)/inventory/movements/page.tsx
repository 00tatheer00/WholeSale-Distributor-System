import * as React from "react";
import { getStockMovementsAction } from "@/server/actions/inventory.actions";
import { MovementsClient } from "./movements-client";

export default async function InventoryMovementsPage() {
  const movementsRes = await getStockMovementsAction({ pageSize: 100 });
  const movements = movementsRes.data || [];

  return <MovementsClient initialMovements={movements} />;
}
