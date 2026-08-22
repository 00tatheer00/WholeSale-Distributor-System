import * as React from "react";
import { getPurchasesAction } from "@/server/actions/purchase.actions";
import { getSuppliersAction } from "@/server/actions/supplier.actions";
import { getMedicinesAction } from "@/server/actions/medicine.actions";
import { PurchasesClient } from "./purchases-client";

export default async function PurchasesPage() {
  const [purchasesRes, suppliersRes, medicinesRes] = await Promise.all([
    getPurchasesAction(),
    getSuppliersAction(),
    getMedicinesAction(),
  ]);

  return (
    <PurchasesClient
      initialPurchases={purchasesRes.data || []}
      suppliers={suppliersRes.data || []}
      medicines={medicinesRes.data || []}
    />
  );
}
