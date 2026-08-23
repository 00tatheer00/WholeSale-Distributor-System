import * as React from "react";
import { getInventoryReportAction } from "@/server/actions/reports.actions";
import { getCategoriesAction } from "@/server/actions/category.actions";
import { getSuppliersListAction } from "@/server/actions/supplier.actions";
import { InventoryReportClient } from "./inventory-report-client";

export const dynamic = "force-dynamic";

export default async function InventoryReportPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    supplier?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;

  const [invReportRes, catsRes, suppsRes] = await Promise.all([
    getInventoryReportAction({
      categoryId: params.category,
      supplierId: params.supplier,
      search: params.search,
    }),
    getCategoriesAction(),
    getSuppliersListAction(),
  ]);

  return (
    <InventoryReportClient
      reportData={invReportRes.data}
      categories={catsRes.data || []}
      suppliers={suppsRes.data || []}
    />
  );
}
