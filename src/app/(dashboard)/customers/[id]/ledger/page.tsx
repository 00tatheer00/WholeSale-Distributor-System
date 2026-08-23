import * as React from "react";
import { notFound } from "next/navigation";
import { getCustomerLedgerAction } from "@/server/actions/customer.actions";
import { CustomerLedgerClient } from "./customer-ledger-client";

export default async function CustomerLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id || id === "new") {
    notFound();
  }

  const res = await getCustomerLedgerAction(id);
  if (!res.success || !res.data || !res.data.customer) {
    notFound();
  }

  return (
    <CustomerLedgerClient
      customer={res.data.customer}
      ledger={res.data.ledger}
      summary={res.data.summary}
    />
  );
}
