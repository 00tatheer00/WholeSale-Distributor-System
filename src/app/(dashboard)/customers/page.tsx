import * as React from "react";
import { getCustomersAction } from "@/server/actions/customer.actions";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    due?: string;
    page?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const result = await getCustomersAction({
    search: params.search,
    statusFilter: (params.status as any) || "ALL",
    typeFilter: (params.type as any) || "ALL",
    dueFilter: (params.due as any) || "ALL",
    sortBy: (params.sort as any) || "name",
    page,
    pageSize: 20,
  });

  return <CustomersClient initialData={result.data} />;
}
