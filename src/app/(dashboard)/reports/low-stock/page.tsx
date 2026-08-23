import * as React from "react";
import { getLowStockReportAction } from "@/server/actions/reports.actions";
import { LowStockReportClient } from "./low-stock-report-client";

export const dynamic = "force-dynamic";

export default async function LowStockReportPage() {
  const res = await getLowStockReportAction();

  return <LowStockReportClient reportData={res.data} />;
}
