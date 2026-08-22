import * as React from "react";
import { getReportsSummaryAction } from "@/server/actions/reports.actions";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const reportsRes = await getReportsSummaryAction();
  const data = reportsRes.data!;

  return (
    <ReportsClient
      financials={data.financials}
      monthlyTrends={data.monthlyTrends}
      dueAging={data.dueAging}
    />
  );
}
