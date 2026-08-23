import * as React from "react";
import { notFound } from "next/navigation";
import { getCustomerByIdAction } from "@/server/actions/customer.actions";
import { CustomerDetailsClient } from "./customer-details-client";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id || id === "new") {
    notFound();
  }

  const res = await getCustomerByIdAction(id);
  if (!res.success || !res.data) {
    notFound();
  }

  return <CustomerDetailsClient customer={res.data} />;
}
