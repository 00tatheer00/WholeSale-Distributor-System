import * as React from "react";
import { getCategoriesAction } from "@/server/actions/category.actions";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  const result = await getCategoriesAction();
  const categories = result.data || [];

  return <CategoriesClient initialCategories={categories} />;
}
