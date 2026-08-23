import * as React from "react";
import { getInvoicesAction } from "@/server/actions/sales.actions";
import { getCustomersListAction } from "@/server/actions/customer.actions";
import { getDistributorsAction } from "@/server/actions/distributor.actions";
import { getMedicinesAction } from "@/server/actions/medicine.actions";
import { getBatchesAction } from "@/server/actions/inventory.actions";
import { SalesClient } from "./sales-client";

export default async function SalesPage() {
  const [invoicesRes, customersRes, distributorsRes, medicinesRes, batchesRes] =
    await Promise.all([
      getInvoicesAction(),
      getCustomersListAction(),
      getDistributorsAction(),
      getMedicinesAction(),
      getBatchesAction(),
    ]);

  return (
    <SalesClient
      initialInvoices={invoicesRes.data || []}
      customers={customersRes.data || []}
      distributors={distributorsRes.data || []}
      medicines={medicinesRes.data || []}
      batches={batchesRes.data || []}
    />
  );
}
