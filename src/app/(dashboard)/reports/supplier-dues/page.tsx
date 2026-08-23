import * as React from "react";
import { getSupplierDueReportAction } from "@/server/actions/reports.actions";
import { SupplierDuesClient } from "./supplier-dues-client";

export const dynamic = "force-dynamic";

export default async function SupplierDuesReportPage() {
  const res = await getSupplierDueReportAction();

  return <SupplierDuesClient reportData={res.data} />;
}
