import * as React from "react";
import { getInvoicesAction } from "@/server/actions/sales.actions";
import { InvoicesClient } from "./invoices-client";

export default async function InvoicesPage() {
  const invoicesRes = await getInvoicesAction();

  return <InvoicesClient initialInvoices={invoicesRes.data || []} />;
}
