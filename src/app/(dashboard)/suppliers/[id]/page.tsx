import * as React from "react";
import { notFound } from "next/navigation";
import { getSupplierByIdAction } from "@/server/actions/supplier.actions";
import { SupplierDetailClient } from "./supplier-detail-client";

interface SupplierDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const resolvedParams = await params;
  const supplierRes = await getSupplierByIdAction(resolvedParams.id);

  if (!supplierRes.success || !supplierRes.data) {
    notFound();
  }

  return <SupplierDetailClient supplier={supplierRes.data} />;
}
