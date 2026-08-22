import * as React from "react";
import { getPaymentsAction } from "@/server/actions/payment.actions";
import { getCustomersAction } from "@/server/actions/customer.actions";
import { getDistributorsAction } from "@/server/actions/distributor.actions";
import { PaymentsClient } from "./payments-client";

export default async function PaymentsPage() {
  const [paymentsRes, customersRes, distributorsRes] = await Promise.all([
    getPaymentsAction(),
    getCustomersAction(),
    getDistributorsAction(),
  ]);

  return (
    <PaymentsClient
      initialPayments={paymentsRes.data || []}
      customers={customersRes.data || []}
      distributors={distributorsRes.data || []}
    />
  );
}
