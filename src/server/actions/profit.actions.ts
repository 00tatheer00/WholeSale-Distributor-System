"use server";

import { getProfitOverview } from "@/server/services/profit.service";
import { ProfitOverviewData } from "@/types/models";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getProfitOverviewAction(
  preset: string = "this_month",
  customStart?: string,
  customEnd?: string
): Promise<ActionResult<ProfitOverviewData>> {
  try {
    const data = await getProfitOverview(preset, customStart, customEnd);
    return { success: true, data };
  } catch (error: any) {
    console.error("getProfitOverviewAction error:", error);
    return { success: false, error: "Failed to load profit and financial intelligence." };
  }
}
