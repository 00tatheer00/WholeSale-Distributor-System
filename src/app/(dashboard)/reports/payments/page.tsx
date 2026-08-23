import * as React from "react";
import { getPaymentReportAction } from "@/server/actions/reports.actions";
import { PaymentsReportClient } from "./payments-report-client";

export const dynamic = "force-dynamic";

export default async function PaymentsReportPage({
  searchParams,
}: {
  searchParams: Promise<{
    preset?: string;
    start?: string;
    end?: string;
  }>;
}) {
  const params = await searchParams;

  const res = await getPaymentReportAction({
    preset: params.preset || "this_month",
    startDate: params.start,
    endDate: params.end,
  });

  return <PaymentsReportClient reportData={res.data} />;
}
