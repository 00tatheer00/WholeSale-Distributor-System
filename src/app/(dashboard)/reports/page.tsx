import * as React from "react";
import { getReportsHubSummaryAction } from "@/server/actions/reports.actions";
import { ReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const res = await getReportsHubSummaryAction();

  return <ReportsClient summary={res.data} />;
}
