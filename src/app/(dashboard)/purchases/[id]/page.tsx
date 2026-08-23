import * as React from "react";
import { notFound } from "next/navigation";
import { getPurchaseByIdAction } from "@/server/actions/purchase.actions";
import { PurchaseDetailClient } from "./purchase-detail-client";

interface PurchaseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  const resolvedParams = await params;
  const purchaseRes = await getPurchaseByIdAction(resolvedParams.id);

  if (!purchaseRes.success || !purchaseRes.data) {
    notFound();
  }

  return <PurchaseDetailClient purchase={purchaseRes.data} />;
}
