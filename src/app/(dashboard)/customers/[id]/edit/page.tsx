import * as React from "react";
import { notFound } from "next/navigation";
import { getCustomerByIdAction } from "@/server/actions/customer.actions";
import { CustomerEditForm } from "./customer-edit-form";

export default async function CustomerEditPage({
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

  return <CustomerEditForm customer={res.data} />;
}
