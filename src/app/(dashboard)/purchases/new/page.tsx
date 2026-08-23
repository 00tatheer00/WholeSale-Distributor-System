import * as React from "react";
import { getPurchaseFormDataAction } from "@/server/actions/purchase.actions";
import { PurchaseFormClient } from "./purchase-form-client";

interface NewPurchasePageProps {
  searchParams: Promise<{
    supplierId?: string;
  }>;
}

export default async function NewPurchasePage({ searchParams }: NewPurchasePageProps) {
  const resolvedParams = await searchParams;
  const formDataRes = await getPurchaseFormDataAction();

  return (
    <PurchaseFormClient
      suppliers={formDataRes.data?.suppliers || []}
      medicines={formDataRes.data?.medicines || []}
      warehouses={formDataRes.data?.warehouses || []}
      preselectedSupplierId={resolvedParams.supplierId}
    />
  );
}
