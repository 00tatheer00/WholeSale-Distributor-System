import * as React from "react";
import { getInventoryAction, getInventorySummaryAction } from "@/server/actions/inventory.actions";
import { getCategoriesAction } from "@/server/actions/category.actions";
import { getSuppliersAction } from "@/server/actions/supplier.actions";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const [inventoryRes, summaryRes, categoriesRes, suppliersRes] = await Promise.all([
    getInventoryAction({ page: 1, pageSize: 20 }),
    getInventorySummaryAction(),
    getCategoriesAction(),
    getSuppliersAction(),
  ]);

  const items = inventoryRes.data || [];
  const summary = summaryRes.data || {
    totalInventoryItems: 0,
    totalStockUnits: 0,
    inventoryPurchaseValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    nearExpiryCount: 0,
    expiredCount: 0,
  };
  const categories = categoriesRes.data || [];
  const suppliers = suppliersRes.data || [];

  return (
    <InventoryClient
      initialItems={items}
      initialSummary={summary}
      categories={categories}
      suppliers={suppliers}
      totalCount={inventoryRes.totalCount || items.length}
      totalPages={inventoryRes.totalPages || 1}
      initialPage={1}
    />
  );
}
