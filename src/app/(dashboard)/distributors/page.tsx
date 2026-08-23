import * as React from "react";
import { getDistributorsAction } from "@/server/actions/distributor.actions";
import { DistributorsClient } from "./distributors-client";

export const dynamic = "force-dynamic";

export default async function DistributorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    territory?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const res = await getDistributorsAction({
    search: params.search,
    statusFilter: (params.status as any) || "ALL",
    territory: params.territory,
    page,
    pageSize: 20,
  });

  return <DistributorsClient initialData={res.data} />;
}
