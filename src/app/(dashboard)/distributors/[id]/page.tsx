import * as React from "react";
import { notFound } from "next/navigation";
import { getDistributorByIdAction } from "@/server/actions/distributor.actions";
import { getExpenseCategoriesAction } from "@/server/actions/expense.actions";
import { DistributorDetailsClient } from "./distributor-details-client";

export const dynamic = "force-dynamic";

export default async function DistributorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [distRes, catsRes] = await Promise.all([
    getDistributorByIdAction(id),
    getExpenseCategoriesAction(),
  ]);

  if (!distRes.success || !distRes.data) {
    notFound();
  }

  return (
    <DistributorDetailsClient
      distributor={distRes.data}
      expenseCategories={catsRes.data || []}
    />
  );
}
