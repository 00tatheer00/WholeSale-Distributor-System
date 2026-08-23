import * as React from "react";
import { getExpiryReportAction } from "@/server/actions/reports.actions";
import { ExpiryReportClient } from "./expiry-report-client";

export const dynamic = "force-dynamic";

export default async function ExpiryReportPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = params.days ? parseInt(params.days, 10) : 60;

  const res = await getExpiryReportAction(days);

  return <ExpiryReportClient reportData={res.data} />;
}
