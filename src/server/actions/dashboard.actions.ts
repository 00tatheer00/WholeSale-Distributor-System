"use server";

import { ActionResult } from "./medicine.actions";
import { getDashboardMetrics } from "@/server/services/dashboard.service";
import { DateRangePreset, FullDashboardData } from "@/types/dashboard";

export async function getDashboardDataAction(
  preset: DateRangePreset = "last_30_days",
  customStart?: string,
  customEnd?: string
): Promise<ActionResult<FullDashboardData>> {
  try {
    const data = await getDashboardMetrics(preset, customStart, customEnd);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to aggregate dashboard metrics" };
  }
}
