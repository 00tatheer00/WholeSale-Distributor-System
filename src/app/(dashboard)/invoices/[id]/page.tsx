import * as React from "react";
import { notFound } from "next/navigation";
import { getInvoiceByIdAction } from "@/server/actions/sales.actions";
import { InvoiceDetailsClient } from "./invoice-details-client";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoiceRes = await getInvoiceByIdAction(id);

  if (!invoiceRes.success || !invoiceRes.data) {
    notFound();
  }

  return <InvoiceDetailsClient invoice={invoiceRes.data} />;
}
