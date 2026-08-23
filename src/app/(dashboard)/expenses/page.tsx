import * as React from "react";
import { getExpensesAction, getExpenseCategoriesAction } from "@/server/actions/expense.actions";
import { ExpensesClient } from "./expenses-client";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    payment?: string;
    status?: string;
    start?: string;
    end?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [expensesRes, categoriesRes] = await Promise.all([
    getExpensesAction({
      search: params.search,
      categoryId: params.category,
      paymentMethod: (params.payment as any) || "ALL",
      statusFilter: (params.status as any) || "ALL",
      startDate: params.start,
      endDate: params.end,
      page,
      pageSize: 20,
    }),
    getExpenseCategoriesAction(),
  ]);

  return (
    <ExpensesClient
      initialData={expensesRes.data}
      categories={categoriesRes.data || []}
    />
  );
}
