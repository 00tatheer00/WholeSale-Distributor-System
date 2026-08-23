import * as React from "react";
import { getSuppliersAction } from "@/server/actions/supplier.actions";
import { SuppliersClient } from "./suppliers-client";

interface SuppliersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: "ALL" | "ACTIVE" | "INACTIVE";
    due?: "ALL" | "HAS_DUE" | "NO_DUE";
    sortBy?: "name" | "currentPayable" | "totalPurchases" | "createdAt";
    sortOrder?: "asc" | "desc";
    page?: string;
  }>;
}

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const statusFilter = resolvedParams.status || "ALL";
  const dueFilter = resolvedParams.due || "ALL";
  const sortBy = resolvedParams.sortBy || "name";
  const sortOrder = resolvedParams.sortOrder || "asc";
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;

  const result = await getSuppliersAction({
    search,
    statusFilter,
    dueFilter,
    sortBy,
    sortOrder,
    page,
    pageSize: 20,
  });

  return (
    <SuppliersClient
      initialData={
        result.data || {
          suppliers: [],
          totalCount: 0,
          totalPayableAmount: 0,
          totalPurchasedAmount: 0,
          activeCount: 0,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        }
      }
      currentParams={{
        search,
        status: statusFilter,
        due: dueFilter,
        sortBy,
        sortOrder,
        page,
      }}
    />
  );
}
