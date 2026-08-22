import * as React from "react";
import { getDistributorsAction } from "@/server/actions/distributor.actions";
import { DistributorsClient } from "./distributors-client";

export default async function DistributorsPage() {
  const distributorsRes = await getDistributorsAction();

  return <DistributorsClient initialDistributors={distributorsRes.data || []} />;
}
