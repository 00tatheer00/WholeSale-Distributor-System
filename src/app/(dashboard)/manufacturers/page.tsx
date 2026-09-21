import * as React from "react";
import { getManufacturersAction } from "@/server/actions/manufacturer.actions";
import { ManufacturersClient } from "./manufacturers-client";

export const metadata = {
  title: "Manufacturers | PharmaDist ERP",
  description: "Pharmaceutical manufacturing companies and drug producers",
};

export default async function ManufacturersPage() {
  const result = await getManufacturersAction();
  const manufacturers = result.success && result.data ? result.data : [];

  return <ManufacturersClient initialManufacturers={manufacturers} />;
}
