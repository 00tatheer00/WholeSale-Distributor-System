import * as React from "react";
import { getDashboardDataAction } from "@/server/actions/dashboard.actions";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const result = await getDashboardDataAction("last_30_days");
  const initialData = result.data!;

  return <DashboardClient initialData={initialData} />;
}
