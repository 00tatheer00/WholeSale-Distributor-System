import * as React from "react";
import { getCustomersAction } from "@/server/actions/customer.actions";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  const customersRes = await getCustomersAction();

  return <CustomersClient initialCustomers={customersRes.data || []} />;
}
