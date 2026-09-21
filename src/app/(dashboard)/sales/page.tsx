import * as React from "react";
import { getSalesAction } from "@/server/actions/sales.actions";
import { getCustomersListAction } from "@/server/actions/customer.actions";
import { getDistributorsListAction } from "@/server/actions/distributor.actions";
import { SalesClient } from "./sales-client";

export const dynamic = "force-dynamic";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    customer?: string;
    salesRep?: string;
    status?: string;
    payment?: string;
    delivery?: string;
    page?: string;
    sort?: string;
    start?: string;
    end?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [salesRes, customersRes, distributorsRes] = await Promise.all([
    getSalesAction({
      search: params.search,
      customerId: params.customer,
      distributorId: params.salesRep,
      statusFilter: (params.status as any) || "ALL",
      paymentStatusFilter: (params.payment as any) || "ALL",
      deliveryStatusFilter: (params.delivery as any) || "ALL",
      startDate: params.start,
      endDate: params.end,
      sortBy: (params.sort as any) || "saleDate",
      page,
      pageSize: 20,
    }),
    getCustomersListAction(),
    getDistributorsListAction(),
  ]);

  return (
    <SalesClient
      initialSalesData={salesRes.data}
      customers={customersRes.data || []}
      distributors={distributorsRes.data || []}
    />
  );
}
