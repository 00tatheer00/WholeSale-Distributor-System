import * as React from "react";
import { getSuppliersAction } from "@/server/actions/supplier.actions";
import { SuppliersClient } from "./suppliers-client";

export default async function SuppliersPage() {
  const suppliersRes = await getSuppliersAction();

  return <SuppliersClient initialSuppliers={suppliersRes.data || []} />;
}
