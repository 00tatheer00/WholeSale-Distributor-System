import * as React from "react";
import { getCustomerDueReportAction } from "@/server/actions/reports.actions";
import { CustomerDuesClient } from "./customer-dues-client";

export const dynamic = "force-dynamic";

export default async function CustomerDuesReportPage() {
  const res = await getCustomerDueReportAction();

  return <CustomerDuesClient reportData={res.data} />;
}
