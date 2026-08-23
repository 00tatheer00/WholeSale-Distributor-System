import * as React from "react";
import { getPaymentsAction } from "@/server/actions/payment.actions";
import { getCustomersListAction } from "@/server/actions/customer.actions";
import { getDistributorsAction } from "@/server/actions/distributor.actions";
import { PaymentsClient } from "./payments-client";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    customer?: string;
    method?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [paymentsRes, customersRes, distributorsRes] = await Promise.all([
    getPaymentsAction({
      search: params.search,
      customerId: params.customer,
      paymentMethod: (params.method as any) || "ALL",
      statusFilter: (params.status as any) || "ALL",
      page,
      pageSize: 20,
    }),
    getCustomersListAction(),
    getDistributorsAction(),
  ]);

  return (
    <PaymentsClient
      initialPaymentsData={paymentsRes.data}
      customers={customersRes.data || []}
      distributors={distributorsRes.data?.distributors || []}
    />
  );
}
