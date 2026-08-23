import * as React from "react";
import { getPurchaseReportAction } from "@/server/actions/reports.actions";
import { getSuppliersListAction } from "@/server/actions/supplier.actions";
import { PurchasesReportClient } from "./purchases-report-client";

export const dynamic = "force-dynamic";

export default async function PurchasesReportPage({
  searchParams,
}: {
  searchParams: Promise<{
    preset?: string;
    start?: string;
    end?: string;
    supplier?: string;
    status?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;

  const [purchaseReportRes, suppliersRes] = await Promise.all([
    getPurchaseReportAction({
      preset: params.preset || "this_month",
      startDate: params.start,
      endDate: params.end,
      supplierId: params.supplier,
      status: params.status,
      search: params.search,
    }),
    getSuppliersListAction(),
  ]);

  return (
    <PurchasesReportClient
      reportData={purchaseReportRes.data}
      suppliers={suppliersRes.data || []}
    />
  );
}
