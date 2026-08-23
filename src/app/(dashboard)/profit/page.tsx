import * as React from "react";
import { getProfitOverviewAction } from "@/server/actions/profit.actions";
import { ProfitClient } from "./profit-client";

export const dynamic = "force-dynamic";

export default async function ProfitPage({
  searchParams,
}: {
  searchParams: Promise<{
    preset?: string;
    start?: string;
    end?: string;
  }>;
}) {
  const params = await searchParams;
  const preset = params.preset || "this_month";

  const profitRes = await getProfitOverviewAction(preset, params.start, params.end);

  return <ProfitClient initialData={profitRes.data} />;
}
