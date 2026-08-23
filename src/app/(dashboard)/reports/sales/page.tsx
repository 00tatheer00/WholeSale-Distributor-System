import * as React from "react";
import { getSalesReportAction } from "@/server/actions/reports.actions";
import { getCustomersListAction } from "@/server/actions/customer.actions";
import { getDistributorsListAction } from "@/server/actions/distributor.actions";
import { SalesReportClient } from "./sales-report-client";

export const dynamic = "force-dynamic";

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{
    preset?: string;
    start?: string;
    end?: string;
    customer?: string;
    distributor?: string;
    status?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;

  const [salesReportRes, customersRes, distributorsRes] = await Promise.all([
    getSalesReportAction({
      preset: params.preset || "this_month",
      startDate: params.start,
      endDate: params.end,
      customerId: params.customer,
      distributorId: params.distributor,
      status: params.status,
      search: params.search,
    }),
    getCustomersListAction(),
    getDistributorsListAction(),
  ]);

  return (
    <SalesReportClient
      reportData={salesReportRes.data}
      customers={customersRes.data || []}
      distributors={distributorsRes.data || []}
    />
  );
}
