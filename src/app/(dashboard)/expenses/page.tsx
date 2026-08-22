import * as React from "react";
import { getExpensesAction, getExpenseCategoriesAction } from "@/server/actions/expense.actions";
import { ExpensesClient } from "./expenses-client";

export default async function ExpensesPage() {
  const [expensesRes, categoriesRes] = await Promise.all([
    getExpensesAction(),
    getExpenseCategoriesAction(),
  ]);

  return (
    <ExpensesClient
      initialExpenses={expensesRes.data || []}
      categories={categoriesRes.data || []}
    />
  );
}
