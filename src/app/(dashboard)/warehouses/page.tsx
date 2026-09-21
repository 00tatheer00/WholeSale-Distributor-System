import * as React from "react";
import { getWarehousesAction } from "@/server/actions/warehouse.actions";
import { WarehousesClient } from "./warehouses-client";

export const metadata = {
  title: "Warehouses | PharmaDist ERP",
  description: "Storage facilities, central distribution hubs, and physical locations",
};

export default async function WarehousesPage() {
  const result = await getWarehousesAction();
  const warehouses = result.success && result.data ? result.data : [];

  return <WarehousesClient initialWarehouses={warehouses} />;
}
