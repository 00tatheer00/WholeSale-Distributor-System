import * as React from "react";
import { getStockTransfersAction } from "@/server/actions/transfer.actions";
import { getWarehousesAction } from "@/server/actions/warehouse.actions";
import { TransfersClient } from "./transfers-client";

export const metadata = {
  title: "Stock Transfers | PharmaDist ERP",
  description: "Inter-warehouse stock transfer management and tracking",
};

export default async function StockTransfersPage() {
  const [transfersRes, warehousesRes] = await Promise.all([
    getStockTransfersAction(),
    getWarehousesAction(),
  ]);

  const transfers = transfersRes.data || [];
  const warehouses = (warehousesRes.data || []).filter((w) => w.isActive);

  return (
    <TransfersClient
      initialTransfers={transfers}
      warehouses={warehouses}
    />
  );
}
