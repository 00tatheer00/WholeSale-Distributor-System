import * as React from "react";
import { getPurchasesAction, getPurchaseFormDataAction } from "@/server/actions/purchase.actions";
import { PurchasesClient } from "./purchases-client";

interface PurchasesPageProps {
  searchParams: Promise<{
    search?: string;
    supplierId?: string;
    paymentStatus?: "ALL" | "UNPAID" | "PARTIALLY_PAID" | "PAID";
    status?: "ALL" | "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
    startDate?: string;
    endDate?: string;
    sortBy?: "purchaseDate" | "grandTotal" | "purchaseNumber" | "paidAmount" | "dueAmount";
    sortOrder?: "asc" | "desc";
    page?: string;
  }>;
}

export default async function PurchasesPage({ searchParams }: PurchasesPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const supplierId = resolvedParams.supplierId || "ALL";
  const paymentStatus = resolvedParams.paymentStatus || "ALL";
  const status = resolvedParams.status || "ALL";
  const startDate = resolvedParams.startDate;
  const endDate = resolvedParams.endDate;
  const sortBy = resolvedParams.sortBy || "purchaseDate";
  const sortOrder = resolvedParams.sortOrder || "desc";
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;

  const [purchasesRes, formDataRes] = await Promise.all([
    getPurchasesAction({
      search,
      supplierId,
      paymentStatus,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      pageSize: 20,
    }),
    getPurchaseFormDataAction(),
  ]);

  return (
    <PurchasesClient
      initialData={
        purchasesRes.data || {
          purchases: [],
          totalCount: 0,
          totalGrandTotal: 0,
          totalPaidAmount: 0,
          totalDueAmount: 0,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        }
      }
      suppliers={formDataRes.data?.suppliers || []}
      currentParams={{
        search,
        supplierId,
        paymentStatus,
        status,
        startDate: startDate || "",
        endDate: endDate || "",
        sortBy,
        sortOrder,
        page,
      }}
    />
  );
}
