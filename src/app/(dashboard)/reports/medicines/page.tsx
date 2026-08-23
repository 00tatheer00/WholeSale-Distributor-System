import * as React from "react";
import { getMedicinePerformanceReportAction } from "@/server/actions/reports.actions";
import { MedicinesReportClient } from "./medicines-report-client";

export const dynamic = "force-dynamic";

export default async function MedicinesReportPage({
  searchParams,
}: {
  searchParams: Promise<{
    preset?: string;
    start?: string;
    end?: string;
  }>;
}) {
  const params = await searchParams;

  const res = await getMedicinePerformanceReportAction({
    preset: params.preset || "this_month",
    startDate: params.start,
    endDate: params.end,
  });

  return <MedicinesReportClient reportData={res.data} />;
}
