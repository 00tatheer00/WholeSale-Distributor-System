import * as React from "react";
import { notFound } from "next/navigation";
import { getSaleByIdAction } from "@/server/actions/sales.actions";
import { SaleDetailsClient } from "./sale-details-client";

export const dynamic = "force-dynamic";

export default async function SaleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const saleRes = await getSaleByIdAction(id);

  if (!saleRes.success || !saleRes.data) {
    notFound();
  }

  return <SaleDetailsClient sale={saleRes.data} />;
}
