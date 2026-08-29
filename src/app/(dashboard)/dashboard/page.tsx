import * as React from "react";
import { getDashboardMetrics } from "@/server/services/dashboard.service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const initialData = await getDashboardMetrics("last_30_days");

  return <DashboardClient initialData={initialData} />;
}
