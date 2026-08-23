import * as React from "react";
import { getInvoicesAction } from "@/server/actions/sales.actions";
import { getCustomersListAction } from "@/server/actions/customer.actions";
import { InvoicesClient } from "./invoices-client";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    customer?: string;
    status?: string;
    payment?: string;
    page?: string;
    sort?: string;
    start?: string;
    end?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [invoicesRes, customersRes] = await Promise.all([
    getInvoicesAction({
      search: params.search,
      customerId: params.customer,
      statusFilter: (params.status as any) || "ALL",
      paymentStatusFilter: (params.payment as any) || "ALL",
      startDate: params.start,
      endDate: params.end,
      sortBy: (params.sort as any) || "invoiceDate",
      page,
      pageSize: 20,
    }),
    getCustomersListAction(),
  ]);

  return (
    <InvoicesClient
      initialInvoicesData={invoicesRes.data}
      customers={customersRes.data || []}
    />
  );
}
